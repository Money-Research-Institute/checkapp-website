'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ACCOUNT_DELETION_PATH, SITE_URL, SOCIAL_LINKS } from '@/lib/constants';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';

type Step = 'email' | 'code' | 'confirm' | 'done';

export function DeleteAccountForm() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setStep('confirm');
    });
  }, []);

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${SITE_URL}${ACCOUNT_DELETION_PATH}`,
      },
    });
    setBusy(false);
    if (otpError && !/signups not allowed|user not found|otp/i.test(otpError.message)) {
      setError(otpError.message);
      return;
    }
    setStep('code');
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    });
    setBusy(false);
    if (verifyError) {
      setError('That code did not work. Check the email and try again.');
      return;
    }
    setStep('confirm');
  }

  async function confirmDelete() {
    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { data, error: invokeError } = await supabase.functions.invoke('delete-account', {
      method: 'POST',
      body: {},
    });
    if (invokeError || data?.error) {
      setBusy(false);
      setError(data?.error || invokeError?.message || 'Could not delete the account.');
      return;
    }
    await supabase.auth.signOut();
    setBusy(false);
    setStep('done');
  }

  if (step === 'done') {
    return (
      <div className="surface p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold">Account deleted</h2>
        <p className="mt-3 text-text-secondary">
          Your CheckApp account and associated app data have been deleted. AI provider logs, if any,
          are not kept by CheckApp and fall under Anthropic&apos;s retention terms.
        </p>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="surface p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold">Permanently delete this account?</h2>
        <p className="mt-3 text-text-secondary">
          This cannot be undone. We will delete your login, profile, messages, scans, and stored
          photos from CheckApp.
        </p>
        {error ? <p className="mt-4 text-sm text-accent-amber">{error}</p> : null}
        <button
          type="button"
          onClick={() => void confirmDelete()}
          disabled={busy}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-8 py-3 text-[15px] font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Deleting…' : 'Delete my account'}
        </button>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <form onSubmit={(event) => void verifyCode(event)} className="surface p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold">Enter the email code</h2>
        <p className="mt-3 text-text-secondary">
          If an account exists for {email}, we sent a 6-digit code. Enter it below. If you received
          a link instead, open it on this page.
        </p>
        <label className="mt-6 block text-sm font-medium" htmlFor="code">
          Confirmation code
        </label>
        <input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          required
          className="mt-2 w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-text"
        />
        {error ? <p className="mt-4 text-sm text-accent-amber">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || code.trim().length < 6}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-8 py-3 text-[15px] font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Checking…' : 'Continue'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={(event) => void requestCode(event)} className="surface p-6 md:p-8">
      <h2 className="font-display text-2xl font-bold">Request deletion</h2>
      <p className="mt-3 text-text-secondary">
        Enter the email on your CheckApp account. We will send a confirmation code — we never delete
        an account from this page without that step.
      </p>
      <label className="mt-6 block text-sm font-medium" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        className="mt-2 w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-text"
      />
      {error ? <p className="mt-4 text-sm text-accent-amber">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !email.trim()}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-8 py-3 text-[15px] font-semibold text-white disabled:opacity-60"
      >
        {busy ? 'Sending…' : 'Send confirmation code'}
      </button>
      <p className="mt-4 text-sm text-text-secondary">
        You can also email{' '}
        <a className="font-medium text-primary underline" href={SOCIAL_LINKS.contact}>
          hello@checkapp.today
        </a>{' '}
        with the subject “Delete my account”.
      </p>
    </form>
  );
}
