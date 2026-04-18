create table if not exists public.user_generator_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mode text not null default 'photo' check (mode in ('photo', 'mannequin')),
  gender text not null default 'female' check (gender in ('female', 'male', 'unisex')),
  preset text not null default 'Luxury',
  prompt text not null default 'A polished editorial outfit with realistic fabric detail',
  clothing_request text,
  measurements jsonb,
  source_image_path text,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_generator_preferences_updated_idx
  on public.user_generator_preferences (updated_at desc);

alter table public.user_generator_preferences enable row level security;

drop policy if exists "user_generator_preferences_select_own" on public.user_generator_preferences;
create policy "user_generator_preferences_select_own"
  on public.user_generator_preferences
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_generator_preferences_insert_own" on public.user_generator_preferences;
create policy "user_generator_preferences_insert_own"
  on public.user_generator_preferences
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "user_generator_preferences_update_own" on public.user_generator_preferences;
create policy "user_generator_preferences_update_own"
  on public.user_generator_preferences
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
