'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PAWTRIP_MASCOT_EVENT, type PawtripMascotAction, type PawtripMascotEventDetail } from '@/lib/mascot-events';

const PUBLIC_MASCOT_ROUTES = ['/', '/shop', '/find-my-kit'];
const BUBBLES = ['Road trip?', 'Pack snacks.', 'No muddy seats!', 'Good dog mode.', "Let's go!"];

function shouldShowOnPath(pathname: string) {
  if (!pathname || pathname.startsWith('/admin')) {
    return false;
  }

  if (PUBLIC_MASCOT_ROUTES.includes(pathname)) {
    return true;
  }

  return pathname.startsWith('/shop/product/') || pathname.startsWith('/shop/category/');
}

export function FloatingDogAssistant() {
  const pathname = usePathname();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [bubbleText, setBubbleText] = useState('');
  const [mode, setMode] = useState<PawtripMascotAction>('idle');
  const [hovered, setHovered] = useState(false);
  const [fetching, setFetching] = useState(false);
  const lastFetchRef = useRef(0);
  const bubbleTimeoutRef = useRef<number | null>(null);
  const modeTimeoutRef = useRef<number | null>(null);

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
    if (!shouldRender) {
      return;
    }

    if (modeTimeoutRef.current) {
      window.clearTimeout(modeTimeoutRef.current);
    }

    setMode('sniff');
    modeTimeoutRef.current = window.setTimeout(() => {
      setMode('idle');
    }, reducedMotion ? 0 : 1100);

    return () => {
      if (modeTimeoutRef.current) {
        window.clearTimeout(modeTimeoutRef.current);
      }
    };
  }, [pathname, reducedMotion, shouldRender]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleMascotEvent = (event: Event) => {
      const customEvent = event as CustomEvent<PawtripMascotEventDetail>;
      const nextAction = customEvent.detail?.action || 'idle';
      const nextMessage = customEvent.detail?.message || '';

      if (bubbleTimeoutRef.current) {
        window.clearTimeout(bubbleTimeoutRef.current);
      }
      if (modeTimeoutRef.current) {
        window.clearTimeout(modeTimeoutRef.current);
      }

      setMode(nextAction);
      setBubbleText(nextMessage);

      if (nextMessage) {
        bubbleTimeoutRef.current = window.setTimeout(() => {
          setBubbleText('');
        }, 2000);
      }

      modeTimeoutRef.current = window.setTimeout(() => {
        setMode('idle');
      }, nextAction === 'celebrate' ? 1800 : nextAction === 'happy' ? 1200 : 1500);
    };

    window.addEventListener(PAWTRIP_MASCOT_EVENT, handleMascotEvent as EventListener);

    return () => {
      window.removeEventListener(PAWTRIP_MASCOT_EVENT, handleMascotEvent as EventListener);
      if (bubbleTimeoutRef.current) {
        window.clearTimeout(bubbleTimeoutRef.current);
      }
      if (modeTimeoutRef.current) {
        window.clearTimeout(modeTimeoutRef.current);
      }
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  function handleClick() {
    const now = Date.now();
    if (fetching || now - lastFetchRef.current < 3600) return;
    lastFetchRef.current = now;
    const nextBubble = BUBBLES[Math.floor(Math.random() * BUBBLES.length)];

    if (bubbleTimeoutRef.current) {
      window.clearTimeout(bubbleTimeoutRef.current);
    }
    if (modeTimeoutRef.current) {
      window.clearTimeout(modeTimeoutRef.current);
    }

    setBubbleText(nextBubble);
    setMode('happy');
    if (!reducedMotion) {
      setFetching(true);
      window.setTimeout(() => setMode('excited'), 420);
      window.setTimeout(() => {
        setFetching(false);
        setMode('idle');
      }, 2200);
    }

    bubbleTimeoutRef.current = window.setTimeout(() => {
      setBubbleText('');
    }, 2000);

    if (reducedMotion) {
      modeTimeoutRef.current = window.setTimeout(() => {
        setMode('idle');
      }, 1200);
    }
  }

  const renderedMode = hovered ? 'excited' : mode;

  return (
    <div className={`mascotDogWrap mascotDogMode-${renderedMode} ${fetching ? 'mascotDogFetching' : ''} ${reducedMotion ? 'mascotDogReduced' : ''}`}>
      {bubbleText ? <div className="mascotDogBubble">{bubbleText}</div> : null}
      {fetching && !reducedMotion ? <span className="mascotFetchBall" aria-hidden="true" /> : null}
      <button
        type="button"
        className="mascotDogButton"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="PawTrip mascot dog"
      >
        <div className="mascotDogShadow" aria-hidden="true" />
        <svg className="mascotDogSvg" viewBox="0 0 170 170" role="presentation" aria-hidden="true">
          <defs>
            <linearGradient id="pawtripDogBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8B15A" />
              <stop offset="100%" stopColor="#C9783A" />
            </linearGradient>
            <linearGradient id="pawtripDogChest" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBF8F3" />
              <stop offset="100%" stopColor="#F2E5CD" />
            </linearGradient>
          </defs>

          <g className="mascotDogJog">
            <path className="mascotDogTail" d="M129 89C148 79 157 63 153 48C149 35 137 33 129 45C133 58 133 72 129 89Z" />
            <path className="mascotDogBody" d="M56 99C56 77 73 64 100 64C122 64 139 76 139 97C139 116 123 128 99 128C75 128 56 119 56 99Z" />
            <ellipse className="mascotDogChest" cx="74" cy="100" rx="21" ry="22" />
            <path className="mascotDogBackMark" d="M98 74C109 72 119 75 126 82" />

            <g className="mascotDogLeg mascotDogLegFront">
              <rect x="69" y="114" width="13" height="31" rx="8" />
              <ellipse className="mascotDogPaw" cx="75" cy="147" rx="11" ry="6.5" />
            </g>
            <g className="mascotDogLeg mascotDogLegFrontAlt">
              <rect x="87" y="116" width="13" height="28" rx="8" />
              <ellipse className="mascotDogPaw" cx="93" cy="146" rx="11" ry="6.5" />
            </g>
            <g className="mascotDogLeg mascotDogLegBack">
              <rect x="108" y="114" width="13" height="31" rx="8" />
              <ellipse className="mascotDogPaw" cx="114" cy="147" rx="11" ry="6.5" />
            </g>
            <g className="mascotDogLeg mascotDogLegBackAlt">
              <rect x="122" y="113" width="12" height="27" rx="8" />
              <ellipse className="mascotDogPaw" cx="127" cy="142" rx="10" ry="6" />
            </g>

            <g className="mascotDogHead">
              <ellipse className="mascotDogEar mascotDogEarBack" cx="50" cy="58" rx="10" ry="22" transform="rotate(-18 50 58)" />
              <ellipse className="mascotDogEar mascotDogEarFront" cx="72" cy="57" rx="11" ry="24" transform="rotate(10 72 57)" />
              <circle className="mascotDogFace" cx="63" cy="77" r="29" />
              <ellipse className="mascotDogMuzzle" cx="79" cy="88" rx="17" ry="13" />
              <circle className="mascotDogNose" cx="91" cy="84" r="4.6" />
              <circle className="mascotDogEye" cx="56" cy="73" r="4.2" />
              <circle className="mascotDogEye" cx="71" cy="71" r="4.2" />
              <path className="mascotDogSmile" d="M90 88C84 95 72 98 65 93" />
              <path className="mascotDogTongue" d="M81 92C83 99 79 103 74 103C70 103 67 99 69 93" />
              <circle className="mascotDogBlush" cx="49" cy="83" r="4.4" />
              <path className="mascotDogCollar" d="M62 98C70 102 79 102 86 97" />
              <circle className="mascotDogTag" cx="76" cy="101" r="4.5" />
            </g>
          </g>
        </svg>
      </button>
    </div>
  );
}
