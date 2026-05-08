'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/components/cart-provider';

export function Toasts() {
  const { toasts, dismissToast } = useCart();

  return (
    <div className="toastStack" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className="toast"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.2 }}
            onClick={() => dismissToast(toast.id)}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

