import Link from "next/link";

const socials = [
  {
    label: "WhatsApp",
    className: "whatsapp",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 3.5A11.8 11.8 0 0 0 12.08 0C5.53 0 .2 5.33.2 11.88c0 2.1.55 4.15 1.6 5.96L.1 24l6.3-1.65a11.85 11.85 0 0 0 5.67 1.44h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.23-6.15-3.46-8.41ZM12.08 21.8h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.74.98 1-3.65-.23-.37a9.9 9.9 0 0 1-1.52-5.29C2.17 6.4 6.61 1.96 12.08 1.96a9.86 9.86 0 0 1 7.02 2.91 9.88 9.88 0 0 1 2.9 7.04c0 5.47-4.45 9.89-9.92 9.89Zm5.43-7.42c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/>
      </svg>
    ),
  },
  {
    label: "X",
    className: "x",
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.37l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.87h1.72L8.29 4.02H6.45L17.8 19.87Z"/></svg>,
  },
  {
    label: "Telegram",
    className: "telegram",
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21.7 3.36-3.2 15.1c-.24 1.07-.87 1.34-1.76.84l-4.85-3.57-2.34 2.25c-.26.26-.48.48-.98.48l.35-4.95 9.01-8.14c.39-.35-.08-.55-.61-.2L6.18 12.2 1.45 10.72c-1.03-.32-1.05-1.03.21-1.52L20.15 2.08c.86-.31 1.62.2 1.55 1.28Z"/></svg>,
  },
  {
    label: "YouTube",
    className: "youtube",
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.13-2.14C19.49 3.5 12 3.5 12 3.5s-7.49 0-9.37.56A3.02 3.02 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.13 2.14c1.88.56 9.37.56 9.37.56s7.49 0 9.37-.56a3.02 3.02 0 0 0 2.13-2.14A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.5 3.9-6.5 3.9Z"/></svg>,
  },
];

const links = [
  ["My Services", "/services"],
  ["My Projects", "/projects"],
  ["About Me", "/about"],
];

export default function Home() {
  return (
    <main className="public-home">
      <div className="ticker" aria-label="Topics">
        <div className="ticker-track">
          <div className="ticker-set"><span>•</span><span>MARKETS</span><span>•</span><span>PSYCHOLOGY</span><span>•</span><span>AI</span><span>•</span><span>CULTURE</span><span>•</span></div>
          <div className="ticker-set" aria-hidden="true"><span>•</span><span>MARKETS</span><span>•</span><span>PSYCHOLOGY</span><span>•</span><span>AI</span><span>•</span><span>CULTURE</span><span>•</span></div>
        </div>
      </div>

      <header className="site-header">
        <Link className="brand-wordmark" href="/">JABARI<span>.</span></Link>
        <Link className="home-link" href="/">HOME</Link>
      </header>

      <section className="hero">
        <div className="portrait-frame">
          <div className="portrait-glow" />
          <img src="/brand/jabari-portrait.png" alt="Jabari" className="portrait" />
        </div>

        <h1 className="hero-title">JABARI<span>.</span></h1>
        <p className="hero-subtitle">FOUNDER · BUILDER · OPERATOR</p>
        <p className="hero-copy">Building systems, products and opportunities that turn ideas into revenue.</p>

        <div className="social-row" aria-label="Social links">
          {socials.map((social) => (
            <a key={social.label} href="#" className={`social-button social-${social.className}`} aria-label={social.label}>
              {social.icon}
            </a>
          ))}
        </div>

        <nav className="link-grid" aria-label="Jabari links">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className="feature-link">{label}</Link>
          ))}
        </nav>

        <p className="hero-footer">JB · BUILT DIFFERENT</p>
      </section>
    </main>
  );
}
