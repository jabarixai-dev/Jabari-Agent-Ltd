import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAgentAdmin, isSameOrigin } from "../../../../lib/agents/admin-auth";

export const runtime = "nodejs";
export const maxDuration = 15;

const MONTHLY_APP_CAP = 110;
const DAILY_CAP = 5;
const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}
function lagosDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value])) as Record<string, string>;
}
function monthKey(date = new Date()) {
  const parts = lagosDateParts(date);
  return `serpapi:month:${parts.year}-${parts.month}`;
}
function dayKey(date = new Date()) {
  const parts = lagosDateParts(date);
  return `serpapi:day:${parts.year}-${parts.month}-${parts.day}`;
}
async function reserve(sql: ReturnType<typeof neon>, key: string, limit: number) {
  const rows = await sql`
    INSERT INTO public.api_usage_counters (scope, count, updated_at)
    VALUES (${key}, 1, NOW())
    ON CONFLICT (scope) DO UPDATE
      SET count = public.api_usage_counters.count + 1, updated_at = NOW()
      WHERE public.api_usage_counters.count < ${limit}
    RETURNING count
  `;
  return rows.length ? Number(rows[0].count) : null;
}
async function releaseReservation(sql: ReturnType<typeof neon>, key: string) {
  await sql`
    UPDATE public.api_usage_counters
    SET count = GREATEST(count - 1, 0), updated_at = NOW()
    WHERE scope = ${key}
  `;
}
export async function GET(request: NextRequest) {
  if (!isAgentAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const query = (request.nextUrl.searchParams.get("q") || "").trim();
  if (!query) return NextResponse.json({ error: "Add a search query using ?q=..." }, { status: 400 });
  if (query.length > 220) return NextResponse.json({ error: "Search query is too long (max 220 characters)." }, { status: 400 });
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "SERPAPI_API_KEY is not configured." }, { status: 503 });
  try {
    const sql = db();
    const currentDayKey = dayKey();
    const currentMonthKey = monthKey();

    // Reserve daily first so a daily-cap rejection cannot consume a monthly slot.
    const dayCount = await reserve(sql, currentDayKey, DAILY_CAP);
    if (dayCount === null) return NextResponse.json({ error: `Daily app safety cap reached (${DAILY_CAP}). Try again tomorrow.` }, { status: 429 });

    const monthCount = await reserve(sql, currentMonthKey, MONTHLY_APP_CAP);
    if (monthCount === null) {
      // Return the daily slot if the monthly cap blocks this request.
      await releaseReservation(sql, currentDayKey);
      return NextResponse.json({ error: `Monthly app safety cap reached (${MONTHLY_APP_CAP}). Search blocked.` }, { status: 429 });
    }

    const params = new URLSearchParams({ engine: "google", q: query, api_key: apiKey, output: "json", num: "10" });
    const upstream = await fetch(`${SERPAPI_ENDPOINT}?${params.toString()}`, {
      headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(10000)
    });
    const payload = await upstream.json().catch(() => ({})) as Record<string, any>;
    if (!upstream.ok || payload.error) {
      console.error("SerpAPI request failed", { status: upstream.status, error: payload.error || "Upstream error" });
      return NextResponse.json({ error: "SerpAPI search failed. The local reservation remains counted to avoid unsafe retries." }, { status: 502 });
    }
    const results = Array.isArray(payload.organic_results) ? payload.organic_results.slice(0, 10).map((item: any) => ({
      title: typeof item.title === "string" ? item.title : "",
      link: typeof item.link === "string" ? item.link : "",
      snippet: typeof item.snippet === "string" ? item.snippet : "",
      displayed_link: typeof item.displayed_link === "string" ? item.displayed_link : ""
    })) : [];
    await sql`
      INSERT INTO public.activity_events
        (id, event_type, entity_type, entity_id, description, metadata, actor_type, actor_id, payload, created_at)
      VALUES (
        ${`event_${crypto.randomUUID()}`}, 'serpapi_search', 'api_usage', ${currentMonthKey},
        ${`SerpAPI search completed: ${query.slice(0, 120)}`},
        ${JSON.stringify({ query, results: results.length, monthlyAppSearchesUsed: monthCount, dailySearchesUsed: dayCount })}::jsonb,
        'system', 'serpapi-budget-guard',
        ${JSON.stringify({ query, results: results.length, monthlyAppSearchesUsed: monthCount, dailySearchesUsed: dayCount })}::jsonb,
        NOW()
      )
    `;
    return NextResponse.json({
      query, results,
      usage: {
        monthlyAppSearchesUsed: monthCount, monthlyAppSearchCap: MONTHLY_APP_CAP,
        dailySearchesUsed: dayCount, dailySearchCap: DAILY_CAP,
        note: "App-local counter only; not a live reading of SerpAPI account usage."
      }
    });
  } catch (error) {
    console.error("Protected SerpAPI search failed", error);
    return NextResponse.json({ error: "Search could not complete. Check database connectivity and api_usage_counters table." }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  return GET(request);
}
