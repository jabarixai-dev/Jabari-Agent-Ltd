-- Jabari Revenue OS initial schema.
-- Apply only through the approved Neon migration workflow.

create extension if not exists pgcrypto;

create table if not exists agents (
  id text primary key,
  name text not null,
  mission text not null,
  status text not null default 'ready',
  automation_mode text not null default 'approval_required',
  capabilities jsonb not null default '[]'::jsonb,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  objective text not null,
  status text not null default 'pending',
  automation_mode text not null default 'approval_required',
  budget jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_tasks (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references agents(id),
  mission_id uuid references missions(id),
  type text not null,
  input jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  lease_owner text,
  lease_until timestamptz,
  heartbeat_at timestamptz,
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists agent_tasks_queue_idx on agent_tasks(status, created_at);
create index if not exists agent_tasks_agent_idx on agent_tasks(agent_id, status);

create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  industry text,
  location text,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id),
  title text not null,
  stage text not null default 'discovered',
  score numeric(6,2),
  problem text,
  offer text,
  estimated_value numeric(14,2),
  currency text not null default 'NGN',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activity_events (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null,
  actor_id text,
  event_type text not null,
  entity_type text,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_created_idx on activity_events(created_at desc);
