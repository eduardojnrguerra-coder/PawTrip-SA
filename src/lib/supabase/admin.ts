import { getSupabaseServiceRoleKey, getSupabaseUrl, isSupabaseConfigured } from '@/lib/supabase/config';

export type DbCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DbProduct = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  benefits: string[] | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  sku: string | null;
  stock_quantity: number;
  category_id: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  main_image_url: string | null;
  gallery_image_urls: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  is_bundle: boolean;
  created_at: string;
  updated_at: string;
};

export type DbProductFaq = {
  id: string;
  product_id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DbOrder = {
  id: string;
  order_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_status: string;
  fulfillment_status: string;
  payfast_payment_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DbOrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  product_slug: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
};

type RestResult<T> = { data: T | null; error: string | null; configured: boolean };
const PRODUCT_IMAGES_BUCKET = 'product-images';

function serviceHeaders(extra?: HeadersInit) {
  const serviceRoleKey = getSupabaseServiceRoleKey();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...(extra ?? {}),
  };
}

function buildProductImagePublicUrl(objectPath: string) {
  return `${getSupabaseUrl()}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${objectPath}`;
}

export async function supabaseAdminRequest<T>(path: string, init?: RequestInit): Promise<RestResult<T>> {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!url || !serviceRoleKey) return { data: null, error: null, configured: false };

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...serviceHeaders(),
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`supabaseAdminRequest failed ${response.status} for ${path}`, errorBody);
    return { data: null, error: errorBody, configured: true };
  }

  if (response.status === 204) return { data: null, error: null, configured: true };
  return { data: (await response.json()) as T, error: null, configured: true };
}

export async function listCategoriesAdmin() {
  const query = new URLSearchParams({
    select: '*',
    order: 'sort_order.asc.nullslast,name.asc',
  });
  return supabaseAdminRequest<DbCategory[]>(`categories?${query.toString()}`);
}

export async function listActiveCategories() {
  const query = new URLSearchParams({
    select: '*',
    is_active: 'eq.true',
    order: 'sort_order.asc.nullslast,name.asc',
  });
  return supabaseAdminRequest<DbCategory[]>(`categories?${query.toString()}`);
}

export async function getCategoryById(id: string) {
  const query = new URLSearchParams({ select: '*', id: `eq.${id}`, limit: '1' });
  const result = await supabaseAdminRequest<DbCategory[]>(`categories?${query.toString()}`);
  return { ...result, data: result.data?.[0] ?? null };
}

