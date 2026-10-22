import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { CheckIcon } from './icons';
import styles from './fields.module.css';

/**
 * Form controls for inner pages (contact, delete-account). Dark fields, 48px tall, visible focus ring, errors
 * announced. Pair every control with a <Field> (label, hint, error) so the label is programmatically tied to it.
 */

export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? (
        <p className={styles.hint} id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} id={`${htmlFor}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={[styles.control, className].filter(Boolean).join(' ')} {...rest} />;
}

export function Textarea({ className, rows = 5, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={[styles.control, styles.textarea, className].filter(Boolean).join(' ')} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={[styles.control, styles.select, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </select>
  );
}

/**
 * A checkbox whose real <input> covers a 44 x 44 target while a 24px box is drawn next to the label text.
 * `label` may contain links; the input stays the click target for the box only.
 */
export function Checkbox({
  label,
  className,
  id,
  ...rest
}: { label: ReactNode } & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return (
    <div className={[styles.check, className].filter(Boolean).join(' ')}>
      <span className={styles.checkBox}>
        <input id={id} type="checkbox" className={styles.checkInput} {...rest} />
        <span className={styles.checkMark} aria-hidden="true">
          <CheckIcon size={16} />
        </span>
      </span>
      <label htmlFor={id} className={styles.checkLabel}>
        {label}
      </label>
    </div>
  );
}

/** A status line under a form: `error` is announced immediately (role=alert), `success` and `info` politely (role=status). */
export function FormMessage({
  tone = 'info',
  children,
  className,
}: {
  tone?: 'error' | 'success' | 'info';
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={[styles.message, styles[tone], className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
