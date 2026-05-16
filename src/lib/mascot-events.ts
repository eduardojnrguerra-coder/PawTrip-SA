'use client';

export type PawtripMascotAction = 'idle' | 'happy' | 'excited' | 'sniff' | 'celebrate';

export type PawtripMascotEventDetail = {
  action: PawtripMascotAction;
  message?: string;
};

export const PAWTRIP_MASCOT_EVENT = 'pawtrip:mascot';

export function triggerMascotReaction(detail: PawtripMascotEventDetail) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent<PawtripMascotEventDetail>(PAWTRIP_MASCOT_EVENT, { detail }));
}
