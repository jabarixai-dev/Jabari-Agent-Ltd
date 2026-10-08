import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
const sql = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
};

export async function GET() {
  try {
    const db = sql();
    const rows = await db`SELECT content FROM public_site_content WHERE id = 'main' LIMIT 1`;
    return NextResponse.json(rows[0]?.content ?? null);
  } catch (error) {
    console.error("Public site read failed", error);
    return NextResponse.json({ error: "Could not load public site content. Apply the migration and check DATABASE_URL." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Expected a content object." }, { status: 400 });
    }
    const serialized = JSON.stringify(body);
    if (serialized.length > 900_000) {
      return NextResponse.json({ error: "Content is too large. Upload media separately and use its returned URL." }, { status: 413 });
    }
    const db = sql();
    await db`
      INSERT INTO public_site_content (id, content, updated_at)
      VALUES ('main', ${serialized}::jsonb, NOW())
      ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
    `;
    return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Public site save failed", error);
    return NextResponse.json({ error: "Could not save. Confirm the migration is applied and DATABASE_URL is set." }, { status: 500 });
  }
}
