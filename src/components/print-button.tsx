'use client';

import type { ReactNode } from 'react';

export function PrintButton({ children }: { children: ReactNode }) {
  return (
    <button type="button" className="button buttonPrimary buttonSheen" onClick={() => window.print()}>
      {children}
    </button>
  );
}
