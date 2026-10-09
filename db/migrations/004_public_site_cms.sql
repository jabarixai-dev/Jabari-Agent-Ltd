-- Public Site CMS: content is stored as JSONB; uploaded media is stored in Postgres.
-- Media limits in the API are intentionally small because database bytea is not a bulk video store.
CREATE TABLE IF NOT EXISTS public_site_content (
  id text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_site_media (
  id uuid PRIMARY KEY,
  filename text NOT NULL,
  mime_type text NOT NULL,
  data bytea NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS public_site_media_created_at_idx ON public_site_media (created_at DESC);
INSERT INTO public_site_content (id, content)
VALUES ('main', '{"home":{"headline":"JABARI.","subtitle":"FOUNDER · BUILDER · OPERATOR","introHtml":"Building systems, products and opportunities that turn ideas into revenue.","ticker":"MARKETS, PSYCHOLOGY, AI, CULTURE","portraitUrl":"/brand/jabari-portrait.png","socials":[{"label":"WhatsApp","url":""},{"label":"X","url":""},{"label":"Telegram","url":""},{"label":"YouTube","url":""}]},"services":[],"projects":[],"about":{"blocks":[{"id":"about-intro","type":"paragraph","html":"I’m Jabari — a founder, builder and operator focused on building systems, products and opportunities that turn ideas into revenue."}],"linkText":"Read more","url":"","linkMode":"text"}}'::jsonb)
ON CONFLICT (id) DO NOTHING;
