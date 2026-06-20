create extension if not exists pgcrypto;

create table if not exists public.fragrances (
  id uuid primary key default gen_random_uuid(),
  fragella_id text not null unique,
  slug text not null unique,
  name text not null,
  brand text not null,
  primary_family text,
  year integer,
  rating numeric(3, 2),
  country text,
  price numeric(10, 2),
  gender text,
  oil_type text,
  longevity text,
  sillage text,
  confidence text,
  popularity text,
  price_value text,
  image_url text,
  image_url_transparent text,
  image_fallbacks jsonb not null default '[]'::jsonb,
  purchase_url text,
  general_notes jsonb not null default '[]'::jsonb,
  main_accords jsonb not null default '[]'::jsonb,
  main_accords_percentage jsonb not null default '{}'::jsonb,
  season_ranking jsonb not null default '[]'::jsonb,
  occasion_ranking jsonb not null default '[]'::jsonb,
  notes jsonb not null default '{}'::jsonb,
  source_brand text,
  sort_score numeric(8, 2) not null default 0,
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fragrances_brand_idx on public.fragrances (brand);
create index if not exists fragrances_family_idx on public.fragrances (primary_family);
create index if not exists fragrances_sort_score_idx on public.fragrances (sort_score desc);
create index if not exists fragrances_rating_idx on public.fragrances (rating desc nulls last);
create index if not exists fragrances_name_search_idx on public.fragrances using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(brand, '')));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists fragrances_set_updated_at on public.fragrances;
create trigger fragrances_set_updated_at
before update on public.fragrances
for each row
execute function public.set_updated_at();

alter table public.fragrances enable row level security;

drop policy if exists "Public read fragrances" on public.fragrances;
create policy "Public read fragrances"
on public.fragrances
for select
using (true);
