import Link from "next/link";
import AgentManager from "../../components/command/agent-manager";
import ApiUsagePanel from "../../components/command/api-usage-panel";
import MissionManager from "../../components/command/mission-manager";
import PipelineManager from "../../components/command/pipeline-manager";

const cards = [
  { title: "Agents", description: "Create, pause and manage your agents.", href: "/command/agents", icon: "◈" },
  { title: "Missions & Tasks", description: "Queue research work and review task results.", href: "/command/missions", icon: "⌁" },
  { title: "Prospects & Pipeline", description: "Manage prospects, opportunities, conversations, deals and revenue.", href: "/command/pipeline", icon: "◎" },
  { title: "API Usage", description: "Monitor daily and monthly research limits.", href: "/command/api-usage", icon: "▤" },
  { title: "Public Site Editor", description: "Update the public website content.", href: "/command/public-site", icon: "↗" },
];

export default function CommandOverview() {
  return <div className="command-overview">
    <header className="command-page-heading"><p className="gold command-kicker">PRIVATE WORKSPACE</p><h1>Command Center</h1><p className="command-muted">Your agents, research and revenue operations in one place.</p></header>
    <div className="command-overview-grid">{cards.map(c=><Link key={c.href} href={c.href} className="command-overview-card"><span className="command-overview-icon">{c.icon}</span><h2>{c.title}</h2><p>{c.description}</p><span className="command-overview-open">OPEN SECTION ↗</span></Link>)}</div>
    <section className="command-section"><p className="gold command-kicker">QUICK STATUS</p><h2>Workspace summary</h2><p className="command-muted">The live agent, task, API usage and pipeline panels are available on their own pages. Use the navigation above to open the section you need.</p></section>
    <style>{`.command-page-heading h1{font-size:clamp(30px,5vw,44px);margin:4px 0 8px}.command-overview-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:24px 0}.command-overview-card{display:block;padding:20px;border:1px solid #30291c;border-radius:14px;background:linear-gradient(145deg,#100f0c,#0b0b09);text-decoration:none;min-height:175px}.command-overview-card:hover{border-color:#8c702c}.command-overview-icon{display:grid;place-items:center;width:39px;height:39px;border:1px solid #655022;border-radius:10px;color:#d5b657;font-size:24px}.command-overview-card h2{font-size:20px;margin:16px 0 8px}.command-overview-card p{color:#aaa397;font:13px/1.6 Arial,sans-serif}.command-overview-open{display:block;color:#d0b45d;font:10px Arial,sans-serif;letter-spacing:.12em;margin-top:16px}.command-overview .command-section{margin-top:24px}@media(max-width:520px){.command-overview-grid{grid-template-columns:1fr;gap:10px}.command-overview-card{min-height:0;padding:16px}.command-overview-card h2{margin-top:12px}}`}</style>
  </div>;
}
