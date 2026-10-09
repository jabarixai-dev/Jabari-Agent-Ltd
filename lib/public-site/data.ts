import { neon } from "@neondatabase/serverless";
import { defaultContent, type PublicSiteContent } from "./types";

export async function getPublicSiteContent(): Promise<PublicSiteContent> {
  if (!process.env.DATABASE_URL) return defaultContent;
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT content FROM public_site_content WHERE id = 'main' LIMIT 1`;
    const saved = rows[0]?.content as Partial<PublicSiteContent> | undefined;
    if (!saved || typeof saved !== "object") return defaultContent;
    return {
      ...defaultContent,
      ...saved,
      home: { ...defaultContent.home, ...(saved.home ?? {}), socials: saved.home?.socials ?? defaultContent.home.socials },
      services: Array.isArray(saved.services) ? saved.services : defaultContent.services,
      projects: Array.isArray(saved.projects) ? saved.projects : defaultContent.projects,
      about: { ...defaultContent.about, ...(saved.about ?? {}), blocks: saved.about?.blocks ?? defaultContent.about.blocks }
    };
  } catch (error) {
    console.error("Falling back to default public site content", error);
    return defaultContent;
  }
}
