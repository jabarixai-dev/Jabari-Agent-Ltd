import Link from "next/link";
import { getPublicSiteContent } from "../../lib/public-site/data";
import { RichContent, safeUrl, SiteMedia } from "../../lib/public-site/public-site-render";

export default async function ServicesPage() {
  const content = await getPublicSiteContent();
  const items = (content.services || []).filter((item) => item.visible);
  return <main className="public-page"><div className="ticker"><span>•</span><span>{content.home.ticker || "MARKETS · PSYCHOLOGY · AI · CULTURE"}</span></div>
    <header className="site-header"><Link className="brand-wordmark" href="/">{content.home.headline || "JABARI."}</Link><Link className="home-link" href="/">HOME</Link></header>
    <section className="page-content"><p className="page-kicker">JABARI</p><h1 className="page-title">MY SERVICES</h1>
      <div className="cms-public-list">{items.length ? items.map((item) => { const href = safeUrl(item.url); return <article className="cms-public-card" key={item.id}>
        <h2>{item.title}</h2><RichContent html={item.descriptionHtml} className="cms-rich-content page-copy"/><SiteMedia url={item.mediaUrl} type={item.mediaType} alt={item.title}/>
        {href && <a className="back-link cms-item-link" href={href} target={href.startsWith("/") ? undefined : "_blank"} rel={href.startsWith("/") ? undefined : "noopener noreferrer"}>{item.linkMode === "url" ? href : (item.linkText || "Learn more")}</a>}
      </article>; }) : <p className="page-copy">Services will be added here soon.</p>}</div>
      <Link className="back-link" href="/">← BACK HOME</Link></section></main>;
}