export async function saveCategory(input: Partial<DbCategory>) {
  const isUpdate = Boolean(input.id);
  if (isUpdate) {
    const query = new URLSearchParams({ id: `eq.${input.id}` });
    return supabaseAdminRequest<DbCategory[]>(`categories?${query.toString()}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        image_url: input.image_url ?? null,
        sort_order: input.sort_order ?? 0,
        is_active: input.is_active ?? true,
        updated_at: new Date().toISOString(),
      }),
    });
  }

  return supabaseAdminRequest<DbCategory[]>('categories', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      image_url: input.image_url ?? null,
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active ?? true,
    }),
  });
}

export async function listProductsAdmin(filters?: {
  search?: string;
  categoryId?: string;
  status?: 'active' | 'draft' | 'all';
}) {
  const query = new URLSearchParams({
    select: '*, categories(id,name,slug)',
    order: 'updated_at.desc',
  });

  if (filters?.categoryId) query.set('category_id', `eq.${filters.categoryId}`);
  if (filters?.status === 'active') query.set('is_active', 'eq.true');
  if (filters?.status === 'draft') query.set('is_active', 'eq.false');
  if (filters?.search) query.set('or', `(title.ilike.*${filters.search}*,slug.ilike.*${filters.search}*,sku.ilike.*${filters.search}*)`);

  return supabaseAdminRequest<Array<DbProduct & { categories?: Pick<DbCategory, 'id' | 'name' | 'slug'> | null }>>(`products?${query.toString()}`);
}

export async function listPublicProductsWithCategories() {
  const query = new URLSearchParams({
    select: '*, categories(id,name,slug,description,image_url,sort_order,is_active), product_faqs(*)',
    is_active: 'eq.true',
    order: 'updated_at.desc',
  });
  return supabaseAdminRequest<
    Array<DbProduct & { categories?: DbCategory | null; product_faqs?: DbProductFaq[] | null }>
  >(`products?${query.toString()}`);
}

export async function getProductByIdAdmin(id: string) {
  const query = new URLSearchParams({
    select: '*, categories(id,name,slug,description,image_url,sort_order,is_active), product_faqs(*)',
    id: `eq.${id}`,
    limit: '1',
  });
  const result = await supabaseAdminRequest<
    Array<DbProduct & { categories?: DbCategory | null; product_faqs?: DbProductFaq[] | null }>
  >(`products?${query.toString()}`);
  return { ...result, data: result.data?.[0] ?? null };
}

export async function getProductBySlugAdmin(slug: string) {
  const query = new URLSearchParams({
    select: '*, categories(id,name,slug,description,image_url,sort_order,is_active), product_faqs(*)',
    slug: `eq.${slug}`,
    limit: '1',
  });
  const result = await supabaseAdminRequest<
    Array<DbProduct & { categories?: DbCategory | null; product_faqs?: DbProductFaq[] | null }>
  >(`products?${query.toString()}`);
  return { ...result, data: result.data?.[0] ?? null };
}

export async function upsertProduct(input: Partial<DbProduct>) {
  if (input.id) {
    const { id: _id, created_at: _created_at, ...updateFields } = input;
    const query = new URLSearchParams({ id: `eq.${_id}` });
    return supabaseAdminRequest<DbProduct[]>(`products?${query.toString()}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        ...updateFields,
        updated_at: new Date().toISOString(),
      }),
    });
  }

  return supabaseAdminRequest<DbProduct[]>('products', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(input),
  });
}

export async function replaceProductFaqs(productId: string, faqs: Array<{ question: string; answer: string; sort_order: number }>) {
  const deleteResult = await supabaseAdminRequest<null>(`product_faqs?product_id=eq.${productId}`, { method: 'DELETE' });
  if (deleteResult.error) {
    console.error('replaceProductFaqs delete failed', deleteResult.error);
    return deleteResult;
  }
  if (!faqs.length) return { data: [], error: null, configured: isSupabaseConfigured() };

  return supabaseAdminRequest<DbProductFaq[]>('product_faqs', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(
      faqs.map((faq) => ({
        product_id: productId,
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sort_order,
      })),
    ),
  });
}

export async function deleteProductById(id: string) {
  return supabaseAdminRequest<null>(`products?id=eq.${id}`, { method: 'DELETE' });
}

export async function ensureProductImagesBucket() {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!url || !serviceRoleKey) {
    return { data: null, error: 'Supabase storage is not configured.', configured: false };
  }

  const response = await fetch(`${url}/storage/v1/bucket/${PRODUCT_IMAGES_BUCKET}`, {
    method: 'GET',
    headers: serviceHeaders(),
    cache: 'no-store',
  });

  if (response.status === 404) {
    return {
      data: null,
      error: `Supabase Storage bucket ${PRODUCT_IMAGES_BUCKET} was not found.`,
      configured: true,
    };
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ensureProductImagesBucket failed', response.status, errorText);
    return { data: null, error: 'Unable to verify the Supabase Storage bucket.', configured: true };
  }

  return { data: (await response.json()) as { id: string; public: boolean }, error: null, configured: true };
}

