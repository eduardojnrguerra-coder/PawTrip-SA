# Adding a Product via CSV

This is the simplest way to add a product without editing TypeScript manually.

## Step-by-step

1. **Add images** to `/public/products/`

   Place your product images as SVG or JPG files in the `public/products/` directory.
   Reference them in the CSV as `/products/your-file.svg`.

2. **Add a row to `products.csv`**

   Open `src/data/product-imports/products.csv` and add a new line with the
   following columns:

   | Column            | Description                                   |
   |-------------------|-----------------------------------------------|
   | `slug`            | URL-friendly identifier (e.g. `my-product`)   |
   | `name`            | Product display name                          |
   | `category`        | Category (e.g. `Car Travel`, `Toys`, `Grooming`) |
   | `price`           | Selling price in ZAR (number only)            |
   | `compareAtPrice`  | Was/Strikethrough price                       |
   | `supplierCost`    | Your cost from supplier                       |
   | `sourceStore`     | Supplier/store name                           |
   | `sourceUrl`       | Supplier product URL                          |
   | `image1`          | Primary product image path                    |
   | `image2`          | Secondary image path (optional, leave blank)  |
   | `image3`          | Tertiary image path (optional, leave blank)   |
   | `shortDescription`| One-line summary for cards/search             |
   | `fullDescription` | Full product description                      |
   | `benefits`        | Pipe-delimited list (e.g. `Easy|Durable`)     |
   | `features`        | Pipe-delimited list                           |
   | `bestFor`         | Pipe-delimited list (e.g. `Walks|Travel`)     |
   | `material`        | Product material description                  |
   | `dimensions`      | Pipe-delimited list (e.g. `Large|Compact`)    |
   | `shippingClass`   | One of: `small`, `standard`, `bulky`, `oversized` |
   | `availability`    | One of: `in_stock`, `checking_availability`, `made_to_order`, `unavailable` |
   | `imageReady`      | `true` or `false`                             |
   | `launchVisible`   | `true` or `false`                             |
   | `seoTitle`        | Page title tag                                |
   | `seoDescription`  | Meta description                              |

   > **Tip:** Set `launchVisible` and `imageReady` to `false` until the product
   > is ready to appear on public pages.

3. **Run the import script**

   ```sh
   npm run import:csv-products
   ```

   This reads `products.csv` and generates `products-generated.ts`.

4. **Test the product page**

   ```sh
   npm run dev
   ```

   Visit `http://localhost:3000/shop` and confirm the product appears (only if
   `launchVisible` and `imageReady` are both `true`).

   Visit `http://localhost:3000/shop/product/<slug>` to test the detail page.

5. **Build**

   ```sh
   npm run build
   ```

   Verify the build succeeds with no errors.

## Visibility rules

Public pages only show products where both are `true`:
- `launchVisible`
- `imageReady`

Set either to `false` to keep a product hidden while preparing it.
