-- Custom product option support for personalised products such as engraved dog ID tags.
-- Safe to run more than once.

create table if not exists public.product_custom_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  input_type text not null default 'text' check (input_type in ('text', 'textarea', 'select')),
  required boolean not null default false,
  help_text text,
  placeholder text,
  max_length integer,
  choices text[] not null default '{}',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.order_items add column if not exists custom_options jsonb not null default '{}'::jsonb;

create index if not exists product_custom_options_product_idx on public.product_custom_options (product_id, active, sort_order);

alter table public.product_custom_options enable row level security;

drop policy if exists "Public can read active product custom options" on public.product_custom_options;
create policy "Public can read active product custom options"
  on public.product_custom_options for select
  using (active = true and exists (select 1 from public.products where products.id = product_custom_options.product_id and products.is_active = true));

drop policy if exists "Service role manages product custom options" on public.product_custom_options;
create policy "Service role manages product custom options"
  on public.product_custom_options for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

