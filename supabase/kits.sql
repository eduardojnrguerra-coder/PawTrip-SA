create table if not exists public.kits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  category_id uuid references public.categories(id) on delete set null,
  problem_key text,
  short_description text,
  full_description text,
  why_it_helps text,
  price numeric(10,2) not null check (price > 0),
  compare_at_price numeric(10,2),
  cost_price numeric(10,2),
  image_url text,
  image_alt text,
  badge_text text,
  savings_text text,
  best_for text[] not null default '{}',
  active boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kit_items (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid not null references public.kits(id) on delete cascade,
  product_id uuid references public.products(id) on delete restrict,
  variant_id uuid,
  quantity integer not null default 1 check (quantity > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.order_items add column if not exists kit_id uuid references public.kits(id) on delete set null;
alter table public.order_items add column if not exists item_type text not null default 'product';
alter table public.order_items add column if not exists included_products_snapshot jsonb not null default '[]'::jsonb;

create index if not exists kits_active_idx on public.kits (active, featured, sort_order);
create index if not exists kits_slug_idx on public.kits (slug);
create index if not exists kit_items_kit_id_idx on public.kit_items (kit_id, sort_order);

alter table public.kits enable row level security;
alter table public.kit_items enable row level security;

drop policy if exists "Public can read active kits" on public.kits;
create policy "Public can read active kits"
  on public.kits for select
  using (active = true);

drop policy if exists "Public can read active kit items" on public.kit_items;
create policy "Public can read active kit items"
  on public.kit_items for select
  using (exists (select 1 from public.kits where kits.id = kit_items.kit_id and kits.active = true));

drop policy if exists "Service role manages kits" on public.kits;
create policy "Service role manages kits"
  on public.kits for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role manages kit items" on public.kit_items;
create policy "Service role manages kit items"
  on public.kit_items for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
