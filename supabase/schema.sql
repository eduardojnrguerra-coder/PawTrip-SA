create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_reference text unique not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_address jsonb not null,
  items jsonb not null,
  subtotal numeric not null,
  delivery_fee numeric not null,
  total numeric not null,
  payment_status text not null default 'pending',
  fulfillment_status text not null default 'unfulfilled',
  payfast_payment_id text,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_fulfillment_status_idx on public.orders (fulfillment_status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Service role manages orders" on public.orders;
create policy "Service role manages orders"
  on public.orders
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
