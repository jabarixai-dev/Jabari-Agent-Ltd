-- Additive migration: dynamic agent definitions. Existing rows and IDs are preserved.
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS instructions TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE;

INSERT INTO agents (id, name, mission, status, automation_mode, capabilities, config, instructions, is_system)
VALUES
('website-hunter','Website Hunter','Find businesses with weak, outdated or conversion-poor websites.','idle','approval_required','["web-research","prospect-discovery"]'::jsonb,'{}'::jsonb,'Research businesses whose websites appear outdated, weak, or conversion-poor. Return evidence and source URLs; do not contact prospects.',TRUE),
('review-hunter','Review Hunter','Find businesses showing customer-experience opportunities through public reviews.','idle','approval_required','["review-research","prospect-discovery"]'::jsonb,'{}'::jsonb,'Research public reviews to identify recurring customer-experience issues. Cite sources and do not contact businesses.',TRUE),
('social-hunter','Social Hunter','Find businesses with weak or inconsistent social presence.','idle','approval_required','["social-research","prospect-discovery"]'::jsonb,'{}'::jsonb,'Review publicly available social presence for consistency and opportunity. Cite sources and do not message accounts.',TRUE),
('market-hunter','Market Hunter','Discover emerging markets, niches and commercial opportunities.','idle','approval_required','["market-research","opportunity-discovery"]'::jsonb,'{}'::jsonb,'Research market and niche opportunities using credible sources. Return evidence, assumptions, and confidence.',TRUE),
('lead-researcher','Lead Researcher','Enrich promising prospects and turn discoveries into qualified opportunities.','idle','approval_required','["research","qualification"]'::jsonb,'{}'::jsonb,'Enrich prospect records using permitted public information and qualify fit against supplied criteria. Cite sources.',TRUE),
('sales-agent','Sales Agent','Execute approved sales actions and move qualified opportunities forward.','idle','approval_required','["sales","opportunity-management"]'::jsonb,'{}'::jsonb,'Prepare sales actions for qualified opportunities. Do not send messages, make commitments, or change deal stages without explicit approval.',TRUE),
('follow-up-agent','Follow-up Agent','Re-engage active opportunities according to approved follow-up rules.','idle','approval_required','["follow-up","opportunity-management"]'::jsonb,'{}'::jsonb,'Draft follow-ups for active opportunities according to approved rules. Do not send messages without explicit approval.',TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS agents_created_at_idx ON agents (created_at DESC);
