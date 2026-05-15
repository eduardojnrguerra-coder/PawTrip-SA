# PawTrip SA

PawTrip SA is a custom Next.js ecommerce MVP for South African dog travel, car protection and practical everyday pet essentials.

## Stack

- Next.js App Router
- TypeScript
- React
- Framer Motion
- LocalStorage cart
- Vercel-compatible route handlers
- Typed product and blog data in `src/data`

## Setup

```bash
npm install
npm run dev
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in your local values. `.env.local` is ignored by Git and must not be committed.

Required values:

- `NEXT_PUBLIC_SITE_URL`
- `PAYFAST_MERCHANT_ID`
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_PASSPHRASE`
- `PAYFAST_MODE`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Use `PAYFAST_MODE=sandbox` for testing and `PAYFAST_MODE=production` for live payments.

## Add products

## Supabase storefront and admin

PawTrip SA now supports a custom Supabase-backed product system. The public store reads active products and active categories from Supabase when the environment variables are present. If Supabase is not configured yet, the site safely falls back to the existing typed catalogue in `src/data/products.ts`.

### Supabase setup steps

1. Create a Supabase project.
2. In Supabase, create a public storage bucket named `product-images`.
3. Open the SQL editor and run:

```sql
\i supabase/schema.sql
```

Or paste the full contents of `supabase/schema.sql`.

4. In Supabase Authentication, create the admin user(s) you want to use for the dashboard with email/password sign-in.
5. Add these environment variables to `.env.local` and Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Important:

- `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only.
- Do not expose the service role key in client code or `NEXT_PUBLIC_` variables.

### Admin portal routes

- `/admin/login`
- `/admin`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]/edit`
- `/admin/categories`
- `/admin/orders`

Admin users sign in with Supabase Auth credentials. Protected admin pages redirect to `/admin/login` when there is no valid admin session.

### Manual product workflow

If you want to manage live products without touching code:

1. Sign in at `/admin/login`.
2. Go to `/admin/products/new`.
3. Fill in title, slug, category, pricing, stock, descriptions, benefits, tags and SEO fields.
4. Upload a main image and any gallery images.
5. Add product FAQs.
6. Save as draft or publish.
7. Use `/admin/products` to search, filter, edit and open public product pages.

### Category workflow

Use `/admin/categories` to:

- add categories
- edit names, slugs and descriptions
- change sort order
- activate or deactivate public categories

Only active categories appear in the public category menu.

## Hardcoded product fallback

The original typed product catalogue still lives in `src/data/products.ts`.

Each product includes:

- slug
- category
- price and compare-at price
- image paths
- benefits
- measurements
- FAQs

For one-off fallback edits, add a new product object there, then add its image file under `public/products/`.

### CSV product import workflow

For supplier research and batch product setup, use the CSV importer instead of hand-writing every product in TypeScript.

1. Open `src/data/product-imports/supplier-products.csv`.
2. Add or edit one row per supplier product.
3. Use `|` to separate list fields such as `benefits`, `features`, `bestFor` and `dimensions`.
4. Save product photos in `public/products/` and reference them in `image1`, `image2` and `image3`.
5. Keep `launchVisible=false` until pricing, supplier details, image rights and product copy are checked.
6. Set `imageReady=true` only after usable product images exist.
7. Set `sourcePermissionStatus` to one of:
   - `needs_supplier_images`
   - `supplier_permission_confirmed`
   - `original_photos_needed`
8. Run:

```bash
npm run import:products
```

The script converts the CSV into `src/data/product-imports/generated-products.ts`. Review that generated file before copying approved products into `src/data/products.ts`.

Supported CSV fields:

```text
slug, name, category, price, compareAtPrice, supplierCost, supplierName, supplierUrl,
image1, image2, image3, shortDescription, fullDescription, benefits, features,
bestFor, material, dimensions, shippingClass, availability, sourcePermissionStatus,
imageReady, launchVisible, seoTitle, seoDescription
```

