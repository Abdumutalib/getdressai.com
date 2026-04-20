create table if not exists public.guest_generations (
  id uuid primary key default gen_random_uuid(),
  guest_key text not null,
  mode text not null check (mode in ('photo', 'mannequin')),
  gender text not null check (gender in ('female', 'male', 'unisex')),
  prompt text not null,
  preset text not null,
  source_image_path text,
  result_image_path text not null,
  measurements jsonb,
  watermark boolean not null default true,
  took_ms integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists guest_generations_guest_created_idx
  on public.guest_generations (guest_key, created_at desc);

alter table public.guest_generations enable row level security;

drop policy if exists "guest_generations_service_only_select" on public.guest_generations;
create policy "guest_generations_service_only_select"
  on public.guest_generations
  for select
  to authenticated
  using (false);

drop policy if exists "guest_generations_service_only_insert" on public.guest_generations;
create policy "guest_generations_service_only_insert"
  on public.guest_generations
  for insert
  to authenticated
  with check (false);
