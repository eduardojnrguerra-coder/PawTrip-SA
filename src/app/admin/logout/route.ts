import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_ACCESS_COOKIE);
  cookieStore.delete(ADMIN_REFRESH_COOKIE);
  return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 });
}
