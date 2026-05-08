export const siteName = 'PawTrip SA';
export const siteTagline = 'Cleaner cars. Safer trips. Happier dogs.';
export const siteDescription =
  'Premium dog travel kits, toys, treats and everyday essentials for South African pet owners.';

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
}

