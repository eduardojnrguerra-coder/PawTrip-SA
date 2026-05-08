'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';

export function EmailCaptureBanner() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('No email backend is connected yet, so your email was not stored. You can still open the checklist below.');
  }

  return (
    <section className="section sectionTight">
      <div className="container">
        <div className="emailCaptureBanner">
          <div>
            <span className="eyebrow">
              <Mail size={14} /> Free guide
            </span>
            <h2>Get the PawTrip road trip checklist</h2>
            <p>
              A practical South African dog road-trip checklist for packing water, car protection, cleanup, treats and
              safer stops.
            </p>
          </div>
          <form className="emailCaptureForm" onSubmit={onSubmit}>
            <label className="field">
              <span>Email address</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setMessage('');
                }}
                placeholder="you@example.com"
                required
              />
            </label>
            <button type="submit" className="button buttonPrimary buttonSheen">
              Show checklist <ArrowRight size={15} />
            </button>
            <Link href="/dog-road-trip-checklist-south-africa" className="button buttonSecondary buttonSheen">
              Open checklist
            </Link>
            {message ? <p className="emailCaptureNote">{message}</p> : null}
          </form>
        </div>
      </div>
    </section>
  );
}
