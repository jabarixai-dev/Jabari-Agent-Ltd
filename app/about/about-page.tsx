import Link from "next/link";
import { getPublicSiteContent } from "../../lib/public-site/data";
import { RichContent, safeUrl, SiteMedia } from "../../lib/public-site/public-site-render";

export default async function AboutPage() {
  const content = await getPublicSiteContent();
  const about = content.about;
  const href = safeUrl(about.url);
  return <main className="public-page"><div className="ticker"><span>•</span><span>{content.home.ticker || "MARKETS · PSYCHOLOGY · AI · CULTURE"}</span></div>
    <header className="site-header"><Link className="brand-wordmark" href="/">{content.home.headline || "JABARI."}</Link><Link className="home-link" href="/">HOME</Link></header>
    <section className="page-content"><p className="page-kicker">JABARI</p><h1 className="page-title">ABOUT ME</h1>
      <div className="cms-about-content">{(about.blocks || []).map((block) => {
        if (block.type === "heading" || block.type === "paragraph") return <RichContent key={block.id} html={block.html} className={block.type === "heading" ? "cms-about-heading" : "cms-rich-content page-copy"} />;
        if (block.type === "image" || block.type === "video") return <SiteMedia key={block.id} url={block.url} type={block.type} alt={block.alt || ""} />;
        return null;
      })}</div>
      {href && <a className="back-link cms-item-link" href={href} target={href.startsWith("/") ? undefined : "_blank"} rel={href.startsWith("/") ? undefined : "noopener noreferrer"}>{about.linkMode === "url" ? href : (about.linkText || "Read more")}</a>}
      <Link className="back-link" href="/">← BACK HOME</Link></section></main>;
}
