import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAgentAdmin, isSameOrigin } from "../../../lib/agents/admin-auth";

export const runtime = "nodejs";
function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

export async function GET(request: NextRequest) {
  if (!isAgentAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const sql = db();
    const missions = await sql`SELECT id, COALESCE(name,title) AS name, COALESCE(objective,description) AS objective, status, COALESCE(automation_mode,'approval_required') AS automation_mode, created_at FROM public.missions ORDER BY created_at DESC LIMIT 100`;
    return NextResponse.json({ missions });
  } catch (error) {
    console.error("Mission list failed", error);
    return NextResponse.json({ error: "Could not load missions. Check DATABASE_URL and the existing missions table." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!isAgentAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body: unknown = await request.json();
    const data = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
    const name = typeof data.name === "string" ? data.name.trim() : "";
    const objective = typeof data.objective === "string" ? data.objective.trim() : "";
    if (!name || name.length > 120) return NextResponse.json({ error: "Mission name is required (maximum 120 characters)." }, { status: 400 });
    if (!objective || objective.length > 2000) return NextResponse.json({ error: "Objective is required (maximum 2,000 characters)." }, { status: 400 });
    const sql = db();
    const id = `mission_${crypto.randomUUID()}`;
    const rows = await sql`INSERT INTO public.missions (id,title,description,name,objective,status,priority,automation_mode,budget,created_at,updated_at) VALUES (${id},${name},${objective},${name},${objective},'draft','normal','approval_required','{}'::jsonb,NOW(),NOW()) RETURNING id, COALESCE(name,title) AS name, COALESCE(objective,description) AS objective, status, automation_mode, created_at`;
    return NextResponse.json({ mission: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Mission creation failed", error);
    return NextResponse.json({ error: "Could not create mission. Confirm the current Neon schema and DATABASE_URL." }, { status: 500 });
  }
}
