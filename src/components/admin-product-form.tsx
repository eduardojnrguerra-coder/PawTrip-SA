'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { DbCategory, DbProductCustomOption, DbProductFaq, DbProductVariant } from '@/lib/supabase/admin';
import { compressImage, uploadAdminProductImage } from '@/lib/supabase/client';

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
  product_variants?: DbProductVariant[] | null;
  product_custom_options?: DbProductCustomOption[] | null;
};

type VariantRow = {
  key: string;
  optionName: string;
  optionValue: string;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  sku: string;
  stockQuantity: string;
  active: boolean;
};

type CustomOptionRow = {
  key: string;
  label: string;
  inputType: 'text' | 'textarea' | 'select';
  required: boolean;
  helpText: string;
  placeholder: string;
  maxLength: string;
  choices: string;
  active: boolean;
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
  const [variants, setVariants] = useState<VariantRow[]>(
    initialProduct?.product_variants?.length
      ? [...initialProduct.product_variants]
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((variant) => ({
            key: variant.id,
            optionName: variant.option_name || 'Size',
            optionValue: variant.option_value || '',
            price: String(variant.price ?? ''),
            compareAtPrice: variant.compare_at_price === null || variant.compare_at_price === undefined ? '' : String(variant.compare_at_price),
            costPrice: variant.cost_price === null || variant.cost_price === undefined ? '' : String(variant.cost_price),
            sku: variant.sku ?? '',
            stockQuantity: String(variant.stock_quantity ?? 0),
            active: variant.active,
          }))
      : [],
  );
  const [customOptions, setCustomOptions] = useState<CustomOptionRow[]>(
    initialProduct?.product_custom_options?.length
      ? [...initialProduct.product_custom_options]
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((option) => ({
            key: option.id,
            label: option.label || '',
            inputType: option.input_type || 'text',
            required: option.required,
            helpText: option.help_text ?? '',
            placeholder: option.placeholder ?? '',
            maxLength: option.max_length === null || option.max_length === undefined ? '' : String(option.max_length),
            choices: option.choices?.join('\n') ?? '',
            active: option.active,
          }))
      : [],
  );
  const [removeGallery, setRemoveGallery] = useState<string[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState(initialProduct?.main_image_url ?? '');
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState(initialProduct?.main_image_url ?? '');
  const [uploadedGalleryUrls, setUploadedGalleryUrls] = useState<string[]>([]);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>(initialProduct?.gallery_image_urls ?? []);
  const [uploadError, setUploadError] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');
  const [isCompressingMain, setIsCompressingMain] = useState(false);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isCompressingGallery, setIsCompressingGallery] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [selectedMainFileName, setSelectedMainFileName] = useState('');
  const [mainImageMeta, setMainImageMeta] = useState('');
  const [selectedGalleryFileNames, setSelectedGalleryFileNames] = useState<string[]>([]);
  const [galleryImageMeta, setGalleryImageMeta] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const existingGallery = useMemo(() => initialProduct?.gallery_image_urls ?? [], [initialProduct?.gallery_image_urls]);
  const visibleGallery = useMemo(
    () => [...existingGallery, ...uploadedGalleryUrls].filter((url) => !removeGallery.includes(url)),
    [existingGallery, removeGallery, uploadedGalleryUrls],
  );
  const currentMainImageUrl = mainImageUrl || initialProduct?.main_image_url || visibleGallery[0] || '';
  const previewGallery = useMemo(
    () => [...new Set([...galleryPreviewUrls, ...visibleGallery])].filter((url) => !removeGallery.includes(url)),
    [galleryPreviewUrls, removeGallery, visibleGallery],
  );

  useEffect(() => {
    setMainImagePreviewUrl(currentMainImageUrl);
  }, [currentMainImageUrl]);

  function onTitleChange(nextTitle: string) {
    setTitle(nextTitle);
    if (!slugTouched) setSlug(slugify(nextTitle));
  }

  function addVariantRow() {
    setVariants((current) => [
      ...current,
      {
        key: `variant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        optionName: current[0]?.optionName || 'Size',
        optionValue: '',
        price: '',
        compareAtPrice: '',
        costPrice: '',
        sku: '',
        stockQuantity: '0',
        active: true,
      },
    ]);
  }

  function updateVariantRow(index: number, patch: Partial<VariantRow>) {
    setVariants((current) => current.map((variant, rowIndex) => (rowIndex === index ? { ...variant, ...patch } : variant)));
  }

  function removeVariantRow(index: number) {
    setVariants((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function addCustomOptionRow() {
    setCustomOptions((current) => [
      ...current,
      {
        key: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: '',
        inputType: 'text',
        required: true,
        helpText: '',
        placeholder: '',
        maxLength: '30',
        choices: '',
        active: true,
      },
    ]);
  }

  function updateCustomOptionRow(index: number, patch: Partial<CustomOptionRow>) {
    setCustomOptions((current) => current.map((option, rowIndex) => (rowIndex === index ? { ...option, ...patch } : option)));
  }

  function removeCustomOptionRow(index: number) {
    setCustomOptions((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_ORIGINAL_SIZE = 15 * 1024 * 1024; // 15 MB pre-compression

  function validateOriginalFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG or WebP image.';
    }
    if (file.size > MAX_ORIGINAL_SIZE) {
      return 'This image is too large. Please use an image under 15 MB.';
    }
    return null;
  }

  function formatFileSize(size: number) {
    return size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(2)} MB` : `${Math.round(size / 1024)} KB`;
  }

  function readImageDimensions(file: File) {
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        resolve({ width: image.naturalWidth, height: image.naturalHeight });
        URL.revokeObjectURL(url);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read image dimensions.'));
      };
      image.src = url;
    });
  }

  async function uploadSingleFile(file: File, kind: 'main' | 'gallery', index = 0) {
    const uploadSlug = slug || slugify(title);
    if (!uploadSlug) {
      throw new Error('Add a product title first so we can generate the image folder path.');
    }

    return uploadAdminProductImage({
      slug: uploadSlug,
      file,
      kind,
      index,
    });
  }

  async function handleMainImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    console.log('Selected image', file.name, file.size, file.type);
    setSelectedMainFileName(file.name);
    try {
      const dimensions = await readImageDimensions(file);
      setMainImageMeta(`${dimensions.width}x${dimensions.height} · ${formatFileSize(file.size)}`);
    } catch {
      setMainImageMeta(formatFileSize(file.size));
    }

    const fileError = validateOriginalFile(file);
    if (fileError) {
      setUploadError(fileError);
      event.target.value = '';
      return;
    }

    setUploadError('');
    setUploadNotice('');
    setIsCompressingMain(true);
    setMainImagePreviewUrl(URL.createObjectURL(file));

    try {
      setUploadNotice('Preparing image...');
      const compressed = await compressImage(file, 2000, 0.84);

      setIsCompressingMain(false);
      setIsUploadingMain(true);
      setUploadNotice('Uploading image...');

      const upload = await uploadSingleFile(compressed, 'main');
      console.log('main image uploaded successfully, URL:', upload.publicUrl);
      setMainImageUrl(upload.publicUrl);
      setMainImagePreviewUrl(upload.publicUrl);
      setRemoveGallery((current) => current.filter((item) => item !== upload.publicUrl));
      setUploadNotice('Image uploaded successfully');
    } catch (error) {
      console.error('Main image upload failed', error);
      const message = error instanceof Error ? error.message : 'Image upload failed.';
      setUploadError(`Upload failed: ${message}`);
    } finally {
      setIsCompressingMain(false);
      setIsUploadingMain(false);
      event.target.value = '';
    }
  }

  async function handleGalleryImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    files.forEach((file) => console.log('Selected image', file.name, file.size, file.type));
    setSelectedGalleryFileNames(files.map((file) => file.name));
    const imageMeta = await Promise.all(
      files.map(async (file) => {
        try {
          const dimensions = await readImageDimensions(file);
          return `${file.name}: ${dimensions.width}x${dimensions.height} · ${formatFileSize(file.size)}`;
        } catch {
          return `${file.name}: ${formatFileSize(file.size)}`;
        }
      }),
    );
    setGalleryImageMeta(imageMeta);

    for (const file of files) {
      const fileError = validateOriginalFile(file);
      if (fileError) {
        setUploadError(fileError);
        event.target.value = '';
        return;
      }
    }

    setUploadError('');
    setUploadNotice('');
    setIsCompressingGallery(true);
    setUploadNotice('Preparing image...');
    const localPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviewUrls((current) => [...current, ...localPreviewUrls]);

    try {
      const compressedFiles: File[] = [];
      for (const file of files) {
        const compressed = await compressImage(file, 2000, 0.84);
        compressedFiles.push(compressed);
      }

      setIsCompressingGallery(false);
      setIsUploadingGallery(true);
      setUploadNotice('Uploading images...');

      const uploads: string[] = [];
      for (const [index, file] of compressedFiles.entries()) {
        console.log(`Uploading gallery image ${index + 1}/${compressedFiles.length}`, file.name);
        const upload = await uploadSingleFile(file, 'gallery', index);
        uploads.push(upload.publicUrl);
      }
      setUploadedGalleryUrls((current) => [...current, ...uploads]);
      setGalleryPreviewUrls((current) => [...current.filter((url) => !localPreviewUrls.includes(url)), ...uploads]);
      setUploadNotice(uploads.length === 1 ? 'Image uploaded successfully' : `${uploads.length} images uploaded successfully`);
    } catch (error) {
      console.error('Gallery image upload failed', error);
      const message = error instanceof Error ? error.message : 'Image upload failed.';
      setUploadError(`Upload failed: ${message}`);
    } finally {
      setIsCompressingGallery(false);
      setIsUploadingGallery(false);
      event.target.value = '';
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (isCompressingMain || isCompressingGallery || isUploadingMain || isUploadingGallery) {
      event.preventDefault();
      setUploadError('Please wait for image uploads to finish before saving.');
      return;
    }
    setIsSaving(true);
  }

  return (
    <form action={action} className="adminProductForm" onSubmit={handleSubmit}>
      {initialProduct?.id ? <input type="hidden" name="id" value={initialProduct.id} /> : null}
      {currentMainImageUrl ? <input type="hidden" name="existingMainImage" value={currentMainImageUrl} /> : null}
      {currentMainImageUrl ? <input type="hidden" name="mainImageUrl" value={currentMainImageUrl} /> : null}
      {visibleGallery.map((url) => (
        <input key={`gallery-${url}`} type="hidden" name="existingGalleryUrl" value={url} />
      ))}
      {visibleGallery.map((url) => (
        <input key={`gallery-upload-${url}`} type="hidden" name="galleryImageUrl" value={url} />
      ))}

      {saved ? <p className="successText">Saved successfully.</p> : null}
      {error ? <p className="errorText">{error}</p> : null}
      {uploadError ? <p className="errorText">{uploadError}</p> : null}
      {uploadNotice ? <p className="successText">{uploadNotice}</p> : null}
      {isSaving ? <p className="successText">Saving product...</p> : null}

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
          {!categories.length ? (
            <small>
              No categories found. <Link href="/admin/categories">Create a category</Link> before publishing.
            </small>
          ) : null}
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
          <small>Use this for margin and dashboard profit estimates.</small>
        </label>

        <label className="field">
          <span>SKU</span>
          <input className="input" name="sku" defaultValue={initialProduct?.sku ?? ''} />
        </label>

        <label className="field">
          <span>Stock quantity</span>
          <input className="input" name="stockQuantity" type="number" min="0" step="1" defaultValue={initialProduct?.stock_quantity ?? 0} />
          {variants.length ? <small>Used as a fallback. Active variants carry their own public stock.</small> : null}
        </label>

        <div className="field fieldFull adminNestedPanel">
          <div className="sectionHeaderInline">
            <div>
              <span>Variants</span>
              <small>Add sizes, colours or other purchasable options with separate prices, SKUs and stock.</small>
            </div>
            <button type="button" className="button buttonSecondary buttonSmall" onClick={addVariantRow}>
              <Plus size={14} /> Add variant
            </button>
          </div>
          {!variants.length ? (
            <p className="mutedText">No variants enabled. This product will use the main product price and stock.</p>
          ) : (
            <div className="adminVariantTable">
              {variants.map((variant, index) => (
                <div className="adminVariantRow" key={variant.key}>
                  <input type="hidden" name="variantActive" value={variant.active ? 'true' : 'false'} />
                  <label className="field">
                    <span>Option</span>
                    <input
                      className="input"
                      name="variantOptionName"
                      value={variant.optionName}
                      onChange={(event) => updateVariantRow(index, { optionName: event.target.value })}
                      placeholder="Size"
                    />
                  </label>
                  <label className="field">
                    <span>Value</span>
                    <input
                      className="input"
                      name="variantOptionValue"
                      value={variant.optionValue}
                      onChange={(event) => updateVariantRow(index, { optionValue: event.target.value })}
                      placeholder="Small - 60 x 47 cm"
                    />
                  </label>
                  <label className="field">
                    <span>Price</span>
                    <input
                      className="input"
                      name="variantPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(event) => updateVariantRow(index, { price: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Compare-at</span>
                    <input
                      className="input"
                      name="variantCompareAtPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.compareAtPrice}
                      onChange={(event) => updateVariantRow(index, { compareAtPrice: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Cost</span>
                    <input
                      className="input"
                      name="variantCostPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.costPrice}
                      onChange={(event) => updateVariantRow(index, { costPrice: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>SKU</span>
                    <input
                      className="input"
                      name="variantSku"
                      value={variant.sku}
                      onChange={(event) => updateVariantRow(index, { sku: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Stock</span>
                    <input
                      className="input"
                      name="variantStockQuantity"
                      type="number"
                      min="0"
                      step="1"
                      value={variant.stockQuantity}
                      onChange={(event) => updateVariantRow(index, { stockQuantity: event.target.value })}
                    />
                  </label>
                  <label className="adminToggle adminVariantToggle">
                    <input
                      type="checkbox"
                      checked={variant.active}
                      onChange={(event) => updateVariantRow(index, { active: event.target.checked })}
                    />
                    <span>Active</span>
                  </label>
                  <button type="button" className="iconButton subtle" onClick={() => removeVariantRow(index)} aria-label="Remove variant">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="field fieldFull">
          <span>Short description</span>
          <textarea className="textarea" name="shortDescription" defaultValue={initialProduct?.short_description ?? ''} rows={3} />
        </label>

        <div className="field fieldFull adminNestedPanel">
          <div className="sectionHeaderInline">
            <div>
              <span>Custom product options</span>
              <small>Use for personalised ID tags, engraving text, phone numbers or selectable tag colours.</small>
            </div>
            <button type="button" className="button buttonSecondary buttonSmall" onClick={addCustomOptionRow}>
              <Plus size={14} /> Add option
            </button>
          </div>
          {!customOptions.length ? (
            <p className="mutedText">No custom options. Customers can add this product straight to cart.</p>
          ) : (
            <div className="adminCustomOptionTable">
              {customOptions.map((option, index) => (
                <div className="adminCustomOptionRow" key={option.key}>
                  <input type="hidden" name="customOptionRequired" value={option.required ? 'true' : 'false'} />
                  <input type="hidden" name="customOptionActive" value={option.active ? 'true' : 'false'} />
                  <label className="field">
                    <span>Label</span>
                    <input
                      className="input"
                      name="customOptionLabel"
                      value={option.label}
                      onChange={(event) => updateCustomOptionRow(index, { label: event.target.value })}
                      placeholder="Engraving line 1"
                    />
                  </label>
                  <label className="field">
                    <span>Type</span>
                    <select
                      className="input"
                      name="customOptionInputType"
                      value={option.inputType}
                      onChange={(event) => updateCustomOptionRow(index, { inputType: event.target.value as CustomOptionRow['inputType'] })}
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Long text</option>
                      <option value="select">Select</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Max length</span>
                    <input
                      className="input"
                      name="customOptionMaxLength"
                      type="number"
                      min="1"
                      step="1"
                      value={option.maxLength}
                      onChange={(event) => updateCustomOptionRow(index, { maxLength: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Placeholder</span>
                    <input
                      className="input"
                      name="customOptionPlaceholder"
                      value={option.placeholder}
                      onChange={(event) => updateCustomOptionRow(index, { placeholder: event.target.value })}
                      placeholder="Bella"
                    />
                  </label>
                  <label className="field fieldWide">
                    <span>Help text</span>
                    <input
                      className="input"
                      name="customOptionHelpText"
                      value={option.helpText}
                      onChange={(event) => updateCustomOptionRow(index, { helpText: event.target.value })}
                      placeholder="Keep engraving short and double-check spelling."
                    />
                  </label>
                  <label className="field fieldWide">
                    <span>Choices</span>
                    <textarea
                      className="textarea"
                      name="customOptionChoices"
                      rows={3}
                      value={option.choices}
                      onChange={(event) => updateCustomOptionRow(index, { choices: event.target.value })}
                      placeholder={'Black\nSilver\nGold'}
                    />
                    <small>Only used for select fields. One choice per line.</small>
                  </label>
                  <label className="adminToggle adminVariantToggle">
                    <input
                      type="checkbox"
                      checked={option.required}
                      onChange={(event) => updateCustomOptionRow(index, { required: event.target.checked })}
                    />
                    <span>Required</span>
                  </label>
                  <label className="adminToggle adminVariantToggle">
                    <input
                      type="checkbox"
                      checked={option.active}
                      onChange={(event) => updateCustomOptionRow(index, { active: event.target.checked })}
                    />
                    <span>Active</span>
                  </label>
                  <button type="button" className="iconButton subtle" onClick={() => removeCustomOptionRow(index)} aria-label="Remove custom option">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
            <input className="input" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleMainImageChange} />
            <small>
              {selectedMainFileName ? `Selected: ${selectedMainFileName}. ` : ''}
              {mainImageMeta ? `${mainImageMeta}. ` : ''}
              {isCompressingMain ? 'Preparing image...' : isUploadingMain ? 'Uploading image...' : 'Images are resized, compressed and uploaded to Supabase Storage first. The product saves with the URL only.'}
            </small>
          </label>
          <label className="field fieldFull">
            <span>Gallery image upload</span>
            <input className="input" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple onChange={handleGalleryImageChange} />
            <small>
              {selectedGalleryFileNames.length ? `Selected: ${selectedGalleryFileNames.join(', ')}. ` : ''}
              {galleryImageMeta.length ? `${galleryImageMeta.join(' | ')}. ` : ''}
              {isCompressingGallery ? 'Preparing image...' : isUploadingGallery ? 'Uploading image...' : 'Gallery images are optimized and saved as public URLs.'}
            </small>
          </label>
        </div>
        {mainImagePreviewUrl ? (
          <div className="adminImagePreviewGrid">
            <div className="adminImagePreview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mainImagePreviewUrl} alt={initialProduct?.title || title || 'Product main image'} />
              <span>Main image</span>
            </div>
          </div>
        ) : null}
        {previewGallery.length ? (
          <div className="adminImagePreviewGrid">
            {previewGallery.map((url) => (
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
        <button type="submit" className="button buttonSecondary" name="intent" value="draft" disabled={isCompressingMain || isCompressingGallery || isUploadingMain || isUploadingGallery || isSaving}>
          Save draft
        </button>
        <button type="submit" className="button buttonPrimary buttonSheen" name="intent" value="publish" disabled={isCompressingMain || isCompressingGallery || isUploadingMain || isUploadingGallery || isSaving}>
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
