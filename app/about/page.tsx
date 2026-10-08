import Link from "next/link";

export default function Page() {
  return (
    <main className="public-page">
      <div className="ticker"><span>•</span><span>MARKETS</span><span>•</span><span>PSYCHOLOGY</span><span>•</span><span>AI</span><span>•</span><span>CULTURE</span><span>•</span></div>
      <header className="site-header">
        <Link className="brand-wordmark" href="/">JABARI<span>.</span></Link>
        <Link className="home-link" href="/">HOME</Link>
      </header>
      <section className="page-content">
        <p className="page-kicker">JABARI</p>
        <h1 className="page-title">ABOUT ME</h1>
        <p className="page-copy">I’m Jabari — a founder, builder and operator focused on building systems, products and opportunities that turn ideas into revenue.</p>
        <Link className="back-link" href="/">← BACK HOME</Link>
      </section>
    </main>
  );
}
