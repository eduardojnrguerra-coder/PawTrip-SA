'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function FaqAccordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="faqList">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question} className="faqItem">
            <button type="button" className="faqTrigger" onClick={() => setOpenIndex(open ? null : index)}>
              <span>{item.question}</span>
              <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={18} />
              </motion.span>
            </button>
            <AnimatePresence>
              {open ? (
                <motion.div
                  className="faqPanel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <p>{item.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

