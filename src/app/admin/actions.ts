'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  signInAdminWithPassword,
  requireAdminUser,
} from '@/lib/supabase/server';
import {
  deactivateKitById,
  deleteProductById,
  getCategoryBySlugAdmin,
  getKitBySlugAdmin,
  getProductBySlugAdmin,
  replaceProductCustomOptions,
  replaceProductFaqs,
  replaceProductVariants,
  replaceKitItems,
  saveCategory,
  supabaseAdminRequest,
  updateOrderPaymentManual,
  updateOrderFulfillment,
  upsertKit,
  upsertProduct,
} from '@/lib/supabase/admin';

function clean(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function parseNumber(value: FormDataEntryValue | null) {
  const text = clean(value);
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function parseStringArray(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => clean(value))
    .filter(Boolean);
}

function parseFaqs(formData: FormData) {
  const questions = formData.getAll('faqQuestion').map((value) => clean(value));
  const answers = formData.getAll('faqAnswer').map((value) => clean(value));
  return questions
    .map((question, index) => ({
      question,
      answer: answers[index] ?? '',
      sort_order: index,
    }))
    .filter((faq) => faq.question && faq.answer);
}

function parseVariants(formData: FormData) {
  const optionNames = formData.getAll('variantOptionName').map((value) => clean(value) || 'Size');
  const optionValues = formData.getAll('variantOptionValue').map((value) => clean(value));
  const prices = formData.getAll('variantPrice').map((value) => parseNumber(value));
  const compareAtPrices = formData.getAll('variantCompareAtPrice').map((value) => parseNumber(value));
  const costPrices = formData.getAll('variantCostPrice').map((value) => parseNumber(value));
  const skus = formData.getAll('variantSku').map((value) => clean(value) || null);
  const stockQuantities = formData.getAll('variantStockQuantity').map((value) => parseNumber(value));
  const activeFlags = formData.getAll('variantActive').map((value) => clean(value));

  return optionValues
    .map((optionValue, index) => ({
      option_name: optionNames[index] || 'Size',
      option_value: optionValue,
      price: prices[index],
      compare_at_price: compareAtPrices[index],
      cost_price: costPrices[index],
      sku: skus[index],
      stock_quantity: Math.max(0, Math.floor(stockQuantities[index] ?? 0)),
      active: activeFlags[index] !== 'false',
      sort_order: index,
    }))
    .filter((variant) => variant.option_value && variant.price !== null && variant.price > 0)
    .map((variant) => ({ ...variant, price: variant.price ?? 0 }));
}

function parseCustomOptions(formData: FormData) {
  const labels = formData.getAll('customOptionLabel').map((value) => clean(value));
  const inputTypes = formData.getAll('customOptionInputType').map((value) => clean(value));
  const maxLengths = formData.getAll('customOptionMaxLength').map((value) => parseNumber(value));
  const placeholders = formData.getAll('customOptionPlaceholder').map((value) => clean(value) || null);
  const helpTexts = formData.getAll('customOptionHelpText').map((value) => clean(value) || null);
  const choices = formData.getAll('customOptionChoices').map((value) =>
    clean(value)
      .split(/\r?\n/)
      .map((choice) => choice.trim())
      .filter(Boolean),
  );
  const requiredFlags = formData.getAll('customOptionRequired').map((value) => clean(value));
  const activeFlags = formData.getAll('customOptionActive').map((value) => clean(value));

  return labels
    .map((label, index) => {
      const inputType: 'text' | 'textarea' | 'select' =
        inputTypes[index] === 'textarea' || inputTypes[index] === 'select' ? inputTypes[index] : 'text';
      return {
        label,
        input_type: inputType,
        required: requiredFlags[index] !== 'false',
        help_text: helpTexts[index],
        placeholder: placeholders[index],
        max_length: maxLengths[index] && maxLengths[index]! > 0 ? Math.floor(maxLengths[index]!) : null,
        choices: choices[index] ?? [],
        active: activeFlags[index] !== 'false',
        sort_order: index,
      };
    })
    .filter((option) => option.label);
}

function parseKitItems(formData: FormData) {
  const productIds = formData.getAll('kitProductId').map((value) => clean(value));
  const quantities = formData.getAll('kitQuantity').map((value) => parseNumber(value));
  return productIds
    .map((productId, index) => ({
      product_id: productId,
      quantity: Math.max(1, Math.floor(quantities[index] ?? 1)),
      sort_order: index,
    }))
    .filter((item) => item.product_id);
}

async function validateProductPayload(formData: FormData, productId?: string) {
  const title = clean(formData.get('title'));
  const derivedSlug = slugify(title);
  const slug = slugify(clean(formData.get('slug')) || derivedSlug);
  const price = parseNumber(formData.get('price'));
  const compareAtPrice = parseNumber(formData.get('compareAtPrice'));
  const costPrice = parseNumber(formData.get('costPrice'));
  const stockQuantity = parseNumber(formData.get('stockQuantity'));
  const categoryId = clean(formData.get('categoryId')) || null;
  const intent = clean(formData.get('intent'));
  const variants = parseVariants(formData);
  const customOptions = parseCustomOptions(formData);

  if (!title) return { error: 'Title is required.' };
  if (!slug) return { error: 'Slug is required.' };
  if (price === null || price <= 0) return { error: 'Price must be greater than zero.' };
  if (compareAtPrice !== null && compareAtPrice <= price) return { error: 'Compare-at price must be greater than price.' };
  if (stockQuantity !== null && stockQuantity < 0) return { error: 'Stock quantity cannot be negative.' };
  const invalidVariantCompareAt = variants.find((variant) => variant.compare_at_price !== null && variant.compare_at_price <= (variant.price ?? 0));
  if (invalidVariantCompareAt) return { error: `Variant compare-at price must be greater than variant price for ${invalidVariantCompareAt.option_value}.` };

  const existing = await getProductBySlugAdmin(slug);
  if (existing.data && existing.data.id !== productId) {
    return { error: 'That slug is already in use. Please choose another one.' };
  }

  return {
    error: null,
    values: {
      title,
      slug,
      price,
      compareAtPrice,
      costPrice,
      stockQuantity: stockQuantity ?? 0,
      categoryId,
      shortDescription: clean(formData.get('shortDescription')),
      description: clean(formData.get('description')),
      benefits: parseStringArray(formData, 'benefit'),
      tags: parseStringArray(formData, 'tag'),
      seoTitle: clean(formData.get('seoTitle')),
      seoDescription: clean(formData.get('seoDescription')),
      sku: clean(formData.get('sku')) || null,
      isActive: intent === 'publish' ? true : intent === 'draft' ? false : clean(formData.get('isActive')) === 'on',
      isFeatured: clean(formData.get('isFeatured')) === 'on',
      isBundle: clean(formData.get('isBundle')) === 'on',
      mainImageUrl: clean(formData.get('mainImageUrl')) || null,
      galleryImageUrls: parseStringArray(formData, 'galleryImageUrl'),
      removeGalleryUrls: parseStringArray(formData, 'removeGalleryUrl'),
      faqs: parseFaqs(formData),
      variants,
      customOptions,
    },
  };
}

async function validateKitPayload(formData: FormData, kitId?: string) {
  const title = clean(formData.get('title'));
  const slug = slugify(clean(formData.get('slug')) || title);
  const price = parseNumber(formData.get('price'));
  const compareAtPrice = parseNumber(formData.get('compareAtPrice'));
  const costPrice = parseNumber(formData.get('costPrice'));
  const isActive = clean(formData.get('active')) === 'on';
  const items = parseKitItems(formData);

  if (!title) return { error: 'Kit title is required.' };
  if (!slug) return { error: 'Kit slug is required.' };
  if (price === null || price <= 0) return { error: 'Kit price must be greater than zero.' };
  if (compareAtPrice !== null && compareAtPrice <= price) return { error: 'Compare-at price must be greater than kit price.' };
  if (isActive && !items.length) return { error: 'Active kits should include at least one product.' };

  const existing = await getKitBySlugAdmin(slug);
  if (existing.data && existing.data.id !== kitId) {
    return { error: 'That kit slug is already in use. Please choose another one.' };
  }

  return {
    error: null,
    values: {
      title,
      slug,
      category: clean(formData.get('category')) || 'Travel Kits',
      categoryId: clean(formData.get('categoryId')) || null,
      problemKey: clean(formData.get('problemKey')) || null,
      shortDescription: clean(formData.get('shortDescription')),
      fullDescription: clean(formData.get('fullDescription')),
      whyItHelps: clean(formData.get('whyItHelps')),
      price,
      compareAtPrice,
      costPrice,
      imageUrl: clean(formData.get('imageUrl')) || null,
      imageAlt: clean(formData.get('imageAlt')) || null,
      badgeText: clean(formData.get('badgeText')) || null,
      savingsText: clean(formData.get('savingsText')) || null,
      bestFor: parseStringArray(formData, 'bestFor'),
      active: isActive,
      featured: clean(formData.get('featured')) === 'on',
      sortOrder: parseNumber(formData.get('sortOrder')) ?? 0,
      seoTitle: clean(formData.get('seoTitle')) || null,
      seoDescription: clean(formData.get('seoDescription')) || null,
      items,
    },
  };
}

export async function loginAdminAction(formData: FormData) {
  const email = clean(formData.get('email')).toLowerCase();
  const password = clean(formData.get('password'));
  const result = await signInAdminWithPassword(email, password);

  if (!result.data || result.error) {
    redirect('/admin/login?error=1');
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_ACCESS_COOKIE, result.data.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: result.data.expires_in,
  });
  cookieStore.set(ADMIN_REFRESH_COOKIE, result.data.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect('/admin');
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_ACCESS_COOKIE);
  cookieStore.delete(ADMIN_REFRESH_COOKIE);
  redirect('/admin/login');
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdminUser();
  const id = clean(formData.get('id')) || undefined;
  const name = clean(formData.get('name'));
  const slug = slugify(clean(formData.get('slug')) || name);
  const description = clean(formData.get('description')) || null;
  const imageUrl = clean(formData.get('imageUrl')) || null;
  const sortOrder = parseNumber(formData.get('sortOrder')) ?? 0;
  const isActive = clean(formData.get('isActive')) === 'on';

  if (!name || !slug) redirect('/admin/categories?error=validation');

  let duplicateSlug = false;
  try {
    const existing = await getCategoryBySlugAdmin(slug);
    if (existing.data && existing.data.id !== id) {
      duplicateSlug = true;
    }
  } catch (error) {
    console.error('saveCategoryAction slug check failed', error);
    redirect('/admin/categories?error=save');
  }
  if (duplicateSlug) redirect('/admin/categories?error=duplicate');

  let saveError: string | null = null;
  try {
    const result = await saveCategory({
      id,
      name,
      slug,
      description,
      image_url: imageUrl,
      sort_order: sortOrder,
      is_active: isActive,
    });

    if (result.error) {
      console.error('saveCategoryAction failed', result.error);
      saveError = result.error;
    }
  } catch (error) {
    console.error('saveCategoryAction crashed', error);
    redirect('/admin/categories?error=save');
  }
  if (saveError) redirect('/admin/categories?error=save');

  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/admin/categories');
  redirect('/admin/categories?saved=1');
}

