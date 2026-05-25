-- Product variant support for products with sizes, colours or other purchasable options.
-- Safe to run more than once.

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  option_name text not null default 'Size',
  option_value text not null,
  price numeric(10,2) not null check (price > 0),
  compare_at_price numeric(10,2),
  cost_price numeric(10,2),
  sku text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_compare_at_price_check check (compare_at_price is null or compare_at_price > price)
);

alter table public.order_items add column if not exists variant_id uuid references public.product_variants(id) on delete set null;
alter table public.order_items add column if not exists variant_option_name text;
alter table public.order_items add column if not exists variant_option_value text;
alter table public.order_items add column if not exists sku text;

create index if not exists product_variants_product_idx on public.product_variants (product_id, active, sort_order);
create index if not exists order_items_variant_id_idx on public.order_items (variant_id);

alter table public.product_variants enable row level security;

drop policy if exists "Public can read active product variants" on public.product_variants;
create policy "Public can read active product variants"
  on public.product_variants for select
  using (active = true and exists (select 1 from public.products where products.id = product_variants.product_id and products.is_active = true));

drop policy if exists "Service role manages product variants" on public.product_variants;
create policy "Service role manages product variants"
  on public.product_variants for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

