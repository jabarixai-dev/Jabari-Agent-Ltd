import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!process.env.DATABASE_URL) return new Response("DATABASE_URL is not configured", { status: 500 });
    const { id } = await context.params;
    const db = neon(process.env.DATABASE_URL);
    const rows = await db`SELECT mime_type, data FROM public_site_media WHERE id = ${id} LIMIT 1`;
    if (!rows.length) return new Response("Not found", { status: 404 });
    return new NextResponse(rows[0].data as BodyInit, {
      headers: {
        "Content-Type": String(rows[0].mime_type),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Media could not be loaded", { status: 500 });
  }
}
