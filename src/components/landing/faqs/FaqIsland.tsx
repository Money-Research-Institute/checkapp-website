'use client';

import { useEffect } from 'react';
import { trackFaqOpen } from '@/lib/analytics';
import { initFaqLamp } from './lamp';

/**
 * The FAQ section's one client island. Renders nothing: the rows are server-rendered native <details>, so the section is
 * complete (and the lamp already hangs from the open row) before, and without, any of this. On mount it hands the list
 * to the lamp controller (src/components/landing/faqs/lamp.ts), which owns the lamp, the FLIP and the arrow keys, and
 * reports every opening through trackFaqOpen. A few hundred bytes plus the controller, in the initial bundle on purpose:
 * analytics must not wait for the lazy experience chunks.
 */
export function FaqIsland({ listId, page }: { listId: string; page: string }) {
  useEffect(() => {
    const list = document.getElementById(listId);
    if (!list) return;
    return initFaqLamp(list, (question) => trackFaqOpen(page, question));
  }, [listId, page]);
  return null;
}
