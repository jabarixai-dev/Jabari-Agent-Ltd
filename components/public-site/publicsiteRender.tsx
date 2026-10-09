import sanitizeHtml from "sanitize-html";

const richTextOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "h4",
    "ul", "ol", "li", "blockquote", "a", "img", "video", "source"
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height"],
    video: ["src", "controls", "poster", "width", "height", "preload"],
    source: ["src", "type"],
    "*": ["class"]
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"], video: ["http", "https"], source: ["http", "https"] },
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }, true)
  }
};

export function cleanRichHtml(html: string | null | undefined): string {
  return sanitizeHtml(typeof html === "string" ? html : "", richTextOptions);
}

export function safeUrl(value: string | null | undefined): string {
  const url = (value ?? "").trim();
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol) ? url : "";
  } catch {
    return "";
  }
}

export function RichContent({ html, className }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: cleanRichHtml(html) }} />;
}

export function SiteMedia({ url, type, alt = "" }: { url?: string; type?: string; alt?: string }) {
  const source = safeUrl(url);
  if (!source) return null;
  if (type === "image") return <img className="cms-public-media" src={source} alt={alt} loading="lazy" />;
  if (type === "video") return <video className="cms-public-media" src={source} controls preload="metadata" />;
  return null;
}
