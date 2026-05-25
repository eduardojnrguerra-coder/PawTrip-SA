-- PawTrip SA Dog Toys category and optional draft starter products.
-- Safe to run more than once. Starter products are inserted as drafts/inactive.

alter table public.categories
  add column if not exists seo_title text,
  add column if not exists seo_description text;

insert into public.categories (name, slug, description, sort_order, is_active, seo_title, seo_description)
values (
  'Dog Toys',
  'dog-toys',
  'Practical enrichment toys, chew toys and boredom-busting picks for happier dogs at home, in the car and between adventures.',
  5,
  true,
  'Dog Toys South Africa | PawTrip SA',
  'Shop dog toys in South Africa, including chew toys, enrichment toys and boredom-busting picks for happier dogs at home and on the go.'
)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = now();

with dog_toys_category as (
  select id from public.categories where slug = 'dog-toys'
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
    'PawTrip Tough Chew Dog Toy',
    'pawtrip-tough-chew-dog-toy',
    'Durable chew toy for dogs that need something better to do than redesigning your furniture.',
    'A practical chew toy for supervised play and boredom-busting routines. Always supervise your dog during play and remove the toy if damaged or if small parts become loose.',
    array['Useful chew outlet for bored dogs', 'Simple enrichment for indoor days', 'Best used with supervision'],
    199.00,
    249.00,
    null,
    'PT-TOY-CHEW-001',
    20,
    (select id from dog_toys_category),
    array['chew toy', 'boredom', 'tough chewer'],
    'Tough Chew Dog Toy South Africa | PawTrip SA',
    'Shop a practical tough chew dog toy for supervised enrichment and boredom-busting play in South Africa.',
    '/products/placeholder-brand.jpg',
    array['/products/placeholder-brand.jpg'],
    false,
    false,
    false
  ),
  (
    'PawTrip Treat Puzzle Dog Toy',
    'pawtrip-treat-puzzle-dog-toy',
    'Interactive treat puzzle for slower snacking, mental stimulation and less chaos.',
    'A practical treat puzzle toy for supervised enrichment, slower snacking and everyday mental stimulation. Always supervise your dog during play and remove the toy if damaged or if small parts become loose.',
    array['Supports slower treat time', 'Adds simple mental stimulation', 'Useful for indoor boredom'],
    249.00,
    329.00,
    null,
    'PT-TOY-PUZZLE-001',
    15,
    (select id from dog_toys_category),
    array['enrichment', 'puzzle', 'treats'],
    'Treat Puzzle Dog Toy South Africa | PawTrip SA',
    'Shop an interactive treat puzzle dog toy for enrichment, slower snacking and calmer indoor routines.',
    '/products/placeholder-brand.jpg',
    array['/products/placeholder-brand.jpg'],
    false,
    false,
    false
  ),
  (
    'PawTrip Rope Tug Dog Toy',
    'pawtrip-rope-tug-dog-toy',
    'Simple rope tug toy for playtime, bonding and controlled energy release.',
    'A simple rope tug toy for supervised play, bonding and controlled energy release. Always supervise your dog during play and remove the toy if damaged or if small parts become loose.',
    array['Good for interactive tug play', 'Supports controlled energy release', 'Simple bonding toy'],
    149.00,
    199.00,
    null,
    'PT-TOY-ROPE-001',
    25,
    (select id from dog_toys_category),
    array['tug', 'play', 'exercise'],
    'Rope Tug Dog Toy South Africa | PawTrip SA',
    'Shop a simple rope tug dog toy for supervised play, bonding and energy release.',
    '/products/placeholder-brand.jpg',
    array['/products/placeholder-brand.jpg'],
    false,
    false,
    false
  ),
  (
    'PawTrip Squeaky Plush Dog Toy',
    'pawtrip-squeaky-plush-dog-toy',
    'Soft squeaky toy for gentle play, comfort and dogs who need an emotional support squeak.',
    'A soft squeaky plush toy for gentle supervised play and comfort. Always supervise your dog during play and remove the toy if damaged or if small parts become loose.',
    array['Soft option for gentle play', 'Comfort toy for calmer dogs', 'Best for supervised play'],
    179.00,
    229.00,
    null,
    'PT-TOY-PLUSH-001',
    18,
    (select id from dog_toys_category),
    array['plush', 'squeaky', 'gentle play'],
    'Squeaky Plush Dog Toy South Africa | PawTrip SA',
    'Shop a soft squeaky plush dog toy for gentle supervised play and comfort.',
    '/products/placeholder-brand.jpg',
    array['/products/placeholder-brand.jpg'],
    false,
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
  sku = excluded.sku,
  stock_quantity = excluded.stock_quantity,
  category_id = excluded.category_id,
  tags = excluded.tags,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = now();
