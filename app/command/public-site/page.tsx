"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { defaultContent, type PublicSiteContent, type SiteItem } from "../../../lib/public-site/types";

type EditorProps = { value: string; onChange: (html: string) => void; placeholder: string };

function RichEditor({ value, onChange, placeholder }: EditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value; }, [value]);
  const command = (name: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(name, false, arg);
    onChange(ref.current?.innerHTML || "");
  };
  const addLink = () => {
    if (!linkUrl.trim()) return;
    command("createLink", linkUrl.trim());
    setLinkUrl("");
  };
  const addInlineMedia = (kind: "image" | "video") => {
    const url = mediaUrl.trim();
    if (!url) return;
    ref.current?.focus();
    const safeUrl = url.replace(/"/g, "%22");
    document.execCommand("insertHTML", false, kind === "image"
      ? `<img src="${safeUrl}" alt="" style="max-width:100%;height:auto;border-radius:10px" />`
      : `<video src="${safeUrl}" controls style="max-width:100%;height:auto;border-radius:10px"></video>`);
    onChange(ref.current?.innerHTML || "");
    setMediaUrl("");
  };
  return <div className="cms-rich-wrap">
    <div className="cms-toolbar">
      <button type="button" onClick={() => command("bold")}><b>B</b></button>
      <button type="button" onClick={() => command("italic")}><i>I</i></button>
      <button type="button" onClick={() => command("formatBlock", "h3")}>Heading</button>
      <button type="button" onClick={() => command("formatBlock", "p")}>Paragraph</button>
      <button type="button" onClick={() => command("insertUnorderedList")}>• List</button>
      <button type="button" onClick={() => command("unlink")}>Remove link</button>
    </div>
    <div className="cms-link-tools">
      <input aria-label="Selected text link URL" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="URL for selected text (https://…)" />
      <button type="button" onClick={addLink}>LINK SELECTED TEXT</button>
    </div>
    <div className="cms-link-tools">
      <input aria-label="Inline media URL" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="Image/video URL, or upload below and paste its URL" />
      <button type="button" onClick={() => addInlineMedia("image")}>INSERT IMAGE</button>
      <button type="button" onClick={() => addInlineMedia("video")}>INSERT VIDEO</button>
    </div>
    <div ref={ref} className="cms-rich-editor" contentEditable suppressContentEditableWarning data-placeholder={placeholder}
      onInput={e => onChange(e.currentTarget.innerHTML)} />
    <p className="cms-help">Select words to link them. To add media inline, upload it in the media field below or paste a hosted URL, then insert it above.</p>
  </div>;
}