Public visibility rules:

- `launchVisible` must be `true`.
- `imageReady` must be `true`.
- `sourcePermissionStatus` must be `supplier_permission_confirmed` or `original_photos_needed`.
- Products that fail those checks are excluded from homepage, shop, collections, product lookup, checkout validation and sitemap routes.

Do not expose supplier cost, supplier name, supplier URL or private supplier notes on public pages.

## Add blog posts

Blog content lives in `src/data/blog.ts`.

Each post includes:

- slug
- title
- excerpt
- publish date
- read time
- section content

## Product images

Images are served from `public/products/`.

Use jpg or webp files and name them with the product slug:

```text
public/products/waterproof-dog-car-seat-cover-1.jpg
public/products/waterproof-dog-car-seat-cover-2.webp
public/products/waterproof-dog-car-seat-cover-3.jpg
```

Recommended sizes:

- Product images: `1200x1200`
- Hero, banner and lifestyle images: `1600x900`

Compress images before upload so product grids, galleries and mobile pages stay fast. Public catalogue pages should not show `Product image coming soon`; keep products hidden with `imageReady=false` or `launchVisible=false` until they have usable images.

Product image rules:

- Use supplier photos only with permission.
- Buy samples and take real photos for hero products and best sellers.
- Do not copy photos from competitor sites.
- Use AI images only for banners or lifestyle sections, not exact product representation unless the result is accurate.

The same guidance is available in the app at `/photo-guide`.

## Customer support and contact form

The contact page at `/contact` uses a no-cost `mailto:` fallback. When a customer submits the form, their email app opens with a prepared message addressed to:

```text
support@pawtripsa.co.za
```

This MVP does not save contact messages in a database and does not send email through a backend service yet. Do not tell customers their message has been saved unless an email provider or database-backed form handler has been added.

Current support structure:

- Contact page with support email, business-hours response wording and order support copy.
- Customers are asked to include their order reference when contacting support.
- Footer links point to contact, order support, shipping and returns, the Kit Finder and blog guides.
- Checkout links to the contact page and support email before payment.

Upgrade options later:

- Resend: add a server route such as `/api/contact`, validate the form server-side, and send transactional support emails through Resend.
- Brevo: use Brevo SMTP or API for support notifications and customer confirmation emails.
- Formspree: route form submissions to Formspree if you want a hosted form inbox with minimal backend code.
- Supabase Edge Functions: store support requests in Supabase and send notifications from an Edge Function.

When upgrading, keep spam protection, rate limiting, server-side validation and clear privacy wording in place.

## Email capture checklist

The homepage includes an email capture banner for `Get the PawTrip road trip checklist`, and the static checklist page lives at:

```text
/dog-road-trip-checklist-south-africa
```

For V1, the email capture form does not store addresses because no email backend is connected. The page is intentionally honest about this. Customers can still open or print the checklist.

Upgrade options later:

- Brevo: create a Brevo list, add an API route such as `/api/subscribe`, validate the email server-side, and add the contact to the list through Brevo's API.
- MailerLite: create a subscriber group, add a server route, and submit subscribers to MailerLite with a private API key stored in Vercel environment variables.
- Double opt-in: enable confirmation emails before sending marketing campaigns.
- Privacy: update the privacy policy before storing emails and explain what customers are signing up for.

Do not store email addresses in localStorage as a production mailing list.

## Private operations files

Internal supplier and fulfilment templates live in `ops/`. These files are for PawTrip SA operations only and are not part of the public website.

- `ops/supplier-tracker-template.csv`
- `ops/pricing-calculator-template.csv`
- `ops/order-fulfilment-checklist.md`
- `ops/supplier-outreach-email.md`
- `ops/photo-permission-email.md`
- `ops/product-photo-shot-list.md`

Do not copy supplier names, supplier costs, wholesale notes or private fulfilment details into public pages, product data shown to customers, blog content or files under `public/`.

## PayFast setup

