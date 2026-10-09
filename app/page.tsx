
import Link from "next/link";
import { getPublicSiteContent } from "../lib/public-site/data";
import {
  RichContent,
  safeUrl,
} from "../lib/public-site/public-site-render";

export default async function Home() {
  const content = await getPublicSiteContent();
  const home = content.home;
  const headline = home.headline || "JABARI.";

  const tickerWords = (
    home.ticker || "MARKETS, PSYCHOLOGY, AI, CULTURE"
  )
    .split(/[,·|]+/)
    .map((word) => word.trim())
    .filter(Boolean);

  const socials = home.socials || [];

  return (
    <main className="public-home">
      <div className="ticker" aria-label="Topics">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <div
              className="ticker-set"
              aria-hidden={copy === 1}
              key={copy}
            >
              {tickerWords.map((word, index) => (
                <span key={`${copy}-${word}-${index}`}>
                  {index > 0 && (
                    <span aria-hidden="true"> • </span>
                  )}
                  {word}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header className="site-header">
        <Link className="brand-wordmark" href="/">
          {headline}
        </Link>
        <Link className="home-link" href="/">
          HOME
        </Link>
      </header>

      <section className="hero">
        {home.portraitUrl && (
          <div className="portrait-frame">
            <div className="portrait-glow" />
            <img
              src={
                safeUrl(home.portraitUrl) ||
                "/brand/jabari-portrait.png"
              }
              alt={headline}
              className="portrait"
            />
          </div>
        )}

        <h1 className="hero-title">{headline}</h1>

        {home.subtitle && (
          <p className="hero-subtitle">{home.subtitle}</p>
        )}

        <RichContent
          html={home.introHtml}
          className="hero-copy cms-rich-content"
        />

        <div className="social-row" aria-label="Social links">
          {socials.map((social, index) => {
            const href = safeUrl(social.url);
            const className = `social-button social-${social.label
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")}`;

            if (!href) {
              return (
                <span
                  key={`${social.label}-${index}`}
                  className={className}
                  aria-label={social.label}
                  aria-disabled="true"
                >
                  <span>{social.label}</span>
                </span>
              );
            }

            const external = /^https?:\/\//i.test(href);

            return (
              <a
                key={`${social.label}-${index}`}
                href={href}
                className={className}
                aria-label={social.label}
                target={external ? "_blank" : undefined}
                rel={
                  external
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                <span>{social.label}</span>
              </a>
            );
          })}
        </div>

        <nav className="link-grid" aria-label="Jabari links">
          <Link href="/services" className="feature-link">
            My Services
          </Link>
          <Link href="/projects" className="feature-link">
            My Projects
          </Link>
          <Link href="/about" className="feature-link">
            About Me
          </Link>
        </nav>

        <p className="hero-footer">JB · BUILT DIFFERENT</p>
      </section>
    </main>
  );
}
