'use client';

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

const supportEmail = 'support@pawtripsa.co.za';

type ContactFormState = {
  name: string;
  email: string;
  orderReference: string;
  subject: string;
  message: string;
};

const initialState: ContactFormState = {
  name: '',
  email: '',
  orderReference: '',
  subject: '',
  message: '',
};

function encodeMailto(form: ContactFormState) {
  const subject = form.subject.trim() || 'PawTrip SA support request';
  const body = [
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    `Order reference: ${form.orderReference || 'Not provided'}`,
    '',
    'Message:',
    form.message,
    '',
    'Note: This message was created from the PawTrip SA contact form mailto fallback.',
  ].join('\n');

  return `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [status, setStatus] = useState('');

  function update(field: keyof ContactFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus('');
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Your email app should open with a prepared message. PawTrip SA is not saving this form yet.');
    window.location.href = encodeMailto(form);
  }

  return (
    <form className="contactForm" onSubmit={onSubmit}>
      <div className="contactFormHeader">
        <Mail size={18} />
        <div>
          <h2>Send a support message</h2>
          <p>This form uses your email app for now. Messages are not saved on the website yet.</p>
        </div>
      </div>

      <div className="fieldGrid">
        <label className="field">
          <span>Name</span>
          <input className="input" value={form.name} onChange={(event) => update('name', event.target.value)} required autoComplete="name" />
        </label>
        <label className="field">
          <span>Email</span>
          <input className="input" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required autoComplete="email" />
        </label>
        <label className="field">
          <span>Order reference</span>
          <input
            className="input"
            value={form.orderReference}
            onChange={(event) => update('orderReference', event.target.value)}
            placeholder="Optional, but helpful"
          />
        </label>
        <label className="field">
          <span>Subject</span>
          <input className="input" value={form.subject} onChange={(event) => update('subject', event.target.value)} required />
        </label>
        <label className="field fieldFull">
          <span>Message</span>
          <textarea className="textarea" value={form.message} onChange={(event) => update('message', event.target.value)} required />
        </label>
      </div>

      <button type="submit" className="button buttonPrimary buttonSheen">
        Open email app <Send size={15} />
      </button>
      {status ? <p className="contactFormStatus">{status}</p> : null}
    </form>
  );
}
