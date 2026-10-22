'use client';

import Link from 'next/link';
import { type FormEvent, useEffect, useState } from 'react';
import { Button, Checkbox, Field, FormMessage, GlassCard, Input, Textarea } from '@/components/ds';
import { trackEvent } from '@/lib/analytics';
import { SOCIAL_LINKS } from '@/lib/constants';
import { submitLead } from '@/lib/submitLead';
import { captureUtms } from '@/lib/utm';
import { useHeadingFocus } from './useHeadingFocus';
import styles from './forms.module.css';

type Status = 'idle' | 'sending' | 'done' | 'error';
type FieldName = 'name' | 'email' | 'consent';
type Errors = Partial<Record<FieldName, string>>;

const IDS: Record<FieldName, string> = {
  name: 'lead-name',
  email: 'lead-email',
  consent: 'lead-consent',
};

/** `aria-describedby` for a control: its error, when it has one (the hint, if any, comes first). */
function describedBy(id: string, error?: string, hint = false) {
  return [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
}

/**
 * The contact form. The behaviour is the Play-critical part and is unchanged from the previous site: it posts the lead
 * through submitLead (the shared leads webhook), captures the UTMs on mount, fires `lead_submitted` and keeps the
 * consent wording. What changed is the markup: labelled controls, errors tied to their field with aria-describedby,
 * a persistent live region for the sending state, and focus that follows the result.
 *
 * Validation is ours rather than the browser's (`noValidate`), so every message is the same size, colour and place in
 * every browser and is announced; the native `required` attributes stay so assistive tech still reports them.
 */
export function LeadForm({ source = 'contact-form' }: { source?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const doneHeading = useHeadingFocus<HTMLHeadingElement>(status);

  useEffect(() => {
    captureUtms();
  }, []);

  const sending = status === 'sending';

  function clearError(field: FieldName) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const emailInput = event.currentTarget.elements.namedItem('email') as HTMLInputElement | null;
    const found: Errors = {};
    if (!name.trim()) found.name = 'Enter your name.';
    if (!email.trim()) found.email = 'Enter your email address.';
    else if (emailInput?.validity.typeMismatch) found.email = 'Enter a valid email address, like name@example.com.';
    if (!consent) found.consent = 'Please agree so we can contact you.';

    setErrors(found);
    const first = (['name', 'email', 'consent'] as const).find((field) => found[field]);
    if (first) {
      document.getElementById(IDS[first])?.focus();
      return;
    }

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
      <GlassCard glow className={styles.card} role="status">
        <div className={styles.stack}>
          <h2 ref={doneHeading} tabIndex={-1} className={styles.title}>
            Thank you!
          </h2>
          <p className={styles.text}>We received your message and will reply by email soon.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={styles.card}>
      <form
        noValidate
        onSubmit={(event) => void onSubmit(event)}
        aria-labelledby="lead-form-title"
        aria-busy={sending || undefined}
        className={styles.form}
      >
        <h2 id="lead-form-title" className={styles.title}>
          Send us a message
        </h2>

        <Field label="Name" htmlFor={IDS.name} error={errors.name}>
          <Input
            id={IDS.name}
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearError('name');
            }}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy(IDS.name, errors.name)}
          />
        </Field>

        <Field label="Email" htmlFor={IDS.email} error={errors.email}>
          <Input
            id={IDS.email}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearError('email');
            }}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy(IDS.email, errors.email)}
          />
        </Field>

        <Field label="Message (optional)" htmlFor="lead-message">
          <Textarea
            id="lead-message"
            name="message"
            rows={5}
            autoComplete="off"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </Field>

        <div>
          <Checkbox
            id={IDS.consent}
            name="consent"
            required
            checked={consent}
            onChange={(event) => {
              setConsent(event.target.checked);
              clearError('consent');
            }}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={describedBy(IDS.consent, errors.consent)}
            label={
              <>
                I agree to be contacted about CheckApp and accept the{' '}
                <Link className={styles.consentLink} href="/privacy/">
                  Privacy Policy
                </Link>
                .
              </>
            }
          />
          {errors.consent ? (
            <p id={`${IDS.consent}-error`} role="alert" className={styles.fieldError}>
              {errors.consent}
            </p>
          ) : null}
        </div>

        {/* Always mounted, so the change from empty to text is announced; a live region added with its text is not reliable. */}
        <div className={styles.srOnly} role="status" aria-live="polite">
          {sending ? 'Sending your message…' : ''}
        </div>

        {status === 'error' ? (
          <FormMessage tone="error">
            <p className={styles.messageText}>
              Could not send your message. Please try again or email{' '}
              <a className={styles.messageLink} href={SOCIAL_LINKS.contact}>
                hello@checkapp.today
              </a>
              .
            </p>
          </FormMessage>
        ) : null}

        <div className={styles.actions}>
          <Button type="submit" className={styles.submit} aria-disabled={sending || undefined}>
            {sending ? 'Sending…' : 'Send message'}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
