'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { submitLead } from '@/lib/submitLead';
import { captureUtms } from '@/lib/utm';
import { trackEvent } from '@/lib/analytics';

type Status = 'idle' | 'sending' | 'done' | 'error';

const inputClass =
  'mt-2 w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-text';

export function LeadForm({ source = 'contact-form' }: { source?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    captureUtms();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      await submitLead({ name, email, message, consent, source });
      trackEvent('lead_submitted', { source });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="surface p-6 md:p-8" role="status">
        <h2 className="font-display text-2xl font-bold">Thank you!</h2>
        <p className="mt-3 text-text-secondary">
          We received your message and will reply by email soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="surface p-6 md:p-8">
      <label className="block text-sm font-medium" htmlFor="lead-name">
        Name
      </label>
      <input
        id="lead-name"
        name="name"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        className={inputClass}
      />

      <label className="mt-5 block text-sm font-medium" htmlFor="lead-email">
        Email
      </label>
      <input
        id="lead-email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        className={inputClass}
      />

      <label className="mt-5 block text-sm font-medium" htmlFor="lead-message">
        Message
      </label>
      <textarea
        id="lead-message"
        name="message"
        rows={4}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className={inputClass}
      />

      <label className="mt-5 flex items-start gap-3 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          required
          className="mt-1"
        />
        <span>
          I agree to be contacted about CheckApp and accept the{' '}
          <Link className="font-medium text-primary underline" href="/privacy">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {status === 'error' ? (
        <p className="mt-4 text-sm text-accent-amber" role="alert">
          Could not send your message. Please try again or email hello@checkapp.today.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'sending' || !name.trim() || !email.trim() || !consent}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-8 py-3 text-[15px] font-semibold text-white disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
