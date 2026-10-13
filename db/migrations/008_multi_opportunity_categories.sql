-- Extend discovery to review, website, and direct-commission leads.
ALTER TABLE public.discovery_records ADD COLUMN IF NOT EXISTS opportunity_category text NOT NULL DEFAULT 'car_property';
ALTER TABLE public.discovery_records DROP CONSTRAINT IF EXISTS discovery_records_intent_check;
ALTER TABLE public.discovery_records ADD CONSTRAINT discovery_records_intent_check CHECK (intent IN ('buyer','seller','lead'));
ALTER TABLE public.discovery_records DROP CONSTRAINT IF EXISTS discovery_records_asset_type_check;
ALTER TABLE public.discovery_records ADD CONSTRAINT discovery_records_asset_type_check CHECK (asset_type IN ('car','land','house','property','service','other'));
ALTER TABLE public.discovery_records DROP CONSTRAINT IF EXISTS discovery_records_opportunity_category_check;
ALTER TABLE public.discovery_records ADD CONSTRAINT discovery_records_opportunity_category_check CHECK (opportunity_category IN ('car_property','review','website','commission','other'));
CREATE INDEX IF NOT EXISTS discovery_records_category_idx ON public.discovery_records(opportunity_category, status, created_at DESC);
