import Link from "next/link";
import PipelineManager from "../../components/command/pipeline-manager";

const cards = [
  { title: "Agents", description: "Create, pause and manage your agents.", href: "/command/agents", icon: "◈" },
  { title: "Missions & Tasks", description: "Queue research work and review task results.", href: "/command/missions", icon: "⌁" },
  { title: "Prospects & Pipeline", description: "Manage prospects, opportunities, conversations and deals.", href: "/command/pipeline", icon: "◎" },
  { title: "Activity", description: "Review recent changes recorded by the system.", href: "/command/activity", icon: "↻" },
  { title: "API Usage", description: "Monitor daily and monthly research limits.", href: "/command/api-usage", icon: "▤" },
  { title: "Public Site Editor", description: "Update the public website content.", href: "/command/public-site", icon: "↗" },
];

export default function CommandOverview() {
  return <div className="command-overview">
    <header className="command-page-heading">
      <p className="gold command-kicker">PRIVATE WORKSPACE</p>
      <h1>Command Center</h1>
      <p className="command-muted">Your revenue, agents, research and business operations in one place.</p>
    </header>

    <section className="command-revenue-overview">
      <p className="gold command-kicker">YOUR REVENUE</p>
      <h2>Revenue overview</h2>
      <p className="command-muted">Review recorded payments and add revenue without leaving your main dashboard.</p>
      <PipelineManager section="revenue" />
    </section>

    <section className="command-overview-rest">
      <p className="gold command-kicker">WORKSPACE</p>
      <h2>Everything else</h2>
      <div className="command-overview-grid">{cards.map(c=><Link key={c.href} href={c.href} className="command-overview-card"><span className="command-overview-icon">{c.icon}</span><h3>{c.title}</h3><p>{c.description}</p><span className="command-overview-open">OPEN SECTION ↗</span></Link>)}</div>
    </section>

    <style>{`.command-page-heading h1{font-size:clamp(30px,5vw,44px);margin:4px 0 8px}.command-revenue-overview{margin-top:22px;padding:18px;border:1px solid #655022;border-radius:14px;background:linear-gradient(145deg,#100f0c,#0b0b09)}.command-revenue-overview>h2,.command-overview-rest>h2{font-size:22px;margin:4px 0 8px}.command-revenue-overview>.command-section{margin-top:12px}.command-overview-rest{margin-top:28px}.command-overview-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:18px 0}.command-overview-card{display:block;padding:20px;border:1px solid #30291c;border-radius:14px;background:linear-gradient(145deg,#100f0c,#0b0b09);text-decoration:none;min-height:155px}.command-overview-card:hover{border-color:#8c702c}.command-overview-icon{display:grid;place-items:center;width:39px;height:39px;border:1px solid #655022;border-radius:10px;color:#d5b657;font-size:24px}.command-overview-card h3{font-size:19px;margin:14px 0 8px}.command-overview-card p{color:#aaa397;font:13px/1.6 Arial,sans-serif}.command-overview-open{display:block;color:#d0b45d;font:10px Arial,sans-serif;letter-spacing:.12em;margin-top:14px}@media(max-width:520px){.command-overview-grid{grid-template-columns:1fr;gap:10px}.command-overview-card{min-height:0;padding:16px}.command-overview-card h3{margin-top:12px}.command-revenue-overview{padding:13px}}`}</style>
  </div>;
}
