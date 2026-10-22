'use client';

import { useEffect, useRef } from 'react';

/**
 * Multi-step forms replace their own content, which drops the keyboard focus onto <body> and says nothing to a screen
 * reader. Give this ref to the heading of the current step (with tabIndex={-1}) and focus follows each change of `key`.
 * It does nothing on the first render, so a page never steals focus when it loads.
 */
export function useHeadingFocus<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null);
  const previous = useRef(key);

  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    ref.current?.focus();
  }, [key]);

  return ref;
}
