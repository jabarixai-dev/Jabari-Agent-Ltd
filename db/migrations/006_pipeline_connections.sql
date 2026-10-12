-- Additive Control Center tables for conversations, deals and recorded income.
CREATE TABLE IF NOT EXISTS public.conversations (
 id text PRIMARY KEY, prospect_id text REFERENCES public.prospects(id) ON DELETE SET NULL,
 channel text NOT NULL DEFAULT 'note', direction text NOT NULL DEFAULT 'internal',
 subject text NOT NULL DEFAULT '', body text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'logged',
 scheduled_at timestamptz, occurred_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS conversations_created_at_idx ON public.conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS conversations_prospect_idx ON public.conversations(prospect_id);
CREATE TABLE IF NOT EXISTS public.deals (
 id text PRIMARY KEY, prospect_id text REFERENCES public.prospects(id) ON DELETE SET NULL,
 opportunity_id text REFERENCES public.opportunities(id) ON DELETE SET NULL,
 title text NOT NULL, amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(amount>=0),
 currency text NOT NULL DEFAULT 'NGN', status text NOT NULL DEFAULT 'open',
 closed_at timestamptz, notes text, created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS deals_created_at_idx ON public.deals(created_at DESC);
CREATE TABLE IF NOT EXISTS public.revenue_entries (
 id text PRIMARY KEY, deal_id text REFERENCES public.deals(id) ON DELETE SET NULL,
 amount numeric(14,2) NOT NULL CHECK(amount>0), currency text NOT NULL DEFAULT 'NGN',
 kind text NOT NULL DEFAULT 'received', received_at timestamptz NOT NULL DEFAULT now(),
 note text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS revenue_entries_received_at_idx ON public.revenue_entries(received_at DESC);
