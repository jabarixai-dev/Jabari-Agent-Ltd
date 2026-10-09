export type ContentBlock =
  | { id: string; type: "paragraph" | "heading"; html: string }
  | { id: string; type: "image" | "video"; url: string; alt?: string; caption?: string };

export type SiteItem = {
  id: string;
  title: string;
  descriptionHtml: string;
  linkText: string;
  url: string;
  linkMode: "text" | "url";
  mediaUrl: string;
  mediaType: "none" | "image" | "video";
  visible: boolean;
};

export type PublicSiteContent = {
  home: { headline: string; subtitle: string; introHtml: string; ticker: string; portraitUrl: string; socials: { label: string; url: string }[] };
  services: SiteItem[];
  projects: SiteItem[];
  about: { blocks: ContentBlock[]; linkText: string; url: string; linkMode: "text" | "url" };
};

export const defaultContent: PublicSiteContent = {
  home: {
    headline: "JABARI.",
    subtitle: "FOUNDER · BUILDER · OPERATOR",
    introHtml: "Building systems, products and opportunities that turn ideas into revenue.",
    ticker: "MARKETS, PSYCHOLOGY, AI, CULTURE",
    portraitUrl: "/brand/jabari-portrait.png",
    socials: [
      { label: "WhatsApp", url: "" }, { label: "X", url: "" },
      { label: "Telegram", url: "" }, { label: "YouTube", url: "" }
    ]
  },
  services: [],
  projects: [],
  about: {
    blocks: [{ id: "about-intro", type: "paragraph", html: "I’m Jabari — a founder, builder and operator focused on building systems, products and opportunities that turn ideas into revenue." }],
    linkText: "Read more",
    url: "",
    linkMode: "text"
  }
};
