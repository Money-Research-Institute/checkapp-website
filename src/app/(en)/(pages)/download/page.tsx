import { getDict } from '@/i18n';
import { RUSSIAN_DOWNLOAD_PATH } from '@/lib/constants';
import { createMetadata } from '@/lib/seo';
import { DownloadView } from './DownloadView';

const t = getDict('en').download;

export const metadata = createMetadata({
  title: t.metaTitle,
  description: t.metaDescription,
  path: '/download/',
  languages: { en: '/download/', ru: RUSSIAN_DOWNLOAD_PATH, 'x-default': '/download/' },
  locale: 'en_US',
  alternateLocales: ['ru_RU'],
});

export default function DownloadPage() {
  return (
    <DownloadView
      t={t}
      // D1: the regulatory wording stays.
      disclaimer="checkapp and DiDi are wellness companions — not a medical device or diagnosis tool."
      homePath="/"
      downloadPath="/download/"
    />
  );
}
