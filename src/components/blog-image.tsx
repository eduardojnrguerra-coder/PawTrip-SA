'use client';

import { useState } from 'react';

type BlogImageProps = {
  src?: string;
  alt: string;
  category?: string;
  className?: string;
  loading?: 'eager' | 'lazy';
};

export function BlogImage({ src, alt, category = 'PawTrip SA guide', className = '', loading = 'lazy' }: BlogImageProps) {
  const [failed, setFailed] = useState(false);
  const shouldShowPlaceholder = !src || failed;

  if (shouldShowPlaceholder) {
    return (
      <div className={`blogImagePlaceholder ${className}`} role="img" aria-label={alt}>
        <span>PawTrip SA</span>
        <strong>{category}</strong>
        <p>Guide image coming soon</p>
      </div>
    );
  }

  return <img src={src} alt={alt} loading={loading} onError={() => setFailed(true)} />;
}
