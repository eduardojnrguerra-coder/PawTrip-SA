import crypto from 'crypto';
import type { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'pawtrip-admin-auth';

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? '';
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword());
}

export function createAdminToken() {
  const password = getAdminPassword();
  if (!password) return '';
  return crypto.createHash('sha256').update(`pawtrip-admin:${password}`).digest('hex');
}

export function isAdminTokenValid(token?: string) {
  const expected = createAdminToken();
  if (!expected || !token) return false;

  const expectedBuffer = Buffer.from(expected);
  const tokenBuffer = Buffer.from(token);

  if (expectedBuffer.length !== tokenBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, tokenBuffer);
}

export function isAdminRequestAuthorized(request: NextRequest) {
  return isAdminTokenValid(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}
