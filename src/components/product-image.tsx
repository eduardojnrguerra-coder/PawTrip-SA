'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  src: string;
  alt: string;
  productName: string;
  category: string;
  className?: string;
  imageClassName?: string;
};

export function getProductImageAlt(productName: string, category: string, detail?: string) {
  const suffix = detail ? ` ${detail}` : '';
  return `${productName} ${category}${suffix} - PawTrip SA`;
}

export function ProductImage({ src, alt, productName, category, className, imageClassName }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setMissing(false);
  }, [src]);

  if (missing) {
    return (
      <div className={cn('neutralProductFallback', className)} role="img" aria-label={alt}>
        <div className="neutralProductFallbackMark" aria-hidden="true">
          {productName.slice(0, 1).toUpperCase()}
        </div>
        <strong>{productName}</strong>
        <span>{category}</span>
        <span className="fallbackComingSoon">Product image coming soon</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn('managedProductImage', loaded && 'managedProductImageLoaded', className, imageClassName)}
      onLoad={() => setLoaded(true)}
      onError={() => setMissing(true)}
    />
  );
}
