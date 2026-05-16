import { cn } from '@/lib/utils';

type BrandLogoProps = {
  variant?: 'full' | 'mark';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
};

export function BrandLogo({ variant = 'full', size = 'md', showTagline = false, className }: BrandLogoProps) {
  return (
    <span className={cn('brandLogo', `brandLogo-${size}`, variant === 'mark' && 'brandLogoMarkOnly', className)}>
      <span className="brandLogoIcon" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="presentation" focusable="false">
          <rect width="64" height="64" rx="18" fill="url(#pawtripLogoBg)" />
          <path d="M5 53C20 43 36 35 59 23V53H5Z" fill="#E8B15A" />
          <path d="M8 53C23 43 38 36 58 26" fill="none" stroke="#FFF6DF" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M32 39C27 39 23 37 22 33C21 29 24 26 28 24C31 20 36 20 39 24C43 26 46 29 45 33C44 37 40 39 35 39H32Z" fill="#FBF8F3" />
          <ellipse cx="20" cy="25" rx="4.8" ry="7" transform="rotate(-24 20 25)" fill="#FBF8F3" />
          <ellipse cx="29" cy="17" rx="4.9" ry="7.2" transform="rotate(-7 29 17)" fill="#FBF8F3" />
          <ellipse cx="39" cy="17" rx="4.9" ry="7.2" transform="rotate(7 39 17)" fill="#FBF8F3" />
          <ellipse cx="48" cy="25" rx="4.8" ry="7" transform="rotate(24 48 25)" fill="#FBF8F3" />
          <path d="M28 50L31 44M39 45L42 40M49 34L53 32" stroke="#FBF8F3" strokeWidth="3.4" strokeLinecap="round" opacity="0.9" />
          <defs>
            <linearGradient id="pawtripLogoBg" x1="0" y1="0" x2="64" y2="64">
              <stop stopColor="#1F4D3A" />
              <stop offset="1" stopColor="#143628" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      {variant === 'full' ? (
        <span className="brandLogoText">
          <strong>PawTrip SA</strong>
          {showTagline ? <small>Cleaner cars. Safer trips. Happier dogs.</small> : null}
        </span>
      ) : null}
    </span>
  );
}
