'use client';

import Link from 'next/link';
import { useMemo, useState, type ChangeEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { DbCategory, DbKit, DbKitItem, DbProduct } from '@/lib/supabase/admin';
import { compressImage, uploadAdminProductImage } from '@/lib/supabase/client';
import { formatZar } from '@/lib/money';

type KitWithItems = Partial<DbKit> & {
  kit_items?: Array<DbKitItem & { products?: DbProduct | null }> | null;
};

type KitFormProduct = DbProduct & { categories?: Pick<DbCategory, 'id' | 'name' | 'slug'> | null };

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function toNumber(value: string) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function AdminKitForm({
  categories,
  products,
  initialKit,
  action,
  submitLabel = 'Save kit',
  error,
  saved,
}: {
  categories: DbCategory[];
  products: KitFormProduct[];
  initialKit?: KitWithItems;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
  error?: string;
  saved?: boolean;
}) {
  const [title, setTitle] = useState(initialKit?.title || '');
  const [slug, setSlug] = useState(initialKit?.slug || '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initialKit?.slug));
  const [price, setPrice] = useState(String(initialKit?.price ?? ''));
  const [compareAtPrice, setCompareAtPrice] = useState(String(initialKit?.compare_at_price ?? ''));
  const [costPrice, setCostPrice] = useState(String(initialKit?.cost_price ?? ''));
  const [imageUrl, setImageUrl] = useState(initialKit?.image_url || '');
  const [bestFor, setBestFor] = useState<string[]>(initialKit?.best_for?.length ? initialKit.best_for : ['']);
  const [kitItems, setKitItems] = useState<Array<{ productId: string; quantity: number }>>(
    initialKit?.kit_items?.length
      ? [...initialKit.kit_items]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((item) => ({ productId: item.product_id, quantity: item.quantity }))
      : [{ productId: '', quantity: 1 }],
  );
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const totalItemValue = kitItems.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return product ? sum + Number(product.price || 0) * item.quantity : sum;
  }, 0);
  const savings = Math.max(0, (toNumber(compareAtPrice) || totalItemValue) - toNumber(price));
  const profit = toNumber(price) - toNumber(costPrice);
  const hasInactiveItem = kitItems.some((item) => {
    const product = productMap.get(item.productId);
    return product ? !product.is_active || product.stock_quantity <= 0 : false;
  });

  function onTitleChange(nextTitle: string) {
    setTitle(nextTitle);
    if (!slugTouched) setSlug(slugify(nextTitle));
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Please upload a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('This image is too large. Please use an image under 15 MB.');
      return;
    }

    setUploadError('');
    setUploadStatus('Preparing image...');
    setIsUploading(true);
    try {
      const compressed = await compressImage(file, 2000, 0.84);
      setUploadStatus('Uploading image...');
      const upload = await uploadAdminProductImage({
        slug: slug || slugify(title) || 'kit-image',
        file: compressed,
        kind: 'main',
      });
      setImageUrl(upload.publicUrl);
      setUploadStatus('Image uploaded successfully');
    } catch (uploadProblem) {
      console.error('Kit image upload failed', uploadProblem);
      setUploadError(uploadProblem instanceof Error ? uploadProblem.message : 'Image upload failed.');
      setUploadStatus('');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  return (
    <form action={action} className="adminForm">
      {initialKit?.id ? <input type="hidden" name="id" value={initialKit.id} /> : null}
      {error ? <div className="formError">Could not save kit: {error}</div> : null}
      {saved ? <div className="formSuccess">Kit saved successfully.</div> : null}

      <div className="adminFormGrid">
        <section className="contentCard detailBlock">
          <h2>Basic</h2>
          <label>
            Title *
            <input className="input" name="title" value={title} onChange={(event) => onTitleChange(event.target.value)} required />
          </label>
          <label>
            Slug *
            <input
              className="input"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(slugify(event.target.value));
              }}
              required
            />
          </label>
          <div className="formGridTwo">
            <label>
              Category label
              <input className="input" name="category" defaultValue={initialKit?.category || 'Travel Kits'} />
            </label>
            <label>
              Linked category
              <select className="input" name="categoryId" defaultValue={initialKit?.category_id || ''}>
                <option value="">No linked category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="formGridTwo">
            <label>
              Problem key
              <input className="input" name="problemKey" defaultValue={initialKit?.problem_key || ''} placeholder="mud-and-beach-sand" />
            </label>
            <label>
              Sort order
              <input className="input" name="sortOrder" type="number" defaultValue={initialKit?.sort_order ?? 0} />
            </label>
          </div>
          <div className="formGridTwo checkboxGrid">
            <label className="checkboxLine">
              <input type="checkbox" name="active" defaultChecked={initialKit?.active ?? true} /> Active
            </label>
            <label className="checkboxLine">
              <input type="checkbox" name="featured" defaultChecked={initialKit?.featured ?? false} /> Featured
            </label>
          </div>
          <div className="formGridTwo">
            <label>
              Badge text
              <input className="input" name="badgeText" defaultValue={initialKit?.badge_text || ''} placeholder="Starter kit" />
            </label>
            <label>
              Savings text
              <input className="input" name="savingsText" defaultValue={initialKit?.savings_text || ''} placeholder="Save R300" />
            </label>
          </div>
        </section>

        <section className="contentCard detailBlock">
          <h2>Pricing</h2>
          <div className="formGridThree">
            <label>
              Kit price *
              <input className="input" name="price" type="number" min="1" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
            </label>
            <label>
              Compare-at price
              <input className="input" name="compareAtPrice" type="number" min="0" step="0.01" value={compareAtPrice} onChange={(event) => setCompareAtPrice(event.target.value)} />
            </label>
            <label>
              Cost price
              <input className="input" name="costPrice" type="number" min="0" step="0.01" value={costPrice} onChange={(event) => setCostPrice(event.target.value)} />
            </label>
          </div>
          <div className="adminMetricGrid">
            <div className="adminMetricCard">
              <span>Normal item value</span>
              <strong>{formatZar(totalItemValue)}</strong>
            </div>
            <div className="adminMetricCard">
              <span>Visible savings</span>
              <strong>{formatZar(savings)}</strong>
            </div>
            <div className="adminMetricCard">
              <span>Estimated profit</span>
              <strong>{formatZar(profit)}</strong>
            </div>
          </div>
          {profit < 0 ? <p className="formWarning">Warning: kit price is lower than cost price.</p> : null}
        </section>
      </div>

      <section className="contentCard detailBlock">
        <h2>Content</h2>
        <label>
          Short description
          <textarea className="input" name="shortDescription" rows={3} defaultValue={initialKit?.short_description || ''} />
        </label>
        <label>
          Full description
          <textarea className="input" name="fullDescription" rows={5} defaultValue={initialKit?.full_description || ''} />
        </label>
        <label>
          Why it helps
          <textarea className="input" name="whyItHelps" rows={3} defaultValue={initialKit?.why_it_helps || ''} />
        </label>
        <div className="repeatList">
          <h3>Best for</h3>
          {bestFor.map((item, index) => (
            <div className="repeatRow" key={index}>
              <input
                className="input"
                name="bestFor"
                value={item}
                onChange={(event) => setBestFor((current) => current.map((entry, entryIndex) => (entryIndex === index ? event.target.value : entry)))}
              />
              <button type="button" className="iconButton subtle" onClick={() => setBestFor((current) => current.filter((_, entryIndex) => entryIndex !== index))}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button type="button" className="button buttonSecondary buttonSmall" onClick={() => setBestFor((current) => [...current, ''])}>
            <Plus size={15} /> Add best-for tag
          </button>
        </div>
      </section>

      <section className="contentCard detailBlock">
        <h2>Image</h2>
        {!imageUrl ? <p className="formWarning">No kit image added. Active kits should have a polished image before launch.</p> : null}
        <div className="adminImageManager">
          <div className="adminImagePreview">
            {imageUrl ? <img src={imageUrl} alt={initialKit?.image_alt || title || 'Kit preview'} /> : <span>No kit image added</span>}
          </div>
          <div>
            <label>
              Image URL
              <input className="input" name="imageUrl" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
            </label>
            <label>
              Image alt text
              <input className="input" name="imageAlt" defaultValue={initialKit?.image_alt || ''} />
            </label>
            <label>
              Upload kit image
              <input className="input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={isUploading} />
            </label>
            {uploadStatus ? <p className="formSuccess">{uploadStatus}</p> : null}
            {uploadError ? <p className="formError">{uploadError}</p> : null}
          </div>
        </div>
      </section>

      <section className="contentCard detailBlock">
        <h2>Kit items</h2>
        {hasInactiveItem ? <p className="formWarning">Warning: one or more included products are inactive or out of stock.</p> : null}
        <div className="repeatList">
          {kitItems.map((item, index) => {
            const product = productMap.get(item.productId);
            return (
              <div className="kitItemEditorRow" key={`${item.productId}-${index}`}>
                <select
                  className="input"
                  name="kitProductId"
                  value={item.productId}
                  onChange={(event) => setKitItems((current) => current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, productId: event.target.value } : entry)))}
                >
                  <option value="">Choose product</option>
                  {products.map((productOption) => (
                    <option key={productOption.id} value={productOption.id}>
                      {productOption.title} ({formatZar(Number(productOption.price || 0))}, stock {productOption.stock_quantity})
                    </option>
                  ))}
                </select>
                <input
                  className="input"
                  name="kitQuantity"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) =>
                    setKitItems((current) =>
                      current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, quantity: Math.max(1, Number(event.target.value) || 1) } : entry)),
                    )
                  }
                />
                <span className="adminInlineMeta">{product ? `${formatZar(Number(product.price || 0) * item.quantity)} line value` : 'Select a product'}</span>
                <button type="button" className="iconButton subtle" onClick={() => setKitItems((current) => current.filter((_, entryIndex) => entryIndex !== index))}>
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
          <button type="button" className="button buttonSecondary buttonSmall" onClick={() => setKitItems((current) => [...current, { productId: '', quantity: 1 }])}>
            <Plus size={15} /> Add product to kit
          </button>
        </div>
      </section>

      <section className="contentCard detailBlock">
        <h2>SEO</h2>
        <label>
          SEO title
          <input className="input" name="seoTitle" defaultValue={initialKit?.seo_title || ''} />
        </label>
        <label>
          SEO meta description
          <textarea className="input" name="seoDescription" rows={3} defaultValue={initialKit?.seo_description || ''} />
        </label>
      </section>

      <div className="adminStickyActions">
        <Link href="/admin/kits" className="button buttonSecondary">
          Cancel
        </Link>
        <button type="submit" className="button buttonPrimary buttonSheen" disabled={isUploading}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
