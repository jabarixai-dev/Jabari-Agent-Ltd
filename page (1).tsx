import Image from 'next/image';

const links = [
  ['Jabari Assistant', 'AI systems, automation & revenue infrastructure', '#'],
  ['Work With Me', 'Projects, systems and collaborations', '#'],
  ['My Projects', 'Things I am building', '#'],
  ['Content', 'Ideas, lessons and founder notes', '#'],
  ['X / Twitter', 'Follow the journey', '#'],
  ['Contact', 'Start a conversation', '#'],
];

export default function Home() {
  return <main className="shell"><div className="container">
    <section className="hero">
      <Image className="brand-mark" src="/brand/jabari-portrait.png" alt="Jabari" width={84} height={84} priority />
      <div className="eyebrow">Brave · Fearless · Focused</div>
      <h1>JABARI</h1>
      <p>Founder. Builder. Operator. Building different systems for turning opportunities into revenue.</p>
    </section>
    <section className="links" aria-label="Jabari links">
      {links.map(([title,desc,href]) => <a className="link-card" href={href} key={title}><div><strong>{title}</strong><span>{desc}</span></div><div className="arrow">↗</div></a>)}
    </section>
    <div className="footer">JB · BUILT DIFFERENT</div>
  </div></main>;
}
