import Image from 'next/image';
import { AGENT_DEFINITIONS } from '../../lib/agents/definitions';

export default function CommandCenter() {
  return <main className="command"><div className="command-grid">
    <aside className="sidebar"><div className="side-brand"><Image src="/brand/jabari-portrait.png" alt="Jabari" width={44} height={44}/><div><b>JABARI</b><div className="muted">Command Center</div></div></div><nav className="nav"><a className="active" href="/command">Overview</a><a href="#agents">Agents</a><a href="#missions">Missions</a><a href="#opportunities">Opportunities</a><a href="#revenue">Revenue</a><a href="#activity">Activity</a></nav></aside>
    <section className="main"><div className="topbar"><div><div className="eyebrow">Private</div><h2>Command Center</h2></div><div className="status">● SYSTEM READY</div></div>
      <div className="metrics"><div className="card metric"><small>Active Agents</small><b>{AGENT_DEFINITIONS.filter(a=>a.defaultStatus==='ready').length}</b></div><div className="card metric"><small>Open Missions</small><b>0</b></div><div className="card metric"><small>Opportunities</small><b>0</b></div><div className="card metric"><small>Pipeline</small><b>₦0</b></div></div>
      <section id="agents" className="card section"><h3>Agent Fleet</h3>{AGENT_DEFINITIONS.map(a=><div className="agent-row" key={a.id}><div className="agent-name"><span className="dot"/><div><b>{a.name}</b><div className="muted">{a.mission}</div></div></div><span className="badge">READY</span></div>)}</section>
      <section id="missions" className="card section"><h3>Mission Queue</h3><div className="muted">No missions yet. The orchestrator is ready to accept work.</div></section>
    </section>
  </div></main>;
}