PawTrip SA uses PayFast aggregation for hosted checkout. There is no Shopify, WooCommerce or paid ecommerce platform in this MVP; the customer is redirected to PayFast for secure payment and PayFast charges fees per successful transaction.

1. Create or log in to a PayFast merchant account at `payfast.io`.
2. In the PayFast dashboard, open `Settings` then `Developer settings`.
3. Copy the Merchant ID and Merchant Key into `.env.local`.
4. Add a Security Passphrase in PayFast if signature security is enabled, then copy the same value into `PAYFAST_PASSPHRASE`.
5. Use `PAYFAST_MODE=sandbox` while testing. Sandbox credentials are separate from production credentials.
6. Set `NEXT_PUBLIC_SITE_URL` to your public site URL. PayFast ITN callbacks need a web-accessible URL; local `localhost` URLs are only useful for browser redirect testing.

Required local variables:

```bash
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
PAYFAST_MODE=sandbox
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The checkout posts cart and customer details to `/api/payfast/create-payment`. That route validates required customer fields, validates cart items against `src/data/products.ts`, calculates totals server-side, generates the order reference, creates the PayFast payload and signs it on the server.

For Vercel:

1. Open the Vercel project.
2. Go to `Settings` then `Environment Variables`.
3. Add all five PayFast variables for Preview and Production as needed.
4. Keep sandbox credentials in Preview while testing.
5. To go live, replace the credentials with production Merchant ID and Merchant Key, set the production passphrase, set `PAYFAST_MODE=production`, and set `NEXT_PUBLIC_SITE_URL` to the live domain.

Security notes:

- Do not put PayFast credentials in client components or `NEXT_PUBLIC_` variables.
- Never trust prices from the browser. The API calculates totals from the product catalogue.
- The passphrase is used only server-side for the MD5 signature.
- `/api/payfast/notify` updates Supabase orders when Supabase is configured. Keep testing ITN on a public URL before going live.
- Pending order data is stored in localStorage before redirect so the success page can show the reference immediately, but payment confirmation must still be checked before processing the order.

## Optional Supabase order storage

The site works without Supabase. If `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing, checkout falls back to the V1 localStorage pending-order flow.

To enable persistent order storage:

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. Add the following environment variables locally and in Vercel:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_PASSWORD=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

`SUPABASE_SERVICE_ROLE_KEY` must stay server-side only. Do not expose it in client components, browser code or `NEXT_PUBLIC_` variables.

When Supabase is configured:

- `/api/payfast/create-payment` creates an `orders` row before returning the PayFast redirect payload.
- `/api/payfast/notify` validates the ITN signature, validates the payload with PayFast, finds the order by reference, confirms the amount and marks `payment_status` as `paid` when PayFast sends `payment_status=COMPLETE`.
- The PayFast payment ID is stored in `payfast_payment_id` when provided.

Internal admin:

- Visit `/admin/orders`.
- Set `ADMIN_PASSWORD` before using the page.
- The page sets an HTTP-only admin cookie after a successful password check.
- Admin users can view orders and manually mark fulfilment as `unfulfilled`, `processing`, `shipped` or `cancelled`.

## SEO and analytics

The app includes a technical SEO foundation:

- Dynamic metadata for home, shop, category, product, blog listing and blog article pages.
- Canonical URLs and OpenGraph metadata.
- `sitemap.xml` covering static pages, product pages, category pages and blog posts.
- `robots.txt` allowing public pages while excluding admin, API, cart and checkout routes.
- JSON-LD for Organization, WebSite, Product, BreadcrumbList and BlogPosting.
- Breadcrumb links on category, product and blog article pages.
- Internal links between categories, products, bundles and blog guides.

Optional search and analytics variables:

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

Add the Google Search Console verification token to `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`. Add a Google Analytics measurement ID to `NEXT_PUBLIC_GA_MEASUREMENT_ID` if you want the built-in GA placeholder to load. If you prefer Vercel Analytics later, install the Vercel package and mount its component in `src/app/layout.tsx`.

