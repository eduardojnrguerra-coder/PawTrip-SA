'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  src: string;
  alt: string;
  productName: string;
  category: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function getProductImageAlt(productName: string, category: string, detail?: string) {
  const suffix = detail ? ` ${detail}` : '';
  return `${productName} ${category}${suffix} - PawTrip SA`;
}

export function ProductImage({ src, alt, productName, category, className, imageClassName, priority }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const safeSrc = src && src.trim().length > 0 ? src : '/products/placeholder-brand.jpg';

  useEffect(() => {
    setLoaded(false);
    setMissing(false);
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [safeSrc]);

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
      ref={imageRef}
      key={safeSrc}
      src={safeSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={cn('managedProductImage', loaded && 'managedProductImageLoaded', className, imageClassName)}
      onLoad={() => setLoaded(true)}
      onError={() => setMissing(true)}
    />
  );
}
