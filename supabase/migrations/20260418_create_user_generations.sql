create table if not exists public.user_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('photo', 'mannequin')),
  gender text not null check (gender in ('female', 'male', 'unisex')),
  prompt text not null,
  preset text not null,
  source_bucket text not null default 'user-generations',
  source_image_path text,
  result_bucket text not null default 'user-generations',
  result_image_path text not null,
  measurements jsonb,
  watermark boolean not null default true,
  took_ms integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_generations_user_created_idx
  on public.user_generations (user_id, created_at desc);

alter table public.user_generations enable row level security;

drop policy if exists "user_generations_select_own" on public.user_generations;
create policy "user_generations_select_own"
  on public.user_generations
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_generations_insert_own" on public.user_generations;
create policy "user_generations_insert_own"
  on public.user_generations
  for insert
  to authenticated
  with check (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-generations',
  'user-generations',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "user_generations_storage_select_own" on storage.objects;
create policy "user_generations_storage_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'user-generations'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "user_generations_storage_insert_own" on storage.objects;
create policy "user_generations_storage_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'user-generations'
    and split_part(name, '/', 1) = auth.uid()::text
  );