### GA4 conversion tracking

The app loads Google Analytics 4 only when this variable exists:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

How to create a GA4 property:

1. Open Google Analytics.
2. Create an account or choose an existing account.
3. Create a GA4 property for PawTrip SA.
4. Add a Web data stream for your production domain.
5. Copy the Measurement ID that starts with `G-`.

How to add the env variable on Vercel:

1. Open the PawTrip SA Vercel project.
2. Go to `Settings` then `Environment Variables`.
3. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
4. Paste the GA4 Measurement ID.
5. Redeploy so the script is included in the production build.

Tracked events:

- `view_item`
- `add_to_cart`
- `view_cart`
- `begin_checkout`
- `payment_redirect_started`
- `quiz_started`
- `quiz_completed`
- `recommended_kit_added`
- `blog_article_viewed`

Google Search Console:

1. Open Google Search Console.
2. Add the PawTrip SA domain property.
3. Verify with DNS, or use the HTML tag token in `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
4. Submit the sitemap URL: `https://your-domain.co.za/sitemap.xml`.
5. Check indexing after deployment and after major content changes.

Daily metrics to check:

- Search impressions
- Search clicks
- Add-to-cart rate
- Checkout starts
- Payment starts
- Top products
- Top blog pages

Vercel Analytics:

`@vercel/analytics` is not installed by default. To use it later, install the package and add `<Analytics />` from `@vercel/analytics/react` in `src/app/layout.tsx`. The current GA4 setup does not depend on Vercel Analytics and will not break if analytics env vars are missing.

Before scaling:

- Keep PayFast ITN verification enabled and test it on a public URL.
- Confirm that PayFast sandbox and production credentials are not mixed.
- Add email notifications and a proper staff authentication system when the store needs multiple users.

## Deployment on Vercel

No `vercel.json` is required for the current MVP. Vercel detects the Next.js App Router project automatically, and the PayFast/Supabase routes run as Vercel serverless functions.

1. Create a new GitHub repository.
2. In this project folder, initialise Git if needed:

```bash
git init
git add .
git commit -m "Initial PawTrip SA ecommerce MVP"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

3. In Vercel, choose `Add New Project`.
4. Import the GitHub repository.
5. Keep the default framework preset as Next.js.
6. Add environment variables in `Settings` then `Environment Variables`.
7. Deploy the project.
8. Open the Vercel deployment URL and test the storefront, cart and checkout.
9. Test checkout with PayFast sandbox credentials first.
10. Switch PayFast to production later by replacing sandbox credentials with live credentials and setting `PAYFAST_MODE=production`.
11. Add a custom domain later in Vercel under `Settings` then `Domains`.

Minimum Vercel environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://your-vercel-or-custom-domain.co.za
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
PAYFAST_MODE=sandbox
```

Optional Vercel environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

After deployment, update `NEXT_PUBLIC_SITE_URL` to the live Vercel/custom domain. PayFast return, cancel and notify URLs are generated from this value.

The app is now structured to use Supabase for products, categories, orders and product images while still keeping a code-based fallback catalogue for safety during setup or migration.

## Production checklist

- Run `npm run build` locally before pushing.
- Confirm `.env.local` and real credentials are not committed.
- Replace placeholder product images.
- Add real supplier-approved photos.
- Confirm prices, supplier costs, delivery costs and margins.
- Test PayFast sandbox checkout end to end.
- Test mobile checkout on a real phone or browser device tools.
- Submit `/sitemap.xml` to Google Search Console.
- Review privacy policy and terms before launch.
- Add and test `support@pawtripsa.co.za`.
- Place a test order and confirm the success/cancelled flows.
- Confirm PayFast ITN works on a public URL before relying on automated payment status updates.

## Next steps

- Replace placeholder images with real photography.
- Add inventory tracking when stock needs to be managed.
- Add order confirmation email handling.
- Add customer accounts when the store needs them.
#   P a w T r i p - S A  
 
