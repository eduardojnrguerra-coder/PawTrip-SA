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
  deleteProductById,
  getProductBySlugAdmin,
  replaceProductFaqs,
  saveCategory,
  supabaseAdminRequest,
  updateOrderFulfillment,
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

  if (!title) return { error: 'Title is required.' };
  if (!slug) return { error: 'Slug is required.' };
  if (price === null || price <= 0) return { error: 'Price must be greater than zero.' };
  if (compareAtPrice !== null && compareAtPrice <= price) return { error: 'Compare-at price must be greater than price.' };
  if (stockQuantity !== null && stockQuantity < 0) return { error: 'Stock quantity cannot be negative.' };

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
      redirect('/admin/categories?error=save');
    }
  } catch (error) {
    console.error('saveCategoryAction crashed', error);
    redirect('/admin/categories?error=save');
  }

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
    console.error('createProductAction upsert crashed', error);
    redirect('/admin/products/new?error=save');
  }

  const product = productResult.data?.[0];
  if (!product || productResult.error) {
    console.error('createProductAction upsert failed', productResult.error || 'no data returned');
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
    redirect(`/admin/products/${productId}/edit?error=save`);
  }

  const product = productResult.data?.[0];
  if (!product || productResult.error) {
    console.error('updateProductAction failed', productResult.error || 'no data returned');
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
