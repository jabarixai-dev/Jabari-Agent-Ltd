import sanitizeHtml from "sanitize-html";

const allowedTags = [...sanitizeHtml.defaults.allowedTags, "img", "video", "source", "h1", "h2", "h3", "h4", "figure", "figcaption"];
const allowedAttributes: Record<string, string[]> = {
  ...sanitizeHtml.defaults.allowedAttributes,
  a: ["href", "name", "target", "rel", "title"],
  img: ["src", "alt", "title", "width", "height", "style"],
  video: ["src", "controls", "poster", "width", "height", "style"],
  source: ["src", "type"],
  p: ["style"], h1: ["style"], h2: ["style"], h3: ["style"], h4: ["style"],
};

export function sanitizeRichHtml(html: string | undefined | null): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags, allowedAttributes,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true) },
  });
}

export function RichContent({ html, className = "" }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }} />;
}

export function safeUrl(value: string | undefined | null): string {
  const url = (value || "").trim();
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol) ? url : "";
  } catch { return ""; }
}

export function SiteMedia({ url, type, alt = "" }: {
  url: string; type: "none" | "image" | "video"; alt?: string;
}) {
  const safe = safeUrl(url);
  if (!safe || type === "none") return null;
  if (type === "video") return <video className="cms-site-media" src={safe} controls preload="metadata" aria-label={alt || "Video"} />;
  return <img className="cms-site-media" src={safe} alt={alt} loading="lazy" />;
}
