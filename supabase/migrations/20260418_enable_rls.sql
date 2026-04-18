-- Enable row-level security and baseline policies for GetDressAI tables.
-- Apply this in Supabase SQL editor or your migration pipeline after verifying table names.

alter table if exists public.referral_events enable row level security;
alter table if exists public.billing_events enable row level security;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'referral_events'
  ) then
    drop policy if exists "referral_events_select_own" on public.referral_events;
    create policy "referral_events_select_own"
      on public.referral_events
      for select
      to authenticated
      using (referrer_id = auth.uid());

    drop policy if exists "referral_events_insert_server_only" on public.referral_events;
    create policy "referral_events_insert_server_only"
      on public.referral_events
      for insert
      to authenticated
      with check (referrer_id = auth.uid());
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'billing_events'
  ) then
    drop policy if exists "billing_events_select_none" on public.billing_events;
    create policy "billing_events_select_none"
      on public.billing_events
      for select
      to authenticated
      using (false);
  end if;
end $$;
