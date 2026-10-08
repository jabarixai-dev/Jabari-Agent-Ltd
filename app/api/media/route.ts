import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 500 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image or video file." }, { status: 400 });
    if (!["image/jpeg","image/png","image/webp","image/gif","image/avif","video/mp4","video/webm","video/quicktime"].includes(file.type)) {
      return NextResponse.json({ error: "Supported formats: JPG, PNG, WEBP, GIF, AVIF, MP4, WEBM, MOV." }, { status: 415 });
    }
    const limit = file.type.startsWith("video/") ? 12 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > limit) return NextResponse.json({ error: file.type.startsWith("video/") ? "Videos must be 12 MB or smaller. For larger videos, paste a hosted video URL." : "Images must be 5 MB or smaller." }, { status: 413 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const id = randomUUID();
    const db = neon(process.env.DATABASE_URL);
    await db`INSERT INTO public_site_media (id, filename, mime_type, data, size_bytes) VALUES (${id}, ${file.name.slice(0, 250)}, ${file.type}, ${bytes}, ${file.size})`;
    return NextResponse.json({ url: `/api/media/${id}`, id, filename: file.name, mimeType: file.type, size: file.size });
  } catch (error) {
    console.error("Media upload failed", error);
    return NextResponse.json({ error: "Upload failed. Check the database migration and try a smaller file." }, { status: 500 });
  }
}
