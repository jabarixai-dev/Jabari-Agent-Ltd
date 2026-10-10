"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Mission = { id: string; name: string; objective: string; status: string; automation_mode: string };
type Agent = { id: string; name: string; status: string };
type Task = { id: string; title: string; description: string; type: string; status: string; agent_name?: string | null; mission_name?: string | null };
const fieldStyle: React.CSSProperties = { display:"block",width:"100%",marginTop:6,padding:12,background:"#111",color:"#fff",border:"1px solid #444",borderRadius:8 };
const labelStyle: React.CSSProperties = { display:"block",fontSize:14 };

export default function MissionManager() {
  const [key,setKey]=useState(""); const [unlocked,setUnlocked]=useState(false);
  const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [notice,setNotice]=useState("");
  const [missions,setMissions]=useState<Mission[]>([]); const [agents,setAgents]=useState<Agent[]>([]); const [tasks,setTasks]=useState<Task[]>([]);
  const [name,setName]=useState(""); const [objective,setObjective]=useState("");
  const [taskTitle,setTaskTitle]=useState(""); const [taskDescription,setTaskDescription]=useState("");
  const [agentId,setAgentId]=useState(""); const [missionId,setMissionId]=useState("");

  const request=useCallback(async(path:string,init:RequestInit={})=>{
    const response=await fetch(path,{...init,credentials:"same-origin",headers:{"Content-Type":"application/json",...(init.headers||{})}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||`Request failed (${response.status})`);
    return data;
  },[]);
  const refresh=useCallback(async()=>{
    const [md,td,ad]=await Promise.all([request("/api/missions"),request("/api/tasks"),request("/api/agents")]);
    setMissions(md.missions||[]); setTasks(td.tasks||[]);
    setAgents((ad.agents||[]).filter((a:Agent)=>a.status!=="disabled"&&a.status!=="paused"));
    setUnlocked(true); setError("");
  },[request]);
  useEffect(()=>{refresh().catch(()=>{});},[refresh]);

  async function login(e:FormEvent){e.preventDefault();setBusy(true);setError("");setNotice("");try{
    await request("/api/agents/session",{method:"POST",body:JSON.stringify({key})});setKey("");await refresh();setNotice("Mission and task controls unlocked.");
  }catch(e){setError(e instanceof Error?e.message:"Sign-in failed.");}finally{setBusy(false);}}
  async function createMission(e:FormEvent){e.preventDefault();setBusy(true);setError("");setNotice("");try{
    await request("/api/missions",{method:"POST",body:JSON.stringify({name,objective})});setName("");setObjective("");await refresh();setNotice("Mission saved as a draft. No agent has run yet.");
  }catch(e){setError(e instanceof Error?e.message:"Could not create mission.");}finally{setBusy(false);}}
  async function createTask(e:FormEvent){e.preventDefault();setBusy(true);setError("");setNotice("");try{
    const result=await request("/api/tasks",{method:"POST",body:JSON.stringify({title:taskTitle,description:taskDescription,agentId,missionId,type:"manual"})});
    setTaskTitle("");setTaskDescription("");await refresh();setNotice(result.message||"Task saved.");
  }catch(e){setError(e instanceof Error?e.message:"Could not queue task.");}finally{setBusy(false);}}

  return <section className="command-section" id="missions">
    <div className="section-heading"><div><p className="gold command-kicker">PLANNING & EXECUTION</p><h2>Missions & Tasks</h2></div><span className="section-count">{unlocked?`${missions.length} missions · ${tasks.length} tasks`:"Private access"}</span></div>
    {error&&<p role="alert" style={{color:"#ff8d8d"}}>{error}</p>}{notice&&<p role="status" style={{color:"#b9d99b"}}>{notice}</p>}
    {!unlocked?<form onSubmit={login} className="agent-form" style={{display:"grid",gap:12}}>
      <p className="command-muted">Use the same admin key as Agent Management. If you already signed in there, refresh this section after signing in.</p>
      <label style={labelStyle}>Admin access key<input type="password" autoComplete="current-password" value={key} onChange={e=>setKey(e.target.value)} required style={fieldStyle}/></label>
      <button disabled={busy} className="control-button">{busy?"Unlocking…":"Unlock mission controls"}</button>
    </form>:<>
      <div className="section-heading"><h3>Create a mission</h3><button type="button" className="control-button" disabled={busy} onClick={()=>refresh().catch(e=>setError(e.message))}>Refresh</button></div>
      <form onSubmit={createMission} className="agent-form" style={{display:"grid",gap:12}}>
        <label style={labelStyle}>Mission name<input value={name} onChange={e=>setName(e.target.value)} required maxLength={120} style={fieldStyle}/></label>
        <label style={labelStyle}>Objective<textarea value={objective} onChange={e=>setObjective(e.target.value)} required maxLength={2000} rows={3} style={fieldStyle}/></label>
        <button className="control-button" disabled={busy}>{busy?"Saving…":"Create draft mission"}</button>
      </form>
      <div className="agent-grid" style={{marginTop:20}}>
        {missions.map(m=><article className="command-card" key={m.id}><div className="card-topline"><span className="status-dot"/><small>{m.status} · {m.automation_mode}</small></div><h3>{m.name}</h3><p>{m.objective}</p><p className="command-muted">ID: {m.id}</p></article>)}
        {!missions.length&&<p className="command-muted">No missions yet. Create the first one above.</p>}
      </div>
      <div className="section-heading" style={{marginTop:32}}><h3>Assign a task</h3></div>
      <p className="command-muted">Tasks are stored as pending. The execution worker is not connected yet, so assigning a task does not mean the agent has performed it.</p>
      <form onSubmit={createTask} className="agent-form" style={{display:"grid",gap:12}}>
        <label style={labelStyle}>Task title<input value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} required maxLength={160} style={fieldStyle}/></label>
        <label style={labelStyle}>Task details<textarea value={taskDescription} onChange={e=>setTaskDescription(e.target.value)} maxLength={2000} rows={3} style={fieldStyle}/></label>
        <label style={labelStyle}>Mission<select value={missionId} onChange={e=>setMissionId(e.target.value)} required style={fieldStyle}><option value="">Select a mission</option>{missions.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
        <label style={labelStyle}>Agent<select value={agentId} onChange={e=>setAgentId(e.target.value)} required style={fieldStyle}><option value="">Select an agent</option>{agents.map(a=><option key={a.id} value={a.id}>{a.name} ({a.status})</option>)}</select></label>
        <button className="control-button" disabled={busy||!missions.length||!agents.length}>{busy?"Saving…":"Queue task"}</button>
      </form>
      <div className="section-heading" style={{marginTop:32}}><h3>Recent tasks</h3></div>
      <div className="agent-grid">
        {tasks.map(t=><article className="command-card" key={t.id}><div className="card-topline"><span className="status-dot"/><small>{t.status} · {t.type}</small></div><h3>{t.title}</h3><p>{t.description||"No extra details."}</p><p className="command-muted">Agent: {t.agent_name||"Unassigned"} · Mission: {t.mission_name||"Unknown"}</p><p className="command-muted">ID: {t.id}</p></article>)}
        {!tasks.length&&<p className="command-muted">No tasks have been queued yet.</p>}
      </div>
    </>}
  </section>;
}
