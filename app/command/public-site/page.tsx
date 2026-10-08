"use client";

import Link from "next/link";
import { useState } from "react";

type LinkMode = "text" | "url";

type Item = { title: string; description: string; url: string; linkMode: LinkMode };

const starter: Item = { title: "", description: "", url: "", linkMode: "text" };

function EditorCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="editor-card"><div className="editor-card-title"><h2>{title}</h2><span>Editable</span></div>{children}</section>;
}

function CollectionEditor({ label }: { label: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const add = () => setItems((current) => [...current, { ...starter }]);
  const update = (index: number, patch: Partial<Item>) => setItems((current) => current.map((item, i) => i === index ? { ...item, ...patch } : item));
  const remove = (index: number) => setItems((current) => current.filter((_, i) => i !== index));

  return <div className="collection-editor">
    <div className="editor-row-header"><p>Add, edit or remove {label.toLowerCase()}.</p><button type="button" onClick={add}>+ ADD {label.toUpperCase().slice(0, -1)}</button></div>
    {items.length === 0 ? <div className="empty-editor">No {label.toLowerCase()} added yet.</div> : items.map((item, index) => <div className="editable-item" key={index}>
      <input value={item.title} onChange={(e) => update(index, { title: e.target.value })} placeholder="Title" />
      <textarea value={item.description} onChange={(e) => update(index, { description: e.target.value })} placeholder="Description" rows={3} />
      <input value={item.url} onChange={(e) => update(index, { url: e.target.value })} placeholder="https://example.com" />
      <select value={item.linkMode} onChange={(e) => update(index, { linkMode: e.target.value as LinkMode })}>
        <option value="text">Show clickable text</option>
        <option value="url">Show naked URL</option>
      </select>
      <button className="danger-button" type="button" onClick={() => remove(index)}>REMOVE</button>
    </div>)}
    <button className="save-button" type="button">SAVE {label.toUpperCase()}</button>
  </div>;
}

export default function PublicSitePage() {
  return <main className="admin-shell">
    <header className="admin-header">
      <div><p className="gold command-kicker">PRIVATE CONTROL CENTER</p><h1>Public Site</h1><p>Manage your public-facing content without touching code.</p></div>
      <Link className="command-home" href="/command">← COMMAND CENTER</Link>
    </header>

    <EditorCard title="Home"><div className="form-grid">
      <label>Headline<input placeholder="JABARI." /></label>
      <label>Subtitle<input placeholder="DIGITAL CREATOR · TECHNICAL WRITER" /></label>
      <label className="full">Main text<textarea placeholder="Your homepage description" rows={4} /></label>
      <label className="full">Ticker words<input placeholder="MARKETS, PSYCHOLOGY, AI, CULTURE" /></label>
    </div><button className="save-button" type="button">SAVE HOME</button></EditorCard>

    <div id="services"><EditorCard title="Services"><CollectionEditor label="Services" /></EditorCard></div>
    <div id="projects"><EditorCard title="Projects"><CollectionEditor label="Projects" /></EditorCard></div>

    <div id="about"><EditorCard title="About Me"><div className="form-grid">
      <label className="full">About Me<textarea placeholder="Write your About Me content here..." rows={10} /></label>
      <label className="full">Link URL<input placeholder="https://example.com" /></label>
      <label>Link display<select defaultValue="text"><option value="text">Clickable text</option><option value="url">Naked URL</option></select></label>
      <label>Link text<input placeholder="Read more" /></label>
    </div><button className="save-button" type="button">SAVE ABOUT ME</button></EditorCard></div>

    <p className="admin-note">This is the control interface. The next connection is to persist these fields in Neon and make the public pages read from them.</p>
  </main>;
}
