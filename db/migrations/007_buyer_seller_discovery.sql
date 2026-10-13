-- Additive buyer/seller discovery records and match history.
-- Apply this migration in Neon before deploying the matching API.
CREATE TABLE IF NOT EXISTS public.discovery_records (
  id text PRIMARY KEY,
  intent text NOT NULL CHECK (intent IN ('buyer','seller')),
  asset_type text NOT NULL CHECK (asset_type IN ('car','land','house','property')),
  title text NOT NULL,
  contact_name text,
  business_name text,
  phone text,
  email text,
  location text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  make_model text,
  property_type text,
  price_min numeric(14,2),
  price_max numeric(14,2),
  currency text NOT NULL DEFAULT 'NGN',
  source_url text NOT NULL,
  source_excerpt text NOT NULL DEFAULT '',
  verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified','evidence_found','manually_verified','stale','rejected')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','paused','matched','closed','rejected')),
  notes text NOT NULL DEFAULT '',
  discovered_at timestamptz NOT NULL DEFAULT now(),
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (price_min IS NULL OR price_min >= 0),
  CHECK (price_max IS NULL OR price_max >= 0),
  CHECK (price_min IS NULL OR price_max IS NULL OR price_max >= price_min)
);
CREATE INDEX IF NOT EXISTS discovery_records_intent_asset_idx ON public.discovery_records(intent, asset_type, status);
CREATE INDEX IF NOT EXISTS discovery_records_location_idx ON public.discovery_records(state, location);
CREATE INDEX IF NOT EXISTS discovery_records_source_idx ON public.discovery_records(source_url);
CREATE TABLE IF NOT EXISTS public.discovery_matches (
  id text PRIMARY KEY,
  buyer_id text NOT NULL REFERENCES public.discovery_records(id) ON DELETE CASCADE,
  seller_id text NOT NULL REFERENCES public.discovery_records(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  rationale jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'suggested'
    CHECK (status IN ('suggested','reviewed','introduced','declined','deal_created')),
  opportunity_id text REFERENCES public.opportunities(id) ON DELETE SET NULL,
  deal_id text REFERENCES public.deals(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (buyer_id, seller_id)
);
CREATE INDEX IF NOT EXISTS discovery_matches_score_idx ON public.discovery_matches(score DESC, created_at DESC);
