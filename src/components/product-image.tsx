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
      <div className={cn('premiumImagePlaceholder', className)} role="img" aria-label={alt}>
        <div className="placeholderMark">P</div>
        <strong>PawTrip SA</strong>
        <span>{category}</span>
        {process.env.NODE_ENV === 'development' ? <p>Product image coming soon</p> : null}
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
