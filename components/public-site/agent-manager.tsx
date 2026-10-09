"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
type Agent={id:string;name:string;mission:string;status:"idle"|"running"|"paused"|"disabled";capabilities:string[];instructions:string;is_system:boolean};
export default function AgentManager(){
 const [agents,setAgents]=useState<Agent[]>([]); const [key,setKey]=useState(""); const [loggedIn,setLoggedIn]=useState(false);
 const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [notice,setNotice]=useState("");
 const [name,setName]=useState(""); const [mission,setMission]=useState(""); const [instructions,setInstructions]=useState(""); const [capabilities,setCapabilities]=useState("research");
 const request=useCallback(async(path:string,init:RequestInit={})=>{const res=await fetch(path,{...init,credentials:"same-origin",headers:{"Content-Type":"application/json",...(init.headers||{})}});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||`Request failed (${res.status})`);return data;},[]);
 const refresh=useCallback(async()=>{const data=await request("/api/agents");setAgents(data.agents);setLoggedIn(true);setError("");},[request]);
 useEffect(()=>{refresh().catch(()=>{});},[refresh]);
 async function login(e:FormEvent){e.preventDefault();setBusy(true);setError("");try{await request("/api/agents/session",{method:"POST",body:JSON.stringify({key})});setKey("");await refresh();setNotice("Signed in to agent management.");}catch(e){setError(e instanceof Error?e.message:"Sign-in failed.");}finally{setBusy(false);}}
 async function logout(){await request("/api/agents/session",{method:"DELETE"}).catch(()=>{});setLoggedIn(false);setAgents([]);setNotice("Signed out.");}
 async function create(e:FormEvent){e.preventDefault();setBusy(true);setError("");setNotice("");try{await request("/api/agents",{method:"POST",body:JSON.stringify({name,mission,instructions,capabilities:capabilities.split(",").map(x=>x.trim()).filter(Boolean)})});setName("");setMission("");setInstructions("");setCapabilities("research");await refresh();setNotice("Agent configuration created. It is stored but may need an execution adapter before it can perform tasks.");}catch(e){setError(e instanceof Error?e.message:"Could not create agent.");}finally{setBusy(false);}}
 async function setStatus(agent:Agent,status:Agent["status"]){setBusy(true);setError("");try{await request(`/api/agents/${encodeURIComponent(agent.id)}`,{method:"PATCH",body:JSON.stringify({status})});await refresh();setNotice(`${agent.name}: ${status}.`);}catch(e){setError(e instanceof Error?e.message:"Could not update status.");}finally{setBusy(false);}}
 return <section className="command-section" id="agents">
  <div className="section-heading"><div><p className="gold command-kicker">WORKERS</p><h2>Agent Management</h2></div><span className="section-count">{loggedIn?`${agents.length} configured`:"Private access"}</span></div>
  {error&&<p role="alert" style={{color:"#ff8d8d"}}>{error}</p>}{notice&&<p role="status" style={{color:"#b9d99b"}}>{notice}</p>}
  {!loggedIn?<form onSubmit={login} className="agent-form"><p className="command-muted">Enter the JABARI_ADMIN_API_KEY configured in Netlify. The key is exchanged for a short-lived HttpOnly session cookie.</p><label>Admin access key<input type="password" autoComplete="current-password" value={key} onChange={e=>setKey(e.target.value)} required style={fieldStyle}/></label><button disabled={busy} className="control-button">{busy?"Signing in…":"Unlock agent management"}</button></form>:
  <>
   <div className="section-heading"><h3>Create an agent</h3><button type="button" className="control-button" onClick={logout}>Sign out</button></div>
   <form onSubmit={create} className="agent-form" style={{display:"grid",gap:12}}>
    <label>Name<input value={name} onChange={e=>setName(e.target.value)} required maxLength={100} style={fieldStyle}/></label>
    <label>Mission<textarea value={mission} onChange={e=>setMission(e.target.value)} required maxLength={500} rows={2} style={fieldStyle}/></label>
    <label>Instructions<textarea value={instructions} onChange={e=>setInstructions(e.target.value)} maxLength={8000} rows={4} style={fieldStyle}/></label>
    <label>Capabilities (comma-separated)<input value={capabilities} onChange={e=>setCapabilities(e.target.value)} placeholder="research, qualification" style={fieldStyle}/></label>
    <button disabled={busy} className="control-button">{busy?"Saving…":"Create agent"}</button>
   </form>
   <div className="agent-grid" style={{marginTop:24}}>{agents.map(agent=><article className="command-card" key={agent.id}>
    <div className="card-topline"><span className="status-dot"/><small>{agent.status}{agent.is_system?" · built-in":" · custom"}</small></div><h3>{agent.name}</h3><p>{agent.mission}</p><p className="command-muted">ID: {agent.id}</p><p className="command-muted">Capabilities: {agent.capabilities?.join(", ")||"None"}</p>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{agent.status!=="paused"&&agent.status!=="disabled"&&<button className="control-button" disabled={busy} onClick={()=>setStatus(agent,"paused")}>Pause</button>}{agent.status==="paused"&&<button className="control-button" disabled={busy} onClick={()=>setStatus(agent,"idle")}>Resume</button>}{agent.status!=="disabled"&&<button className="control-button" disabled={busy} onClick={()=>setStatus(agent,"disabled")}>Disable</button>}</div>
   </article>)}</div>
  </>}
 </section>
}
const fieldStyle:React.CSSProperties={display:"block",width:"100%",marginTop:6,padding:12,background:"#111",color:"#fff",border:"1px solid #444",borderRadius:8};