export async function createSignedProductImageUpload(input: {
  slug: string;
  filename: string;
  contentType: string;
  kind: 'main' | 'gallery';
  index?: number;
}) {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!url || !serviceRoleKey) {
    return { data: null, error: 'Supabase storage is not configured.', configured: false };
  }

  const bucketCheck = await ensureProductImagesBucket();
  if (bucketCheck.error) {
    return { data: null, error: bucketCheck.error, configured: bucketCheck.configured };
  }

  const safeSlug = input.slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const extension = input.filename.split('.').pop()?.toLowerCase() || 'jpg';
  const safeKind = input.kind === 'main' ? 'main' : 'gallery';
  const filename = `${safeKind}-${Date.now()}-${input.index ?? 0}.${extension}`;
  const objectPath = `products/${safeSlug}/${filename}`;

  const response = await fetch(`${url}/storage/v1/object/upload/sign/${PRODUCT_IMAGES_BUCKET}/${objectPath}`, {
    method: 'POST',
    headers: {
      ...serviceHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ upsert: true }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('createSignedProductImageUpload failed', response.status, errorText);
    if (response.status === 404 || errorText.toLowerCase().includes('bucket')) {
      return {
        data: null,
        error: `Supabase Storage bucket ${PRODUCT_IMAGES_BUCKET} was not found.`,
        configured: true,
      };
    }
    return { data: null, error: 'Could not prepare the image upload.', configured: true };
  }

  const payload = (await response.json()) as {
    signedURL?: string;
    signedUrl?: string;
    url?: string;
    token?: string;
  };

  const rawSignedUrl = payload.signedURL || payload.signedUrl || payload.url || null;
  const signedUrl = rawSignedUrl
    ? rawSignedUrl.startsWith('http')
      ? rawSignedUrl
      : `${url}${rawSignedUrl}`
    : payload.token
      ? `${url}/storage/v1/object/upload/sign/${PRODUCT_IMAGES_BUCKET}/${objectPath}?token=${payload.token}`
      : null;

  if (!signedUrl) {
    return { data: null, error: 'Supabase did not return a signed upload URL.', configured: true };
  }

  return {
    data: {
      bucket: PRODUCT_IMAGES_BUCKET,
      objectPath,
      signedUrl,
      publicUrl: buildProductImagePublicUrl(objectPath),
      contentType: input.contentType,
    },
    error: null,
    configured: true,
  };
}

export async function uploadProductImage(file: File, slug: string, kind: 'main' | 'gallery', index = 0) {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!url || !serviceRoleKey) return { url: null, error: 'Supabase storage is not configured.', configured: false };

  const safeSlug = slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filename = `${kind}-${Date.now()}-${index}.${extension}`;
  const objectPath = `products/${safeSlug}/${filename}`;

  let bytes;
  try {
    bytes = Buffer.from(await file.arrayBuffer());
  } catch (readError) {
    console.error('uploadProductImage file read failed', readError);
    return { url: null, error: 'Failed to read the uploaded file.', configured: true };
  }

  let response: Response;
  try {
    response = await fetch(`${url}/storage/v1/object/product-images/${objectPath}`, {
      method: 'POST',
      headers: {
        ...serviceHeaders(),
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: bytes,
    });
  } catch (error) {
    console.error('image upload failed', error);
    return { url: null, error: 'Image upload failed before reaching Supabase Storage.', configured: true };
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('uploadProductImage storage upload failed', response.status, errorText);
    if (errorText.toLowerCase().includes('bucket') || response.status === 404) {
      return { url: null, error: 'Supabase Storage bucket "product-images" is missing or not public.', configured: true };
    }
    return { url: null, error: `Image upload failed (${response.status}).`, configured: true };
  }

  return {
    url: `${url}/storage/v1/object/public/product-images/${objectPath}`,
    error: null,
    configured: true,
  };
}

export async function listOrdersAdmin(limit = 20) {
  const query = new URLSearchParams({
    select: '*, order_items(*)',
    order: 'created_at.desc',
    limit: String(limit),
  });
  return supabaseAdminRequest<Array<DbOrder & { order_items?: DbOrderItem[] | null }>>(`orders?${query.toString()}`);
}

export async function updateOrderFulfillment(orderReference: string, fulfillmentStatus: string) {
  const query = new URLSearchParams({ order_reference: `eq.${orderReference}` });
  return supabaseAdminRequest<DbOrder[]>(`orders?${query.toString()}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      fulfillment_status: fulfillmentStatus,
      updated_at: new Date().toISOString(),
    }),
  });
}