function MediaFields({ url, type, onUrl, onType }: { url: string; type: "none" | "image" | "video"; onUrl: (v:string)=>void; onType:(v:"none"|"image"|"video")=>void }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true); setMessage("");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/media", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      onUrl(result.url); onType(file.type.startsWith("video/") ? "video" : "image");
      setMessage(`Uploaded: ${file.name}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed"); }
    finally { setUploading(false); }
  }
  return <div className="cms-media-fields">
    <label>Media type<select value={type} onChange={e => onType(e.target.value as "none"|"image"|"video")}><option value="none">No media</option><option value="image">Image</option><option value="video">Video</option></select></label>
    <label className="cms-file-label">Upload image/video<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime" onChange={e => upload(e.target.files?.[0])} disabled={uploading} /></label>
    <label className="cms-full">Or paste a media URL<input value={url} onChange={e => onUrl(e.target.value)} placeholder="https://… or /api/media/…" /></label>
    {uploading && <p className="cms-help">Uploading to database…</p>}
    {message && <p className="cms-help">{message}</p>}
    {url && type === "image" && <img className="cms-media-preview" src={url} alt="Media preview" />}
    {url && type === "video" && <video className="cms-media-preview" src={url} controls />}
  </div>;
}

function ItemEditor({ item, onChange, onRemove }: { item: SiteItem; onChange:(patch:Partial<SiteItem>)=>void; onRemove:()=>void }) {
  return <article className="cms-item">
    <div className="cms-item-heading"><strong>{item.title || "New item"}</strong><button type="button" className="danger-button" onClick={onRemove}>REMOVE</button></div>
    <label>Title<input value={item.title} onChange={e=>onChange({title:e.target.value})} placeholder="Service or project title" /></label>
    <label>Description / content<RichEditor value={item.descriptionHtml} onChange={descriptionHtml=>onChange({descriptionHtml})} placeholder="Write the description. Link any selected words." /></label>
    <div className="cms-form-grid">
      <label>Link Text<input value={item.linkText} onChange={e=>onChange({linkText:e.target.value})} placeholder="e.g. View project / Work with me" /></label>
      <label>Destination URL<input value={item.url} onChange={e=>onChange({url:e.target.value})} placeholder="https://example.com" /></label>
      <label>Link display<select value={item.linkMode} onChange={e=>onChange({linkMode:e.target.value as "text"|"url"})}><option value="text">Clickable text</option><option value="url">Show naked URL</option></select></label>
      <label className="cms-checkbox"><input type="checkbox" checked={item.visible} onChange={e=>onChange({visible:e.target.checked})} /> Visible on public site</label>
    </div>
    <MediaFields url={item.mediaUrl} type={item.mediaType} onUrl={mediaUrl=>onChange({mediaUrl})} onType={mediaType=>onChange({mediaType})} />
  </article>;
}

function freshItem(): SiteItem {
  return { id: crypto.randomUUID(), title:"", descriptionHtml:"", linkText:"Learn more", url:"", linkMode:"text", mediaUrl:"", mediaType:"none", visible:true };
}

export default function PublicSitePage() {
  const [content, setContent] = useState<PublicSiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    fetch("/api/public-site").then(async r => {
      const data = await r.json();
      if (r.ok && data) setContent({ ...defaultContent, ...data, home:{...defaultContent.home,...data.home}, about:{...defaultContent.about,...data.about} });
      else if (!r.ok) setNotice(data.error || "Could not load saved content.");
    }).catch(() => setNotice("Could not connect to the database.")).finally(() => setLoading(false));
  }, []);
  const patchHome = (patch: Partial<PublicSiteContent["home"]>) => setContent(c=>({...c,home:{...c.home,...patch}}));
  const patchAbout = (patch: Partial<PublicSiteContent["about"]>) => setContent(c=>({...c,about:{...c.about,...patch}}));
  const patchItem = (section:"services"|"projects", id:string, patch:Partial<SiteItem>) => setContent(c=>({...c,[section]:c[section].map(item=>item.id===id?{...item,...patch}:item)}));
  async function save() {
    setSaving(true); setNotice("");
    try {
      const response = await fetch("/api/public-site", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(content) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed");
      setNotice("Saved. Your public site content is now stored in Neon.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Save failed"); }
    finally { setSaving(false); }
  }
  return <main className="admin-shell cms-shell">
    <header className="admin-header"><div><p className="gold command-kicker">PRIVATE CONTROL CENTER</p><h1>Public Site CMS</h1><p>Edit text, links, images and videos without touching code.</p></div><Link className="command-home" href="/command">← COMMAND CENTER</Link></header>
    {loading && <p className="cms-notice">Loading saved content…</p>}
    <section className="editor-card"><div className="editor-card-title"><h2>Home</h2><span>Public homepage</span></div>
      <div className="cms-form-grid">
        <label>Headline<input value={content.home.headline} onChange={e=>patchHome({headline:e.target.value})}/></label>
        <label>Subtitle<input value={content.home.subtitle} onChange={e=>patchHome({subtitle:e.target.value})}/></label>
        <label className="cms-full">Intro / paragraph<RichEditor value={content.home.introHtml} onChange={introHtml=>patchHome({introHtml})} placeholder="Write your intro. Select any words to add a link."/></label>
        <label className="cms-full">Ticker words (comma separated)<input value={content.home.ticker} onChange={e=>patchHome({ticker:e.target.value})}/></label>
        <label className="cms-full">Portrait image URL<input value={content.home.portraitUrl} onChange={e=>patchHome({portraitUrl:e.target.value})} placeholder="/brand/jabari-portrait.png or uploaded media URL"/></label>
      </div>
      <h3>Social links</h3><div className="cms-form-grid">{content.home.socials.map((social,i)=><div className="cms-social-fields" key={social.label}><label>{social.label} URL<input value={social.url} onChange={e=>patchHome({socials:content.home.socials.map((s,j)=>j===i?{...s,url:e.target.value}:s)})} placeholder="https://…"/></label></div>)}</div>
      <MediaFields url={content.home.portraitUrl} type="image" onUrl={portraitUrl=>patchHome({portraitUrl})} onType={()=>{}}/>
    </section>
    {(["services","projects"] as const).map(section=><section className="editor-card" id={section} key={section}>
      <div className="editor-card-title"><h2>{section==="services"?"Services":"Projects"}</h2><span>{content[section].length} items</span></div>
      <p>Add a separate Link Text and URL for every service or project. Paragraphs support links within the text.</p>
      {content[section].map(item=><ItemEditor key={item.id} item={item} onChange={patch=>patchItem(section,item.id,patch)} onRemove={()=>setContent(c=>({...c,[section]:c[section].filter(x=>x.id!==item.id)}))}/>)}
      <button type="button" className="control-button" onClick={()=>setContent(c=>({...c,[section]:[...c[section],freshItem()]}))}>+ ADD {section==="services"?"SERVICE":"PROJECT"}</button>
    </section>)}
    <section className="editor-card" id="about"><div className="editor-card-title"><h2>About Me</h2><span>Rich content</span></div>
      {content.about.blocks.map((block,i)=><div className="cms-item" key={block.id}>
        <div className="cms-item-heading"><strong>Content block {i+1}</strong><button type="button" className="danger-button" onClick={()=>patchAbout({blocks:content.about.blocks.filter(b=>b.id!==block.id)})}>REMOVE</button></div>
        <label>Block type<select value={block.type} onChange={e=>patchAbout({blocks:content.about.blocks.map(b=>b.id===block.id?({...b,type:e.target.value as "paragraph"|"heading"}):b)})}><option value="paragraph">Paragraph</option><option value="heading">Heading</option></select></label>
        {"html" in block && <RichEditor value={block.html} onChange={html=>patchAbout({blocks:content.about.blocks.map(b=>b.id===block.id?({...b,html}):b)})} placeholder="Write here and add links to selected words."/>}
      </div>)}
      <div className="cms-button-row"><button type="button" className="control-button" onClick={()=>patchAbout({blocks:[...content.about.blocks,{id:crypto.randomUUID(),type:"paragraph",html:""}]})}>+ ADD PARAGRAPH</button><button type="button" className="control-button" onClick={()=>patchAbout({blocks:[...content.about.blocks,{id:crypto.randomUUID(),type:"heading",html:""}]})}>+ ADD HEADING</button></div>
      <div className="cms-form-grid"><label>Link Text<input value={content.about.linkText} onChange={e=>patchAbout({linkText:e.target.value})}/></label><label>Destination URL<input value={content.about.url} onChange={e=>patchAbout({url:e.target.value})}/></label><label>Link display<select value={content.about.linkMode} onChange={e=>patchAbout({linkMode:e.target.value as "text"|"url"})}><option value="text">Clickable text</option><option value="url">Show naked URL</option></select></label></div>
    </section>)}
    <div className="cms-sticky-save"><button className="save-button" type="button" onClick={save} disabled={saving}>{saving?"SAVING…":"SAVE ALL CHANGES"}</button>{notice&&<p className="cms-notice" role="status">{notice}</p>}</div>
    <p className="admin-note">Uploaded media is stored in Neon. Image limit: 5 MB. Video limit: 12 MB; larger video files should use a hosted URL.</p>
  </main>;
}
