import { postToLeadsWebhook } from '@/lib/leadsWebhook';
import { formatUtms, getUtms, hasUtms } from '@/lib/utm';

/** Value of the `project` column in the shared leads sheet. */
export const LEAD_PROJECT_NAME = 'checkapp';

export interface LeadPayload {
  name: string;
  email: string;
  message?: string;
  consent: boolean;
  /** Where on the site the form was submitted (defaults to host + path). */
  source?: string;
}

export async function submitLead({
  name,
  email,
  message = '',
  consent,
  source,
}: LeadPayload): Promise<void> {
  const page =
    typeof window !== 'undefined'
      ? `${window.location.hostname}${window.location.pathname}`
      : 'checkapp.today';

  const utms = getUtms();
  const sourceDetails = [
    source ?? page,
    message.trim() && `message: ${message.trim()}`,
    formatUtms(utms),
  ]
    .filter(Boolean)
    .join(' | ');

  const payload = {
    name: name.trim(),
    email: email.trim(),
    phone: '',
    consent,
    project: LEAD_PROJECT_NAME,
    source: sourceDetails,
    timestamp: new Date().toISOString(),
    ...(message.trim() ? { message: message.trim() } : {}),
    ...(hasUtms(utms) ? utms : {}),
  };

  await postToLeadsWebhook(payload, 'Webhook rejected the lead');
}
