'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { Button, Field, FormMessage, GlassCard, Input } from '@/components/ds';
import { ACCOUNT_DELETION_PATH, SITE_URL, SOCIAL_LINKS } from '@/lib/constants';
import { useHeadingFocus } from './useHeadingFocus';
import styles from './forms.module.css';

type Step = 'email' | 'code' | 'confirm' | 'done';

/**
 * supabase-js is about 60 KB gzipped and only this form needs it, so it is loaded when the form mounts rather than
 * shipped in the page's first bundle. The client itself is the same one the previous site created.
 */
const loadSupabase = () => import('@/lib/supabaseBrowser').then((module) => module.getSupabaseBrowserClient());

/** Shown when a request throws (offline, or the chunk could not load) instead of returning a Supabase error. */
const NETWORK_ERROR = 'Something went wrong. Check your connection and try again.';

/** `aria-describedby` for a control whose only description is its error. */
const errorId = (id: string, error: string | null) => (error ? `${id}-error` : undefined);

/**
 * Account deletion for Google Play. Play-critical, so the flow is exactly the previous site's:
 *   email -> Supabase email OTP (no new users) -> code -> `delete-account` edge function -> sign out -> done.
 * A visitor who already has a session (the magic-link variant of the email) lands on the confirm step.
 * Only the markup moved onto the design system: labelled fields, errors tied to their field, and focus that follows
 * each step so keyboard and screen-reader users are not left on a control that has just disappeared.
 */
export function DeleteAccountForm() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const heading = useHeadingFocus<HTMLHeadingElement>(step);

  useEffect(() => {
    void loadSupabase()
      .then((supabase) => supabase.auth.getSession())
      .then(({ data }) => {
        if (data.session?.user) setStep('confirm');
      })
      .catch(() => {
        /* no session to resume: the form simply starts at the email step */
      });
  }, []);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const input = event.currentTarget.elements.namedItem('email') as HTMLInputElement | null;
    if (!email.trim()) {
      setFieldError('Enter the email on your CheckApp account.');
      input?.focus();
      return;
    }
    if (input?.validity.typeMismatch) {
      setFieldError('Enter a valid email address, like name@example.com.');
      input.focus();
      return;
    }

    setBusy(true);
    setError(null);
    setFieldError(null);
    try {
      const supabase = await loadSupabase();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${SITE_URL}${ACCOUNT_DELETION_PATH}`,
        },
      });
      // "No such user" is treated like success, so the page never reveals which emails have an account.
      if (otpError && !/signups not allowed|user not found|otp/i.test(otpError.message)) {
        setError(otpError.message);
        return;
      }
      setStep('code');
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (code.trim().length < 6) {
      setFieldError('Enter the 6-digit code from the email.');
      document.getElementById('delete-code')?.focus();
      return;
    }

    setBusy(true);
    setError(null);
    setFieldError(null);
    try {
      const supabase = await loadSupabase();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email',
      });
      if (verifyError) {
        setError('That code did not work. Check the email and try again.');
        return;
      }
      setStep('confirm');
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = await loadSupabase();
      const { data, error: invokeError } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
        body: {},
      });
      if (invokeError || data?.error) {
        setError(data?.error || invokeError?.message || 'Could not delete the account.');
        return;
      }
      // The account is gone by now; failing to clear the local session must not turn that into an error message.
      await supabase.auth.signOut().catch(() => undefined);
      setStep('done');
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusy(false);
    }
  }

  const status = (
    <div className={styles.srOnly} role="status" aria-live="polite">
      {busy ? 'Working…' : ''}
    </div>
  );

  if (step === 'done') {
    return (
      <GlassCard glow className={styles.card} role="status">
        <div className={styles.stack}>
          <h2 ref={heading} tabIndex={-1} className={styles.title}>
            Account deleted
          </h2>
          <p className={styles.text}>
            Your CheckApp account and associated app data have been deleted. AI provider logs, if any, are not kept by
            CheckApp and fall under Anthropic&apos;s retention terms.
          </p>
        </div>
      </GlassCard>
    );
  }

  if (step === 'confirm') {
    return (
      <GlassCard className={styles.card}>
        <div className={styles.stack} aria-busy={busy || undefined}>
          <h2 ref={heading} tabIndex={-1} className={styles.title}>
            Permanently delete this account?
          </h2>
          <p className={styles.text}>
            This cannot be undone. We will delete your login, profile, messages, scans, and stored photos from
            CheckApp.
          </p>
          {status}
          {error ? <FormMessage tone="error">{error}</FormMessage> : null}
          <div className={styles.actions}>
            <Button
              className={`${styles.submit} ${styles.danger}`}
              aria-disabled={busy || undefined}
              onClick={() => void confirmDelete()}
            >
              {busy ? 'Deleting…' : 'Delete my account'}
            </Button>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (step === 'code') {
    return (
      <GlassCard className={styles.card}>
        <form noValidate onSubmit={(event) => void verifyCode(event)} aria-busy={busy || undefined} className={styles.form}>
          <h2 ref={heading} tabIndex={-1} className={styles.title}>
            Enter the email code
          </h2>
          <p className={styles.text}>
            If an account exists for <strong>{email}</strong>, we sent a 6-digit code. Enter it below. If you received a
            link instead, open it on this page.
          </p>
          <Field label="Confirmation code" htmlFor="delete-code" error={fieldError}>
            <Input
              id="delete-code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setFieldError(null);
              }}
              aria-invalid={fieldError ? true : undefined}
              aria-describedby={errorId('delete-code', fieldError)}
            />
          </Field>
          {status}
          {error ? <FormMessage tone="error">{error}</FormMessage> : null}
          <div className={styles.actions}>
            <Button type="submit" className={styles.submit} aria-disabled={busy || undefined}>
              {busy ? 'Checking…' : 'Continue'}
            </Button>
          </div>
        </form>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={styles.card}>
      <form noValidate onSubmit={(event) => void requestCode(event)} aria-busy={busy || undefined} className={styles.form}>
        <h2 ref={heading} tabIndex={-1} className={styles.title}>
          Request deletion
        </h2>
        <p className={styles.text}>
          Enter the email on your CheckApp account. We will send a confirmation code — we never delete an account from
          this page without that step.
        </p>
        <Field label="Email" htmlFor="delete-email" error={fieldError}>
          <Input
            id="delete-email"
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
              setFieldError(null);
            }}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={errorId('delete-email', fieldError)}
          />
        </Field>
        {status}
        {error ? <FormMessage tone="error">{error}</FormMessage> : null}
        <div className={styles.actions}>
          <Button type="submit" className={styles.submit} aria-disabled={busy || undefined}>
            {busy ? 'Sending…' : 'Send confirmation code'}
          </Button>
        </div>
        <p className={styles.text}>
          You can also email{' '}
          <a className={styles.link} href={SOCIAL_LINKS.contact}>
            hello@checkapp.today
          </a>{' '}
          with the subject “Delete my account”.
        </p>
      </form>
    </GlassCard>
  );
}
