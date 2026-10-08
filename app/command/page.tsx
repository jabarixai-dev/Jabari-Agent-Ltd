import Link from "next/link";
import { getAgentDefinitions } from "../../lib/agents/agent-registry";

const sections = [
  ["Overview", "/command"],
  ["Agents", "/command#agents"],
  ["Missions", "/command#missions"],
  ["Prospects", "/command#prospects"],
  ["Opportunities", "/command#opportunities"],
  ["Conversations", "/command#conversations"],
  ["Deals", "/command#deals"],
  ["Revenue", "/command#revenue"],
  ["Activity", "/command#activity"],
];

export default function Command() {
  const agents = getAgentDefinitions();

  return (
    <main className="command-shell">
      <header className="command-header">
        <div>
          <p className="gold command-kicker">PRIVATE COMMAND CENTER</p>
          <h1>Jabari Revenue OS</h1>
          <p className="command-subtitle">One operator • Autonomous agents • Shared revenue state</p>
        </div>
        <Link className="command-home" href="/">PUBLIC SITE</Link>
      </header>

      <nav className="command-nav" aria-label="Command Center sections">
        {sections.map(([label, href]) => (
          <a key={label} href={href}>{label}</a>
        ))}
      </nav>

      <section className="command-section" id="agents">
        <div className="section-heading">
          <div>
            <p className="gold command-kicker">WORKERS</p>
            <h2>Agents</h2>
          </div>
          <span className="section-count">{agents.length} configured</span>
        </div>
        <div className="agent-grid">
          {agents.map((agent) => (
            <article className="command-card" key={agent.id}>
              <div className="card-topline">
                <span className="status-dot" />
                <small>{agent.status}</small>
              </div>
              <h3>{agent.name}</h3>
              <p>{agent.mission}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="command-section public-site-panel">
        <div className="section-heading">
          <div>
            <p className="gold command-kicker">CONTROL</p>
            <h2>Public Site</h2>
          </div>
          <Link className="control-button" href="/command/public-site">OPEN EDITOR</Link>
        </div>
        <p className="command-muted">Manage the public website from this private control center. Add, edit and remove your Home, Services, Projects and About Me content without touching code.</p>
        <div className="public-site-links">
          <Link href="/command/public-site#home">Home</Link>
          <Link href="/command/public-site#services">Services</Link>
          <Link href="/command/public-site#projects">Projects</Link>
          <Link href="/command/public-site#about">About Me</Link>
        </div>
      </section>

      <section className="command-section command-placeholder" id="missions"><h2>Missions</h2><p>Mission controls will connect here next.</p></section>
      <section className="command-section command-placeholder" id="prospects"><h2>Prospects</h2><p>Prospect pipeline will connect here next.</p></section>
      <section className="command-section command-placeholder" id="opportunities"><h2>Opportunities</h2><p>Opportunity pipeline will connect here next.</p></section>
      <section className="command-section command-placeholder" id="conversations"><h2>Conversations</h2><p>Conversation controls will connect here next.</p></section>
      <section className="command-section command-placeholder" id="deals"><h2>Deals</h2><p>Deal controls will connect here next.</p></section>
      <section className="command-section command-placeholder" id="revenue"><h2>Revenue</h2><p>Revenue reporting will connect here next.</p></section>
      <section className="command-section command-placeholder" id="activity"><h2>Activity</h2><p>Agent activity and audit events will connect here next.</p></section>
    </main>
  );
}
