import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseBrowserConfigured } from '@/lib/supabase/config';

export function createSupabaseBrowserClient() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${url}${path}`, {
      ...init,
      headers: {
        apikey: anonKey,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return (await response.json()) as T;
  }

  return {
    configured: isSupabaseBrowserConfigured(),
    url,
    anonKey,
    authRequest,
  };
}

export async function uploadAdminProductImage(input: {
  slug: string;
  file: File;
  kind: 'main' | 'gallery';
  index?: number;
}) {
  console.log('uploading main image', input.file.name, input.file.size, input.file.type);
  console.log('uploading to bucket', 'product-images');

  const signResponse = await fetch('/api/admin/product-images/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      slug: input.slug,
      filename: input.file.name,
      contentType: input.file.type,
      kind: input.kind,
      index: input.index ?? 0,
    }),
  });

  const signPayload = (await signResponse.json().catch(() => null)) as
    | {
        error?: string;
        signedUrl?: string;
        publicUrl?: string;
      }
    | null;

  if (!signResponse.ok || !signPayload?.signedUrl || !signPayload.publicUrl) {
    throw new Error(signPayload?.error || 'Could not prepare the image upload.');
  }

  console.log('uploading to signed URL', signPayload.signedUrl);

  const uploadResponse = await fetch(signPayload.signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': input.file.type || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: input.file,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('main image upload failed', errorText);
    if (errorText.toLowerCase().includes('bucket')) {
      throw new Error('Supabase Storage bucket product-images was not found.');
    }
    throw new Error('Image upload failed.');
  }

  console.log('main image uploaded URL', signPayload.publicUrl);

  return {
    publicUrl: signPayload.publicUrl,
  };
}
