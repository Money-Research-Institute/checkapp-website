/**
 * One Apps Script deployment for every lead form across our sites
 * (Rentiers, Cryp2bus, CheckApp).
 * Set NEXT_PUBLIC_LEADS_WEBHOOK_URL to override; do not add a second macros URL.
 */
const PRIMARY_LEADS_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbxgm1M73LWE_23wtbWzJjLBwd7P_s1t46Y2bwDNf2Wc9KKkGjjPtR91xFTkKdp64PHV/exec';

export const LEADS_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_LEADS_WEBHOOK_URL ?? PRIMARY_LEADS_WEBHOOK_URL;

export async function postToLeadsWebhook(
  payload: unknown,
  rejectedMessage = 'Webhook rejected the submission',
): Promise<void> {
  const response = await fetch(LEADS_WEBHOOK_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Webhook HTTP ${response.status}: ${text.slice(0, 200)}`);
  }

  try {
    const data = JSON.parse(text) as { result?: string; error?: string };
    if (data.result !== 'ok') {
      throw new Error(data.error || rejectedMessage);
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      if (!text.toLowerCase().includes('ok')) {
        throw new Error('Unexpected webhook response');
      }
    } else {
      throw err;
    }
  }
}
