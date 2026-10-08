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
        <h1 className="page-title">MY SERVICES</h1>
        <p className="page-copy">I help turn serious ideas and opportunities into clear strategy, useful systems and real execution. <strong>Work With Me</strong> is where we can discuss your project and decide how to move forward.</p>
        <Link className="back-link" href="/">← BACK HOME</Link>
      </section>
    </main>
  );
}
