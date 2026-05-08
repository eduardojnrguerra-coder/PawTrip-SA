import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, createAdminToken, getAdminPassword } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get('password') ?? '');
  const configuredPassword = getAdminPassword();

  if (!configuredPassword || password !== configuredPassword) {
    return NextResponse.redirect(new URL('/admin/orders?error=1', request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL('/admin/orders', request.url), { status: 303 });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
