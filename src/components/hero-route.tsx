'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function HeroRoute() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="heroRoute" aria-hidden="true">
      <motion.div
        className="heroRouteDot"
        animate={reduceMotion ? undefined : { x: [0, 82, 160, 240, 320] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'linear' }}
      />
      <div className="heroRouteLine" />
      <div className="heroRoutePaw paw1" />
      <div className="heroRoutePaw paw2" />
      <div className="heroRoutePaw paw3" />
      <div className="heroRoutePaw paw4" />
    </div>
  );
}
