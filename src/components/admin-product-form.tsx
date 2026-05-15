'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { DbCategory, DbProduct, DbProductFaq } from '@/lib/supabase/admin';

type ProductFormData = {
  id?: string;
  title?: string;
  slug?: string;
  short_description?: string | null;
  description?: string | null;
  benefits?: string[] | null;
  price?: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  sku?: string | null;
  stock_quantity?: number;
  category_id?: string | null;
  tags?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  main_image_url?: string | null;
  gallery_image_urls?: string[] | null;
  is_active?: boolean;
  is_featured?: boolean;
  is_bundle?: boolean;
  product_faqs?: DbProductFaq[] | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function AdminProductForm({
  categories,
  initialProduct,
  action,
  submitLabel = 'Save product',
  deleteAction,
  error,
  saved,
}: {
  categories: DbCategory[];
  initialProduct?: ProductFormData;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  error?: string;
  saved?: boolean;
}) {
  const [title, setTitle] = useState(initialProduct?.title || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initialProduct?.slug));
  const [benefits, setBenefits] = useState<string[]>(initialProduct?.benefits?.length ? initialProduct.benefits : ['']);
  const [tags, setTags] = useState<string[]>(initialProduct?.tags?.length ? initialProduct.tags : ['']);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(
    initialProduct?.product_faqs?.length
      ? initialProduct.product_faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))
      : [{ question: '', answer: '' }],
  );
  const [removeGallery, setRemoveGallery] = useState<string[]>([]);

  const existingGallery = useMemo(() => initialProduct?.gallery_image_urls ?? [], [initialProduct?.gallery_image_urls]);

  function onTitleChange(nextTitle: string) {
    setTitle(nextTitle);
    if (!slugTouched) setSlug(slugify(nextTitle));
  }

  return (
    <form action={action} className="adminProductForm" encType="multipart/form-data">
      {initialProduct?.id ? <input type="hidden" name="id" value={initialProduct.id} /> : null}
      {initialProduct?.main_image_url ? <input type="hidden" name="existingMainImage" value={initialProduct.main_image_url} /> : null}
      {existingGallery.map((url) => (
        <input key={`gallery-${url}`} type="hidden" name="existingGalleryUrl" value={url} />
      ))}

      {saved ? <p className="successText">Saved successfully.</p> : null}
      {error ? <p className="errorText">{error}</p> : null}

      <div className="adminFormGrid">
        <label className="field fieldFull">
          <span>Title</span>
          <input className="input" name="title" value={title} onChange={(event) => onTitleChange(event.target.value)} required />
        </label>

        <label className="field">
          <span>Slug</span>
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

        <label className="field">
          <span>Category</span>
          <select className="input" name="categoryId" defaultValue={initialProduct?.category_id || ''}>
            <option value="">No category yet</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Price</span>
          <input className="input" name="price" type="number" min="0" step="0.01" defaultValue={initialProduct?.price ?? ''} required />
        </label>

        <label className="field">
          <span>Compare-at price</span>
          <input className="input" name="compareAtPrice" type="number" min="0" step="0.01" defaultValue={initialProduct?.compare_at_price ?? ''} />
        </label>

        <label className="field">
          <span>Cost price</span>
          <input className="input" name="costPrice" type="number" min="0" step="0.01" defaultValue={initialProduct?.cost_price ?? ''} />
        </label>

        <label className="field">
          <span>SKU</span>
          <input className="input" name="sku" defaultValue={initialProduct?.sku ?? ''} />
        </label>

        <label className="field">
          <span>Stock quantity</span>
          <input className="input" name="stockQuantity" type="number" min="0" step="1" defaultValue={initialProduct?.stock_quantity ?? 0} />
        </label>

        <label className="field fieldFull">
          <span>Short description</span>
          <textarea className="textarea" name="shortDescription" defaultValue={initialProduct?.short_description ?? ''} rows={3} />
        </label>

        <label className="field fieldFull">
          <span>Full description</span>
          <textarea className="textarea" name="description" defaultValue={initialProduct?.description ?? ''} rows={8} />
        </label>
      </div>

      <div className="contentCard detailBlock">
        <div className="sectionHeaderInline">
          <div>
            <h2>Benefits</h2>
            <p>Short bullet benefits shown on the product page.</p>
          </div>
          <button type="button" className="button buttonSecondary buttonSmall" onClick={() => setBenefits((current) => [...current, ''])}>
            <Plus size={14} /> Add benefit
          </button>
        </div>
        <div className="adminRepeater">
          {benefits.map((benefit, index) => (
            <div className="adminRepeaterRow" key={`benefit-${index}`}>
              <input
                className="input"
                name="benefit"
                value={benefit}
                onChange={(event) => setBenefits((current) => current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
              />
              <button type="button" className="iconButton subtle" onClick={() => setBenefits((current) => current.filter((_, itemIndex) => itemIndex !== index || current.length === 1))}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="contentCard detailBlock">
        <div className="sectionHeaderInline">
          <div>
            <h2>Tags</h2>
            <p>Useful for filtering, best-for lines and related products later.</p>
          </div>
          <button type="button" className="button buttonSecondary buttonSmall" onClick={() => setTags((current) => [...current, ''])}>
            <Plus size={14} /> Add tag
          </button>
        </div>
        <div className="adminRepeater">
          {tags.map((tag, index) => (
            <div className="adminRepeaterRow" key={`tag-${index}`}>
              <input
                className="input"
                name="tag"
                value={tag}
                onChange={(event) => setTags((current) => current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
              />
              <button type="button" className="iconButton subtle" onClick={() => setTags((current) => current.filter((_, itemIndex) => itemIndex !== index || current.length === 1))}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="contentCard detailBlock">
        <h2>SEO</h2>
        <div className="adminFormGrid">
          <label className="field fieldFull">
            <span>SEO title</span>
            <input className="input" name="seoTitle" defaultValue={initialProduct?.seo_title ?? ''} />
          </label>
          <label className="field fieldFull">
            <span>SEO meta description</span>
            <textarea className="textarea" name="seoDescription" defaultValue={initialProduct?.seo_description ?? ''} rows={4} />
          </label>
        </div>
      </div>

      <div className="contentCard detailBlock">
        <h2>Images</h2>
        <div className="adminFormGrid">
          <label className="field fieldFull">
            <span>Main image upload</span>
            <input className="input" name="mainImage" type="file" accept="image/*" />
          </label>
          <label className="field fieldFull">
            <span>Gallery image upload</span>
            <input className="input" name="galleryImages" type="file" accept="image/*" multiple />
          </label>
        </div>
        {initialProduct?.main_image_url ? (
          <div className="adminImagePreviewGrid">
            <div className="adminImagePreview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={initialProduct.main_image_url} alt={initialProduct.title || 'Product main image'} />
              <span>Main image</span>
            </div>
          </div>
        ) : null}
        {existingGallery.length ? (
          <div className="adminImagePreviewGrid">
            {existingGallery.map((url) => (
              <label className="adminImagePreview" key={url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Gallery image" />
                <span>
                  <input
                    type="checkbox"
                    name="removeGalleryUrl"
                    value={url}
                    checked={removeGallery.includes(url)}
                    onChange={(event) =>
                      setRemoveGallery((current) => (event.target.checked ? [...current, url] : current.filter((item) => item !== url)))
                    }
                  />{' '}
                  Remove
                </span>
              </label>
            ))}
          </div>
        ) : null}
      </div>

      <div className="contentCard detailBlock">
        <div className="sectionHeaderInline">
          <div>
            <h2>FAQs</h2>
            <p>Practical buying questions that appear on the product page.</p>
          </div>
          <button type="button" className="button buttonSecondary buttonSmall" onClick={() => setFaqs((current) => [...current, { question: '', answer: '' }])}>
            <Plus size={14} /> Add FAQ
          </button>
        </div>
        <div className="adminRepeater">
          {faqs.map((faq, index) => (
            <div className="adminFaqCard" key={`faq-${index}`}>
              <label className="field">
                <span>Question</span>
                <input
                  className="input"
                  name="faqQuestion"
                  value={faq.question}
                  onChange={(event) =>
                    setFaqs((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, question: event.target.value } : item)))
                  }
                />
              </label>
              <label className="field">
                <span>Answer</span>
                <textarea
                  className="textarea"
                  name="faqAnswer"
                  rows={3}
                  value={faq.answer}
                  onChange={(event) =>
                    setFaqs((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, answer: event.target.value } : item)))
                  }
                />
              </label>
              <button type="button" className="button buttonGhost buttonSmall" onClick={() => setFaqs((current) => current.filter((_, itemIndex) => itemIndex !== index || current.length === 1))}>
                <Trash2 size={14} /> Remove FAQ
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="contentCard detailBlock">
        <h2>Status</h2>
        <div className="adminToggleGrid">
          <label className="adminToggle">
            <input type="checkbox" name="isActive" defaultChecked={Boolean(initialProduct?.is_active)} />
            <span>Active</span>
          </label>
          <label className="adminToggle">
            <input type="checkbox" name="isFeatured" defaultChecked={Boolean(initialProduct?.is_featured)} />
            <span>Featured</span>
          </label>
          <label className="adminToggle">
            <input type="checkbox" name="isBundle" defaultChecked={Boolean(initialProduct?.is_bundle)} />
            <span>Bundle</span>
          </label>
        </div>
      </div>

      <div className="adminFormFooter">
        <button type="submit" className="button buttonSecondary" name="intent" value="draft">
          Save draft
        </button>
        <button type="submit" className="button buttonPrimary buttonSheen" name="intent" value="publish">
          Publish
        </button>
        {deleteAction && initialProduct?.id ? (
          <button type="submit" className="button buttonGhost" formAction={deleteAction}>
            Delete product
          </button>
        ) : null}
      </div>
    </form>
  );
}
