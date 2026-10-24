import { DownloadView } from '@/app/(en)/(pages)/download/DownloadView';
import { getRegionCopy } from '@/content/copy';
import { getDict } from '@/i18n';
import '@/i18n/typeset-copy';
import { DEFAULT_OG_IMAGE_RU, RUSSIAN_DOWNLOAD_PATH } from '@/lib/constants';
import { createMetadata } from '@/lib/seo';

const t = getDict('ru').download;

/**
 * The Russian download page: where «Скачать checkapp» on `/ru/` leads. Same page and same APK flow as `/download/`, in Russian
 * (docs/landing-copy.md: the main call to action must not drop a Russian visitor onto an English page). The regulatory line is
 * the client's own Russian disclaimer.
 */
export const metadata = createMetadata({
  title: t.metaTitle,
  description: t.metaDescription,
  path: RUSSIAN_DOWNLOAD_PATH,
  ogImage: DEFAULT_OG_IMAGE_RU,
  languages: { en: '/download/', ru: RUSSIAN_DOWNLOAD_PATH, 'x-default': '/download/' },
  locale: 'ru_RU',
  alternateLocales: ['en_US'],
});

export default function RussianDownloadPage() {
  return (
    <DownloadView
      t={t}
      disclaimer={getRegionCopy('ru').disclaimer}
      homePath="/ru/"
      downloadPath={RUSSIAN_DOWNLOAD_PATH}
    />
  );
}
