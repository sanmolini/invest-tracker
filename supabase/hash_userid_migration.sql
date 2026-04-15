-- ============================================================
-- HASH USER ID MIGRATION
-- Replace raw user_id with hmac(user_id, seed) so the DB admin
-- cannot link auth.users to investments without the seed.
--
-- STEP 1: Set your seed (run once, replace with your real seed)
-- ============================================================

-- Store the seed as a database-level setting
-- Replace 'YOUR_SEED_HERE' with the output of: openssl rand -hex 32
alter database postgres set app.hash_seed = 'YOUR_SEED_HERE';

-- Reload config so current session picks it up
select pg_reload_conf();

-- Enable pgcrypto (needed for hmac)
create extension if not exists pgcrypto;

-- ============================================================
-- STEP 2: Migrate existing data
-- ============================================================

-- Hash all existing user_id values
update investments
set user_id = encode(
  hmac(user_id::text, current_setting('app.hash_seed')::bytea, 'sha256'),
  'hex'
);

-- ============================================================
-- STEP 3: Drop and recreate RLS policies using hashed uid
-- ============================================================

drop policy if exists "investments_select" on investments;
drop policy if exists "investments_insert" on investments;
drop policy if exists "investments_update" on investments;
drop policy if exists "investments_delete" on investments;

create policy "investments_select" on investments for select
  using (
    user_id = encode(hmac(auth.uid()::text, current_setting('app.hash_seed')::bytea, 'sha256'), 'hex')
  );

create policy "investments_insert" on investments for insert
  with check (
    user_id = encode(hmac(auth.uid()::text, current_setting('app.hash_seed')::bytea, 'sha256'), 'hex')
  );

create policy "investments_update" on investments for update
  using (
    user_id = encode(hmac(auth.uid()::text, current_setting('app.hash_seed')::bytea, 'sha256'), 'hex')
  );

create policy "investments_delete" on investments for delete
  using (
    user_id = encode(hmac(auth.uid()::text, current_setting('app.hash_seed')::bytea, 'sha256'), 'hex')
  );

-- transactions and price_snapshots inherit through investment ownership, no changes needed
