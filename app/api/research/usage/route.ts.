import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAgentAdmin } from "../../../../lib/agents/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const DAILY_CAP = 5;
const MONTHLY_CAP = 110;

function dateKeys(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value])) as Record<string, string>;
  return {
    day: `serpapi:day:${values.year}-${values.month}-${values.day}`,
    month: `serpapi:month:${values.year}-${values.month}`,
    dayLabel: `${values.year}-${values.month}-${values.day}`,
    monthLabel: `${values.year}-${values.month}`,
  };
}

export async function GET(request: NextRequest) {
  if (!isAgentAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 503 });

  try {
    const sql = neon(databaseUrl);
    const keys = dateKeys();
    const rows = await sql`
      SELECT scope, count FROM public.api_usage_counters
      WHERE scope = ${keys.day} OR scope = ${keys.month}
    `;
    const counts = new Map<string, number>(rows.map((row) => [String(row.scope), Number(row.count) || 0]));
    const dailyUsed = counts.get(keys.day) ?? 0;
    const monthlyUsed = counts.get(keys.month) ?? 0;

    return NextResponse.json({
      timezone: "Africa/Lagos",
      period: { day: keys.dayLabel, month: keys.monthLabel },
      daily: { used: dailyUsed, limit: DAILY_CAP, remaining: Math.max(0, DAILY_CAP - dailyUsed), reached: dailyUsed >= DAILY_CAP },
      monthly: { used: monthlyUsed, limit: MONTHLY_CAP, remaining: Math.max(0, MONTHLY_CAP - monthlyUsed), reached: monthlyUsed >= MONTHLY_CAP },
      scope: "Counts searches routed through Jabari's protected SerpAPI endpoint only; this is not a live SerpAPI account-wide total.",
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("Could not read SerpAPI usage counters", error);
    return NextResponse.json({ error: "Could not read API usage counters. Confirm the database migration has been applied." }, { status: 500 });
  }
}
