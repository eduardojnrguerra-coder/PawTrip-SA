'use client';

import { useState } from 'react';

export function AdminCopyButton({
  value,
  label = 'Copy',
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button className="button buttonGhost buttonSmall" type="button" onClick={copyValue}>
      {copied ? 'Copied' : label}
    </button>
  );
}
