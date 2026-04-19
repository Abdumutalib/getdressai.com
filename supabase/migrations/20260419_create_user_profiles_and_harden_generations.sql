create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'unlimited')),
  credits integer not null default 3 check (credits >= 0),
  paddle_customer_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_profiles_plan_idx
  on public.user_profiles (plan);

alter table public.user_profiles enable row level security;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own"
  on public.user_profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own"
  on public.user_profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own"
  on public.user_profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "user_generations_update_own" on public.user_generations;
create policy "user_generations_update_own"
  on public.user_generations
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "user_generations_delete_own" on public.user_generations;
create policy "user_generations_delete_own"
  on public.user_generations
  for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_generations_storage_update_own" on storage.objects;
create policy "user_generations_storage_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'user-generations'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'user-generations'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "user_generations_storage_delete_own" on storage.objects;
create policy "user_generations_storage_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'user-generations'
    and split_part(name, '/', 1) = auth.uid()::text
  );
