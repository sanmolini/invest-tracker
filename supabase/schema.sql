-- ============================================================
-- INVEST TRACKER — Supabase Schema
-- Run this in your Supabase project → SQL Editor
-- ============================================================

-- INVESTMENTS
create table if not exists investments (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null check (type in ('liquidity_fund','crypto','stock','etf','savings')),
  ticker        text,
  currency      text not null default 'ARS' check (currency in ('ARS','USD','EUR','BTC','ETH')),
  is_unit_based boolean not null default false,
  notes         text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- TRANSACTIONS (compras / ventas / depósitos)
create table if not exists transactions (
  id              uuid primary key default gen_random_uuid(),
  investment_id   uuid not null references investments(id) on delete cascade,
  type            text not null default 'buy' check (type in ('buy','sell','deposit','withdrawal','dividend')),
  date            date not null default current_date,
  units           numeric(20, 8),
  unit_price      numeric(20, 4),
  amount          numeric(20, 2) not null,
  notes           text,
  created_at      timestamptz not null default now()
);

-- PRICE SNAPSHOTS (valor actual — actualización manual)
create table if not exists price_snapshots (
  id              uuid primary key default gen_random_uuid(),
  investment_id   uuid not null references investments(id) on delete cascade,
  date            date not null default current_date,
  unit_price      numeric(20, 4),
  total_value     numeric(20, 2) not null,
  created_at      timestamptz not null default now(),
  unique(investment_id, date)
);

-- Indexes
create index if not exists idx_transactions_investment on transactions(investment_id);
create index if not exists idx_snapshots_investment_date on price_snapshots(investment_id, date desc);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists investments_updated_at on investments;
create trigger investments_updated_at
  before update on investments
  for each row execute function update_updated_at();

-- Disable RLS (personal single-user app)
alter table investments disable row level security;
alter table transactions disable row level security;
alter table price_snapshots disable row level security;
