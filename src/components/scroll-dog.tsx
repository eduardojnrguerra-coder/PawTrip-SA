'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

const PUBLIC_DECOR_ROUTES = ['/', '/shop', '/find-my-kit'];

function shouldShowOnPath(pathname: string) {
  if (!pathname || pathname.startsWith('/admin')) {
    return false;
  }

  if (PUBLIC_DECOR_ROUTES.includes(pathname)) {
    return true;
  }

  return pathname.startsWith('/shop/product/') || pathname.startsWith('/shop/category/') || pathname.startsWith('/blog/');
}

export function ScrollDog() {
  const pathname = usePathname();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const shouldRender = useMemo(() => shouldShowOnPath(pathname), [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener('change', updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (!shouldRender || reducedMotion || typeof window === 'undefined') {
      setScrollOffset(0);
      return;
    }

    let frame = 0;

    const updatePosition = () => {
      frame = 0;
      const nextOffset = Math.min(96, Math.max(-12, window.scrollY * 0.08));
      setScrollOffset(nextOffset);
    };

    const handleScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(updatePosition);
      }
    };

    updatePosition();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [reducedMotion, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`scrollDog ${reducedMotion ? 'scrollDogStatic' : ''}`}
      style={{ transform: `translate3d(0, ${scrollOffset}px, 0)` }}
    >
      <div className="scrollDogBadge">PawTrip pal</div>
      <div className="scrollDogFigure">
        <div className="scrollDogGlow" />
        <div className="scrollDogBody">
          <span className="scrollDogSpot scrollDogSpotOne" />
          <span className="scrollDogSpot scrollDogSpotTwo" />
        </div>
        <div className="scrollDogHead">
          <span className="scrollDogEar scrollDogEarBack" />
          <span className="scrollDogEar scrollDogEarFront" />
          <span className="scrollDogMuzzle" />
          <span className="scrollDogNose" />
          <span className="scrollDogEye" />
        </div>
        <div className="scrollDogTail" />
        <div className="scrollDogLegs">
          <span className="scrollDogLeg scrollDogLegFront" />
          <span className="scrollDogLeg scrollDogLegFrontBack" />
          <span className="scrollDogLeg scrollDogLegBackFront" />
          <span className="scrollDogLeg scrollDogLegBack" />
        </div>
      </div>
    </div>
  );
}
