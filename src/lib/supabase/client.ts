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

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export async function compressImage(
  file: File,
  maxDimension = 2000,
  quality = 0.84,
): Promise<File> {
  console.log('Selected image', file.name, file.size, file.type);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not prepare image for compression.'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-]+/gi, '-').replace(/^-|-$/g, '') || 'product-image';
      const attempts = [
        { type: 'image/webp', ext: 'webp', quality },
        { type: 'image/webp', ext: 'webp', quality: 0.82 },
        { type: 'image/webp', ext: 'webp', quality: 0.8 },
        { type: 'image/jpeg', ext: 'jpg', quality: 0.84 },
        { type: 'image/jpeg', ext: 'jpg', quality: 0.8 },
      ];

      let bestBlob: Blob | null = null;
      let bestExt = 'jpg';
      let bestType = 'image/jpeg';

      for (const attempt of attempts) {
        const blob = await canvasToBlob(canvas, attempt.type, attempt.quality);
        if (!blob) continue;

        if (!bestBlob || blob.size < bestBlob.size) {
          bestBlob = blob;
          bestExt = attempt.ext;
          bestType = attempt.type;
        }

        if (blob.size <= 1024 * 1024) {
          bestBlob = blob;
          bestExt = attempt.ext;
          bestType = attempt.type;
          break;
        }
      }

      if (!bestBlob) {
        reject(new Error('Image compression failed.'));
        return;
      }

      const compressed = new File([bestBlob], `${baseName}.${bestExt}`, { type: bestType });
      console.log('Compressed image size', compressed.size);
      resolve(compressed);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read the image for compression.'));
    };

    img.src = url;
  });
}

export async function uploadAdminProductImage(input: {
  slug: string;
  file: File;
  kind: 'main' | 'gallery';
  index?: number;
}) {
  console.log('Selected image', input.file.name, input.file.size, input.file.type);

  const signResponse = await fetch('/api/admin/product-images/sign', {
    method: 'POST',
    credentials: 'include',
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
        signedURL?: string;
        publicUrl?: string;
        objectPath?: string;
      }
    | null;

  const signedUrl = signPayload?.signedUrl || signPayload?.signedURL || null;
  console.log('Upload result', signPayload);

  if (!signResponse.ok || !signedUrl || !signPayload?.publicUrl) {
    throw new Error(signPayload?.error || 'Could not prepare the image upload.');
  }

  console.log('Uploading to product-images', signPayload.objectPath || input.file.name);

  const uploadHeaders = {
    'Content-Type': input.file.type || 'application/octet-stream',
    'x-upsert': 'true',
  };

  let uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    headers: uploadHeaders,
    body: input.file,
  });

  if (!uploadResponse.ok && [400, 405, 415].includes(uploadResponse.status)) {
    const firstError = await uploadResponse.text();
    console.error('Upload failed with PUT', `${uploadResponse.status}: ${firstError}`);
    uploadResponse = await fetch(signedUrl, {
      method: 'POST',
      headers: uploadHeaders,
      body: input.file,
    });
  }

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('Upload failed', errorText);
    if (errorText.toLowerCase().includes('bucket')) {
      throw new Error('Supabase Storage bucket product-images was not found.');
    }
    throw new Error(errorText || 'Image upload failed.');
  }

  console.log('Uploaded public URL', signPayload.publicUrl);

  return {
    publicUrl: signPayload.publicUrl,
  };
}