export async function createProductAction(formData: FormData) {
  await requireAdminUser();

  let validation;
  try {
    validation = await validateProductPayload(formData);
  } catch (error) {
    console.error('createProductAction validation crashed', error);
    redirect('/admin/products/new?error=validation');
  }

  if (validation.error || !validation.values) {
    redirect(`/admin/products/new?error=${encodeURIComponent(validation.error || 'validation')}`);
  }

  const galleryImageUrls = Array.from(
    new Set(
      [validation.values.mainImageUrl, ...validation.values.galleryImageUrls]
        .filter((value): value is string => Boolean(value && value.trim().length)),
    ),
  );
  const mainImageUrl = validation.values.mainImageUrl || galleryImageUrls[0] || null;

  let productResult;
  try {
    productResult = await upsertProduct({
      title: validation.values.title,
      slug: validation.values.slug,
      short_description: validation.values.shortDescription || null,
      description: validation.values.description || null,
      benefits: validation.values.benefits,
      price: validation.values.price,
      compare_at_price: validation.values.compareAtPrice,
      cost_price: validation.values.costPrice,
      sku: validation.values.sku,
      stock_quantity: validation.values.stockQuantity,
      category_id: validation.values.categoryId,
      tags: validation.values.tags,
      seo_title: validation.values.seoTitle || null,
      seo_description: validation.values.seoDescription || null,
      main_image_url: mainImageUrl,
      gallery_image_urls: galleryImageUrls,
      is_active: validation.values.isActive,
      is_featured: validation.values.isFeatured,
      is_bundle: validation.values.isBundle,
    });
  } catch (error) {
    console.error('createProductAction failed', error);
    if (validation.values.isActive) console.error('publishProductAction failed', error);
    redirect('/admin/products/new?error=save');
  }

  const product = productResult.data?.[0];
  if (!product || productResult.error) {
    console.error('createProductAction failed', productResult.error || 'no data returned');
    if (validation.values.isActive) console.error('publishProductAction failed', productResult.error || 'no data returned');
    redirect('/admin/products/new?error=save');
  }

  try {
    const faqResult = await replaceProductFaqs(product.id, validation.values.faqs);
    if (faqResult.error) {
      console.error('createProductAction faq replace failed', faqResult.error);
    }
  } catch (error) {
    console.error('createProductAction faq replace crashed', error);
  }

  let variantSaveFailed = false;
  try {
    const variantResult = await replaceProductVariants(product.id, validation.values.variants);
    if (variantResult.error) {
      console.error('createProductAction variant replace failed', variantResult.error);
      variantSaveFailed = true;
    }
  } catch (error) {
    console.error('createProductAction variant replace crashed', error);
    variantSaveFailed = true;
  }
  if (variantSaveFailed) redirect(`/admin/products/${product.id}/edit?error=variants`);

  let customOptionsSaveFailed = false;
  try {
    const customOptionResult = await replaceProductCustomOptions(product.id, validation.values.customOptions);
    if (customOptionResult.error) {
      console.error('createProductAction custom options replace failed', customOptionResult.error);
      customOptionsSaveFailed = true;
    }
  } catch (error) {
    console.error('createProductAction custom options replace crashed', error);
    customOptionsSaveFailed = true;
  }
  if (customOptionsSaveFailed) redirect(`/admin/products/${product.id}/edit?error=custom-options`);

  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/admin/products');
  redirect('/admin/products?created=1');
}

