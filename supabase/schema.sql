create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  benefits text[] not null default '{}',
  price numeric(10,2) not null check (price > 0),
  compare_at_price numeric(10,2),
  cost_price numeric(10,2),
  sku text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  category_id uuid references public.categories(id) on delete set null,
  tags text[] not null default '{}',
  seo_title text,
  seo_description text,
  main_image_url text,
  gallery_image_urls text[] not null default '{}',
  is_active boolean not null default false,
  is_featured boolean not null default false,
  is_bundle boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_compare_at_price_check check (compare_at_price is null or compare_at_price > price)
);

create table if not exists public.product_faqs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_reference text unique not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_address jsonb not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null,
  total numeric(10,2) not null,
  payment_status text not null default 'pending',
  fulfillment_status text not null default 'unfulfilled',
  payfast_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_title text not null,
  product_slug text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists categories_active_idx on public.categories (is_active, sort_order);
create index if not exists products_active_idx on public.products (is_active, is_featured, updated_at desc);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_slug_idx on public.products (slug);
create index if not exists product_faqs_product_idx on public.product_faqs (product_id, sort_order);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_fulfillment_status_idx on public.orders (fulfillment_status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_faqs enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
  on public.categories for select
  using (is_active = true);

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select
  using (is_active = true);

drop policy if exists "Public can read product faqs" on public.product_faqs;
create policy "Public can read product faqs"
  on public.product_faqs for select
  using (true);

drop policy if exists "Service role manages categories" on public.categories;
create policy "Service role manages categories"
  on public.categories for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role manages products" on public.products;
create policy "Service role manages products"
  on public.products for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role manages product faqs" on public.product_faqs;
create policy "Service role manages product faqs"
  on public.product_faqs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role manages orders" on public.orders;
create policy "Service role manages orders"
  on public.orders for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role manages order items" on public.order_items;
create policy "Service role manages order items"
  on public.order_items for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

insert into public.categories (name, slug, description, sort_order, is_active)
values
  ('Car Protection', 'car-protection', 'Seat covers, boot liners and cleanup gear for dog travel mess.', 1, true),
  ('Travel Kits', 'travel-kits', 'Practical dog travel setups and bundle-first essentials.', 2, true),
  ('Bowls & Feeding', 'bowls-feeding', 'Travel bowls, slow feeders and useful feeding accessories.', 3, true),
  ('Grooming', 'grooming', 'Paw cleaning, hair removal and practical cleanup basics.', 4, true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

with category_lookup as (
  select id, slug from public.categories
)
insert into public.products (
  title,
  slug,
  short_description,
  description,
  benefits,
  price,
  compare_at_price,
  cost_price,
  sku,
  stock_quantity,
  category_id,
  tags,
  seo_title,
  seo_description,
  main_image_url,
  gallery_image_urls,
  is_active,
  is_featured,
  is_bundle
)
values
  (
    'PawTrip Waterproof Dog Car Seat Hammock with Mesh Window',
    'pawtrip-waterproof-dog-car-seat-hammock-mesh-window',
    'Waterproof back-seat hammock protection with a mesh window for calmer, cleaner trips.',
    'A practical PawTrip SA hammock-style seat protector for South African dog owners who want easier cleanup, better back-seat coverage and a more contained travel zone.',
    array['Helps protect the rear seat from mud, hair and damp paws', 'Hammock shape helps reduce footwell mess', 'Mesh window supports airflow and visibility'],
    899.00,
    1099.00,
    420.00,
    'PT-HAMMOCK-001',
    12,
    (select id from category_lookup where slug = 'car-protection'),
    array['car protection', 'dog hammock', 'travel'],
    'Dog Car Seat Hammock South Africa | PawTrip SA',
    'Shop a waterproof dog car seat hammock with mesh window for cleaner South African car trips.',
    '/products/placeholder-brand.jpg',
    array['/products/placeholder-brand.jpg'],
    true,
    true,
    false
  ),
  (
    'PawTrip SUV Dog Boot Liner with Bumper Protection',
    'pawtrip-suv-dog-boot-liner-bumper-protection',
    'SUV boot liner with bumper coverage for sandy, hairy and muddy cargo zones.',
    'A practical boot liner setup for South African SUVs that need a cleaner cargo area and easier wipe-downs after park, beach or road-trip use.',
    array['Protects the boot floor and loading lip', 'Useful for larger dogs and beach trips', 'Designed for easier post-trip cleanup'],
    999.00,
    1199.00,
    490.00,
    'PT-BOOT-001',
    10,
    (select id from category_lookup where slug = 'car-protection'),
    array['boot liner', 'suv', 'car protection'],
    'SUV Dog Boot Liner South Africa | PawTrip SA',
    'Buy a PawTrip SUV dog boot liner with bumper protection for cleaner cargo-area travel.',
    '/products/placeholder-brand.jpg',
    array['/products/placeholder-brand.jpg'],
    true,
    true,
    false
  ),
  (
    'PawTrip Collapsible Silicone Dog Travel Bowl',
    'pawtrip-collapsible-silicone-dog-travel-bowl',
    'Collapsible bowl for simple water and feeding stops on the go.',
    'A compact travel bowl that folds down easily and makes water stops more practical for road trips, beach mornings and everyday errands.',
    array['Compact and easy to pack', 'Useful for water stops and treats', 'Simple everyday travel accessory'],
    149.00,
    199.00,
    48.00,
    'PT-BOWL-001',
    24,
    (select id from category_lookup where slug = 'bowls-feeding'),
    array['travel bowl', 'feeding', 'road trip'],
    'Dog Travel Bowl South Africa | PawTrip SA',
    'Shop a collapsible silicone dog travel bowl for easier road trips and beach days.',
    '/products/placeholder-brand.jpg',
    array['/products/placeholder-brand.jpg'],
    true,
    false,
    false
  ),
  (
    'PawTrip Silicone Dog Paw Cleaner Cup',
    'pawtrip-silicone-dog-paw-cleaner-cup',
    'A practical paw cleaner cup for muddy exits and cleaner car returns.',
    'A portable paw cleaner that helps remove loose dirt, sand and light mud before your dog climbs back into the car or house.',
    array['Useful after beach, park and rainy walks', 'Helps reduce dirt transfer into the car', 'Simple cleanup step before the drive home'],
    249.00,
    329.00,
    88.00,
    'PT-PAW-001',
    18,
    (select id from category_lookup where slug = 'grooming'),
    array['paw cleaner', 'grooming', 'cleanup'],
    'Dog Paw Cleaner Cup South Africa | PawTrip SA',
    'Buy a PawTrip silicone paw cleaner cup for easier cleanup after muddy or sandy outings.',
    '/products/placeholder-brand.jpg',
    array['/products/placeholder-brand.jpg'],
    true,
    false,
    false
  ),
  (
    'PawTrip Reusable Pet Hair Remover Brush for Cars & Upholstery',
    'pawtrip-reusable-pet-hair-remover-brush-cars-upholstery',
    'Reusable brush for quick resets on seats, mats and upholstery.',
    'A practical pet hair brush for light everyday cleanup in cars, on mats and across upholstery between deeper cleans.',
    array['Useful for quick cleanups', 'Pairs well with seat covers and liners', 'Reusable everyday tool'],
    199.00,
    249.00,
    62.00,
    'PT-HAIR-001',
    20,
    (select id from category_lookup where slug = 'grooming'),
    array['pet hair remover', 'cleanup', 'car care'],
    'Pet Hair Remover Brush South Africa | PawTrip SA',
    'Shop a reusable pet hair remover brush for cars and upholstery in South Africa.',
    '/products/placeholder-brand.jpg',
    array['/products/placeholder-brand.jpg'],
    true,
    false,
    false
  ),
  (
    'PawTrip Slow Feeder Dog Bowl',
    'pawtrip-slow-feeder-dog-bowl',
    'Slow feeder bowl for calmer mealtimes and less frantic gulping.',
    'A practical slow feeder bowl that helps turn meals into a calmer routine for dogs that eat too quickly.',
    array['Supports slower eating', 'Useful for daily feeding routines', 'Easy add-on for problem-first shopping'],
    249.00,
    329.00,
    82.00,
    'PT-SLOW-001',
    15,
    (select id from category_lookup where slug = 'bowls-feeding'),
    array['slow feeder', 'feeding', 'bowl'],
    'Slow Feeder Dog Bowl South Africa | PawTrip SA',
    'Buy a PawTrip slow feeder dog bowl for calmer everyday mealtimes.',
    '/products/placeholder-brand.jpg',
    array['/products/placeholder-brand.jpg'],
    true,
    false,
    false
  ),
  (
    'PawTrip Washable Dog Travel Mat',
    'pawtrip-washable-dog-travel-mat',
    'Washable travel mat for rest stops, guest houses and calmer car routines.',
    'A simple washable mat that gives dogs a familiar resting surface for road trips, day outings and borrowed spaces.',
    array['Useful for rest stops and overnight stays', 'Adds comfort to travel routines', 'Washable and easier to reset between trips'],
    549.00,
    699.00,
    230.00,
    'PT-MAT-001',
    9,
    (select id from category_lookup where slug = 'travel-kits'),
    array['travel mat', 'comfort', 'road trip'],
    'Dog Travel Mat South Africa | PawTrip SA',
    'Shop a washable dog travel mat for road trips and calmer travel setups.',
    '/products/placeholder-brand.jpg',
    array['/products/placeholder-brand.jpg'],
    true,
    false,
    false
  ),
  (
    'PawTrip Portable Dog Water Bottle Dispenser',
    'pawtrip-portable-dog-water-bottle-dispenser',
    'Portable water bottle dispenser for cleaner hydration stops on the move.',
    'A practical water bottle and dispenser setup for dog walks, beach visits and longer drives where quick hydration matters.',
    array['Useful for travel and walks', 'Keeps water stops simpler', 'Compact add-on for road trip kits'],
    299.00,
    399.00,
    110.00,
    'PT-WATER-001',
    16,
    (select id from category_lookup where slug = 'travel-kits'),
    array['water bottle', 'travel', 'hydration'],
    'Portable Dog Water Bottle South Africa | PawTrip SA',
    'Buy a portable dog water bottle dispenser for cleaner hydration stops in South Africa.',
    '/products/placeholder-brand.jpg',
    array['/products/placeholder-brand.jpg'],
    true,
    false,
    false
  ),
  (
    'PawTrip Adjustable Dog Car Seat Belt Tether',
    'pawtrip-adjustable-dog-car-seat-belt-tether',
    'Adjustable car seat belt tether for a more controlled travel setup.',
    'A practical tether for restraint support during dog car travel. Designed to work as one part of a calmer and safer routine.',
    array['Supports a more controlled travel setup', 'Useful add-on for car protection products', 'Compact and practical for regular drives'],
    159.00,
    209.00,
    44.00,
    'PT-TETHER-001',
    22,
    (select id from category_lookup where slug = 'travel-kits'),
    array['seat belt tether', 'car travel', 'restraint'],
    'Dog Car Seat Belt Tether South Africa | PawTrip SA',
    'Shop an adjustable dog car seat belt tether for a more controlled travel setup.',
    '/products/placeholder-brand.jpg',
    array['/products/placeholder-brand.jpg'],
    true,
    false,
    false
  )
on conflict (slug) do update
set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  benefits = excluded.benefits,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  cost_price = excluded.cost_price,
  sku = excluded.sku,
  stock_quantity = excluded.stock_quantity,
  category_id = excluded.category_id,
  tags = excluded.tags,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  main_image_url = excluded.main_image_url,
  gallery_image_urls = excluded.gallery_image_urls,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  is_bundle = excluded.is_bundle,
  updated_at = now();

with product_lookup as (
  select id, slug from public.products
)
insert into public.product_faqs (product_id, question, answer, sort_order)
values
  ((select id from product_lookup where slug = 'pawtrip-waterproof-dog-car-seat-hammock-mesh-window'), 'Will this fit every car?', 'Check the product measurements against your rear seat before ordering. Universal products can still fit vehicles differently.', 0),
  ((select id from product_lookup where slug = 'pawtrip-waterproof-dog-car-seat-hammock-mesh-window'), 'How should I clean it?', 'Wipe down or wash according to the material notes once supplier-approved care details are finalised.', 1),
  ((select id from product_lookup where slug = 'pawtrip-suv-dog-boot-liner-bumper-protection'), 'Who is this best for?', 'It suits SUV owners who regularly transport dogs in the boot and want easier cleanup after outdoor trips.', 0),
  ((select id from product_lookup where slug = 'pawtrip-collapsible-silicone-dog-travel-bowl'), 'Can I use this for water and food?', 'Yes. It is intended as a practical multi-use travel bowl for short trips and stops.', 0),
  ((select id from product_lookup where slug = 'pawtrip-slow-feeder-dog-bowl'), 'Does this replace all feeding advice?', 'No. It is a practical feeding tool, not a medical device. Speak to your vet if your dog has specific feeding concerns.', 0)
on conflict do nothing;
