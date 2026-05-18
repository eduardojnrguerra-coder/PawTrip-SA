-- Optional PawTrip SA admin portal upgrades.
-- Run this only when you are ready to manage blog posts, contact messages,
-- customer notes and editable site settings from Supabase.

alter table public.orders
  add column if not exists admin_notes text,
  add column if not exists paid_at timestamptz,
  add column if not exists payment_provider text,
  add column if not exists payment_reference text,
  add column if not exists payment_payload jsonb;

alter table public.categories
  add column if not exists seo_title text,
  add column if not exists seo_description text;

alter table public.products
  add column if not exists supplier_url text;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  category text,
  featured_image_url text,
  seo_title text,
  seo_description text,
  status text not null default 'draft',
  is_featured boolean not null default false,
  related_product_slugs text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  subject text,
  message text not null,
  status text not null default 'unread',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;
alter table public.customer_notes enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Service role manages blog posts" on public.blog_posts;
create policy "Service role manages blog posts"
  on public.blog_posts for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role manages customer notes" on public.customer_notes;
create policy "Service role manages customer notes"
  on public.customer_notes for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role manages contact messages" on public.contact_messages;
create policy "Service role manages contact messages"
  on public.contact_messages for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role manages site settings" on public.site_settings;
create policy "Service role manages site settings"
  on public.site_settings for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
