import { NextResponse } from 'next/server';
import { createSignedProductImageUpload } from '@/lib/supabase/admin';
import { requireAdminUser } from '@/lib/supabase/server';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export async function POST(request: Request) {
  await requireAdminUser();

  let payload: {
    slug?: string;
    filename?: string;
    contentType?: string;
    kind?: 'main' | 'gallery';
    index?: number;
  };

  try {
    payload = (await request.json()) as typeof payload;
  } catch (error) {
    console.error('image upload failed', error);
    return NextResponse.json({ error: 'Invalid upload payload.' }, { status: 400 });
  }

  const slug = slugify(payload.slug || '');
  const filename = (payload.filename || '').trim();
  const contentType = (payload.contentType || '').trim() || 'application/octet-stream';
  const kind = payload.kind === 'gallery' ? 'gallery' : 'main';

  if (!slug || !filename) {
    return NextResponse.json({ error: 'Missing slug or filename.' }, { status: 400 });
  }

  try {
    const result = await createSignedProductImageUpload({
      slug,
      filename,
      contentType,
      kind,
      index: typeof payload.index === 'number' ? payload.index : 0,
    });

    if (result.error || !result.data) {
      return NextResponse.json({ error: result.error || 'Could not prepare the image upload.' }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('image upload failed', error);
    return NextResponse.json({ error: 'Image upload setup failed.' }, { status: 500 });
  }
}
