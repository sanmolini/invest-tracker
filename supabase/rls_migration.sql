-- ============================================================
-- RLS MIGRATION — Multi-user support
-- Run this in Supabase → SQL Editor
-- ============================================================

-- 1. Add user_id to investments
alter table investments
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 2. (Optional) Assign existing rows to a specific user
--    Replace <YOUR-USER-UUID> with your UUID from Authentication → Users
-- update investments set user_id = '<YOUR-USER-UUID>' where user_id is null;

-- 3. Make user_id NOT NULL after filling existing rows
-- alter table investments alter column user_id set not null;

-- 4. Enable RLS on all tables
alter table investments    enable row level security;
alter table transactions   enable row level security;
alter table price_snapshots enable row level security;

-- 5. Drop any existing policies
drop policy if exists "investments_select" on investments;
drop policy if exists "investments_insert" on investments;
drop policy if exists "investments_update" on investments;
drop policy if exists "investments_delete" on investments;

drop policy if exists "transactions_select" on transactions;
drop policy if exists "transactions_insert" on transactions;
drop policy if exists "transactions_update" on transactions;
drop policy if exists "transactions_delete" on transactions;

drop policy if exists "snapshots_select" on price_snapshots;
drop policy if exists "snapshots_insert" on price_snapshots;
drop policy if exists "snapshots_update" on price_snapshots;
drop policy if exists "snapshots_delete" on price_snapshots;

-- 6. Investments: each user sees/edits only their own
create policy "investments_select" on investments for select using (user_id = auth.uid());
create policy "investments_insert" on investments for insert with check (user_id = auth.uid());
create policy "investments_update" on investments for update using (user_id = auth.uid());
create policy "investments_delete" on investments for delete using (user_id = auth.uid());

-- 7. Transactions: accessible only through owned investments
create policy "transactions_select" on transactions for select
  using (investment_id in (select id from investments where user_id = auth.uid()));

create policy "transactions_insert" on transactions for insert
  with check (investment_id in (select id from investments where user_id = auth.uid()));

create policy "transactions_update" on transactions for update
  using (investment_id in (select id from investments where user_id = auth.uid()));

create policy "transactions_delete" on transactions for delete
  using (investment_id in (select id from investments where user_id = auth.uid()));

-- 8. Price snapshots: same rule
create policy "snapshots_select" on price_snapshots for select
  using (investment_id in (select id from investments where user_id = auth.uid()));

create policy "snapshots_insert" on price_snapshots for insert
  with check (investment_id in (select id from investments where user_id = auth.uid()));

create policy "snapshots_update" on price_snapshots for update
  using (investment_id in (select id from investments where user_id = auth.uid()));

create policy "snapshots_delete" on price_snapshots for delete
  using (investment_id in (select id from investments where user_id = auth.uid()));
