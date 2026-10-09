import Link from "next/link";
import { getPublicSiteContent } from "../lib/public-site/data";
import {
RichContent,
safeUrl,
} from "../lib/public-site/public-site-render";

function SocialIcon({ label }: { label: string }) {
const name = label.toLowerCase();

if (name.includes("whatsapp")) {
return (
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
<path d="M20.52 3.48A11.82 11.82 0 0 0 12.1 0C5.55 0 .22 5.33.22 11.88c0 2.09.55 4.13 1.6 5.93L.12 24l6.34-1.66a11.9 11.9 0 0 0 5.64 1.43h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.23-6.15-3.47-8.41ZM12.11 21.75a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.76.99 1-3.67-.24-.38a9.84 9.84 0 0 1-1.51-5.22c0-5.46 4.45-9.91 9.92-9.91 2.64 0 5.13 1.03 7 2.9a9.85 9.85 0 0 1 2.9 7c0 5.47-4.45 9.92-9.91 9.92Zm5.44-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
</svg>
);
}

if (name === "x" || name.includes("twitter")) {
return (
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
<path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.44L5.54 22H2.4l7.25-8.29L1.8 2h6.4l4.43 6.78L18.9 2Zm-1.1 18h1.73L7.28 3.89H5.42L17.8 20Z" />
</svg>
);
}

if (name.includes("telegram")) {
return (
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
<path d="M22.4 2.3a1.5 1.5 0 0 0-1.55-.22L2.1 9.47c-1.34.52-1.32 1.26-.24 1.6l4.83 1.51 1.84 5.75c.22.63.12.88.78.88.51 0 .74-.23 1.03-.5l2.34-2.27 4.87 3.6c.9.5 1.55.24 1.78-.84l3.2-15.1c.34-1.34-.5-1.95-1.13-1.8ZM8.2 12.23l10.73-6.77c.53-.32 1.02-.15.62.2l-8.87 8.01-.35 3.76-2.13-5.2Z" />
</svg>
);
}

if (name.includes("youtube")) {
return (
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
<path d="M23.5 6.2a3 3 0 0 0-2.11-2.12C19.53 3.57 12 3.57 12 3.57s-7.53 0-9.39.5A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.12c1.86.5 9.39.5 9.39.5s7.53 0 9.39-.5a3 3 0 0 0 2.11-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.6 15.58V8.42L15.82 12 9.6 15.58Z" />
</svg>
);
}

return <span className="social-fallback">{label}</span>;
}

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
<span key={"${copy}-${word}-${index}"}>
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
              <SocialIcon label={social.label} />
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
            <SocialIcon label={social.label} />
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