export async function updateProductAction(formData: FormData) {
  await requireAdminUser();
  const productId = clean(formData.get('id'));
  const existingGallery = parseStringArray(formData, 'existingGalleryUrl');
  const existingMainImage = clean(formData.get('existingMainImage')) || null;

  if (!productId) redirect('/admin/products?error=missing');

  let validation;
  try {
    validation = await validateProductPayload(formData, productId);
  } catch (error) {
    console.error('updateProductAction validation crashed', error);
    redirect(`/admin/products/${productId}/edit?error=validation`);
  }

  if (validation.error || !validation.values) {
    redirect(`/admin/products/${productId}/edit?error=${encodeURIComponent(validation.error || 'validation')}`);
  }

  const nextGallery = existingGallery.filter((url) => !validation.values.removeGalleryUrls.includes(url));
  const uploadedGallery = validation.values.galleryImageUrls.filter((url) => !validation.values.removeGalleryUrls.includes(url));
  const galleryImageUrls = Array.from(
    new Set(
      [validation.values.mainImageUrl || existingMainImage, ...nextGallery, ...uploadedGallery]
        .filter((value): value is string => Boolean(value && value.trim().length)),
    ),
  );
  const mainImageUrl =
    (validation.values.mainImageUrl && !validation.values.removeGalleryUrls.includes(validation.values.mainImageUrl)
      ? validation.values.mainImageUrl
      : existingMainImage && !validation.values.removeGalleryUrls.includes(existingMainImage)
        ? existingMainImage
        : galleryImageUrls[0]) || null;

  let productResult;
  try {
    productResult = await upsertProduct({
      id: productId,
      title: validation.values.title,
      slug: validation.values.slug,
      short_description: validation.values.shortDescription || null,
      description: validation.values.description || null,
      benefits: validation.values.benefits,
      price: validation.values.price,
      compare_at_price: validation.values.compareAtPrice,
      cost_price: validation.values.costPrice,
      sku: validation.values.sku,
      stock_quantity: validation.values.stockQuantity,
      category_id: validation.values.categoryId,
      tags: validation.values.tags,
      seo_title: validation.values.seoTitle || null,
      seo_description: validation.values.seoDescription || null,
      main_image_url: mainImageUrl,
      gallery_image_urls: galleryImageUrls,
      is_active: validation.values.isActive,
      is_featured: validation.values.isFeatured,
      is_bundle: validation.values.isBundle,
    });
  } catch (error) {
    console.error('updateProductAction failed', error);
    if (validation.values.isActive) console.error('publishProductAction failed', error);
    redirect(`/admin/products/${productId}/edit?error=save`);
  }

  const product = productResult.data?.[0];
  if (!product || productResult.error) {
    console.error('updateProductAction failed', productResult.error || 'no data returned');
    if (validation.values.isActive) console.error('publishProductAction failed', productResult.error || 'no data returned');
    redirect(`/admin/products/${productId}/edit?error=save`);
  }

  try {
    const faqResult = await replaceProductFaqs(product.id, validation.values.faqs);
    if (faqResult.error) {
      console.error('updateProductAction faq replace failed', faqResult.error);
    }
  } catch (error) {
    console.error('updateProductAction faq replace crashed', error);
  }

  let variantSaveFailed = false;
  try {
    const variantResult = await replaceProductVariants(product.id, validation.values.variants);
    if (variantResult.error) {
      console.error('updateProductAction variant replace failed', variantResult.error);
      variantSaveFailed = true;
    }
  } catch (error) {
    console.error('updateProductAction variant replace crashed', error);
    variantSaveFailed = true;
  }
  if (variantSaveFailed) redirect(`/admin/products/${productId}/edit?error=variants`);

  let customOptionsSaveFailed = false;
  try {
    const customOptionResult = await replaceProductCustomOptions(product.id, validation.values.customOptions);
    if (customOptionResult.error) {
      console.error('updateProductAction custom options replace failed', customOptionResult.error);
      customOptionsSaveFailed = true;
    }
  } catch (error) {
    console.error('updateProductAction custom options replace crashed', error);
    customOptionsSaveFailed = true;
  }
  if (customOptionsSaveFailed) redirect(`/admin/products/${productId}/edit?error=custom-options`);

  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath(`/shop/product/${product.slug}`);
  revalidatePath('/admin/products');
  redirect(`/admin/products/${productId}/edit?saved=1`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminUser();
  const id = clean(formData.get('id'));
  if (!id) redirect('/admin/products?error=missing');

  try {
    const faqDelete = await supabaseAdminRequest<null>(`product_faqs?product_id=eq.${id}`, { method: 'DELETE' });
    if (faqDelete.error) {
      console.error('deleteProductAction faq delete failed', faqDelete.error);
    }
    await deleteProductById(id);
  } catch (error) {
    console.error('deleteProductAction crashed', error);
    redirect('/admin/products?error=delete');
  }

  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/admin/products');
  redirect('/admin/products?deleted=1');
}

export async function createKitAction(formData: FormData) {
  await requireAdminUser();

  let validation;
  try {
    validation = await validateKitPayload(formData);
  } catch (error) {
    console.error('createKitAction validation crashed', error);
    redirect('/admin/kits/new?error=validation');
  }

  if (validation.error || !validation.values) {
    redirect(`/admin/kits/new?error=${encodeURIComponent(validation.error || 'validation')}`);
  }

  let kitResult;
  try {
    kitResult = await upsertKit({
      title: validation.values.title,
      slug: validation.values.slug,
      category: validation.values.category,
      category_id: validation.values.categoryId,
      problem_key: validation.values.problemKey,
      short_description: validation.values.shortDescription || null,
      full_description: validation.values.fullDescription || null,
      why_it_helps: validation.values.whyItHelps || null,
      price: validation.values.price,
      compare_at_price: validation.values.compareAtPrice,
      cost_price: validation.values.costPrice,
      image_url: validation.values.imageUrl,
      image_alt: validation.values.imageAlt,
      badge_text: validation.values.badgeText,
      savings_text: validation.values.savingsText,
      best_for: validation.values.bestFor,
      active: validation.values.active,
      featured: validation.values.featured,
      sort_order: validation.values.sortOrder,
      seo_title: validation.values.seoTitle,
      seo_description: validation.values.seoDescription,
    });
  } catch (error) {
    console.error('createKitAction failed', error);
    redirect('/admin/kits/new?error=save');
  }

  const kit = kitResult.data?.[0];
  if (!kit || kitResult.error) {
    console.error('createKitAction failed', kitResult.error || 'no data returned');
    redirect('/admin/kits/new?error=save');
  }

  const itemsResult = await replaceKitItems(kit.id, validation.values.items);
  if (itemsResult.error) {
    console.error('createKitAction items failed', itemsResult.error);
    redirect(`/admin/kits/${kit.id}/edit?error=items`);
  }

  revalidatePath('/');
  revalidatePath('/problems');
  revalidatePath('/shop');
  revalidatePath('/admin/kits');
  redirect('/admin/kits?created=1');
}

export async function updateKitAction(formData: FormData) {
  await requireAdminUser();
  const kitId = clean(formData.get('id'));
  if (!kitId) redirect('/admin/kits?error=missing');

  let validation;
  try {
    validation = await validateKitPayload(formData, kitId);
  } catch (error) {
    console.error('updateKitAction validation crashed', error);
    redirect(`/admin/kits/${kitId}/edit?error=validation`);
  }

  if (validation.error || !validation.values) {
    redirect(`/admin/kits/${kitId}/edit?error=${encodeURIComponent(validation.error || 'validation')}`);
  }

  let kitResult;
  try {
    kitResult = await upsertKit({
      id: kitId,
      title: validation.values.title,
      slug: validation.values.slug,
      category: validation.values.category,
      category_id: validation.values.categoryId,
      problem_key: validation.values.problemKey,
      short_description: validation.values.shortDescription || null,
      full_description: validation.values.fullDescription || null,
      why_it_helps: validation.values.whyItHelps || null,
      price: validation.values.price,
      compare_at_price: validation.values.compareAtPrice,
      cost_price: validation.values.costPrice,
      image_url: validation.values.imageUrl,
      image_alt: validation.values.imageAlt,
      badge_text: validation.values.badgeText,
      savings_text: validation.values.savingsText,
      best_for: validation.values.bestFor,
      active: validation.values.active,
      featured: validation.values.featured,
      sort_order: validation.values.sortOrder,
      seo_title: validation.values.seoTitle,
      seo_description: validation.values.seoDescription,
    });
  } catch (error) {
    console.error('updateKitAction failed', error);
    redirect(`/admin/kits/${kitId}/edit?error=save`);
  }

  const kit = kitResult.data?.[0];
  if (!kit || kitResult.error) {
    console.error('updateKitAction failed', kitResult.error || 'no data returned');
    redirect(`/admin/kits/${kitId}/edit?error=save`);
  }

  const itemsResult = await replaceKitItems(kit.id, validation.values.items);
  if (itemsResult.error) {
    console.error('updateKitAction items failed', itemsResult.error);
    redirect(`/admin/kits/${kit.id}/edit?error=items`);
  }

  revalidatePath('/');
  revalidatePath('/problems');
  revalidatePath('/shop');
  revalidatePath(`/shop/product/${kit.slug}`);
  revalidatePath('/admin/kits');
  redirect(`/admin/kits/${kitId}/edit?saved=1`);
}

export async function deactivateKitAction(formData: FormData) {
  await requireAdminUser();
  const id = clean(formData.get('id'));
  if (!id) redirect('/admin/kits?error=missing');

  try {
    const result = await deactivateKitById(id);
    if (result.error) {
      console.error('deactivateKitAction failed', result.error);
      redirect('/admin/kits?error=delete');
    }
  } catch (error) {
    console.error('deactivateKitAction crashed', error);
    redirect('/admin/kits?error=delete');
  }

  revalidatePath('/problems');
  revalidatePath('/shop');
  revalidatePath('/admin/kits');
  redirect('/admin/kits?deactivated=1');
}

export async function updateOrderFulfillmentAction(formData: FormData) {
  await requireAdminUser();
  const orderReference = clean(formData.get('orderReference'));
  const fulfillmentStatus = clean(formData.get('fulfillmentStatus'));
  if (!orderReference || !fulfillmentStatus) redirect('/admin/orders?error=invalid');

  try {
    const result = await updateOrderFulfillment(orderReference, fulfillmentStatus);
    if (result.error) {
      console.error('updateOrderFulfillmentAction failed', result.error);
      redirect('/admin/orders?error=update');
    }
  } catch (error) {
    console.error('updateOrderFulfillmentAction crashed', error);
    redirect('/admin/orders?error=update');
  }

  redirect('/admin/orders?updated=1');
}

export async function markOrderPaidManualAction(formData: FormData) {
  await requireAdminUser();
  const orderReference = clean(formData.get('orderReference'));
  const confirmation = clean(formData.get('confirmManualPaid'));
  if (!orderReference || confirmation !== 'yes') redirect('/admin/orders?error=invalid');

  try {
    const result = await updateOrderPaymentManual(orderReference);
    if (result.error) {
      console.error('markOrderPaidManualAction failed', result.error);
      redirect('/admin/orders?error=payment');
    }
  } catch (error) {
    console.error('markOrderPaidManualAction crashed', error);
    redirect('/admin/orders?error=payment');
  }

  redirect(`/admin/orders/${encodeURIComponent(orderReference)}?paid=manual`);
}
