import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequestAuthorized } from '@/lib/admin-auth';
import { updateSupabaseOrderByReference } from '@/lib/supabase';

const allowedStatuses = new Set(['unfulfilled', 'processing', 'shipped', 'cancelled']);

export async function POST(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.redirect(new URL('/admin/orders?error=auth', request.url), { status: 303 });
  }

  const formData = await request.formData();
  const orderReference = String(formData.get('orderReference') ?? '').trim();
  const fulfillmentStatus = String(formData.get('fulfillmentStatus') ?? '').trim();

  if (!orderReference || !allowedStatuses.has(fulfillmentStatus)) {
    return NextResponse.redirect(new URL('/admin/orders?error=invalid', request.url), { status: 303 });
  }

  const result = await updateSupabaseOrderByReference(orderReference, {
    fulfillment_status: fulfillmentStatus,
  });

  if (result.error) {
    return NextResponse.redirect(new URL('/admin/orders?error=update', request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL('/admin/orders?updated=1', request.url), { status: 303 });
}
