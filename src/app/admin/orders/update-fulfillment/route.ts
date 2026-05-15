import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.redirect(new URL('/admin/orders', request.url), { status: 303 });
}
