/**
 * Shell strings in English: header, mobile CTA bar, cookie notice, footer, 404 and the aria-labels that go with them.
 * English is the default for every page that is not a landing page. The landing sections read their own wording from
 * src/content/copy (the client's text); this file only holds the chrome around them.
 *
 * `Dict` is the contract: ru.ts must have exactly these keys, so a string can't be forgotten in one language.
 * Every leaf is a plain string (no functions), so a slice can be handed to a client component as a prop.
 * Spelling: "checkapp" (lower case) and "DiDi" (docs/landing-copy.md).
 */
export const en = {
  skipLink: 'Skip to content',
  header: {
    navLabel: 'Main',
    mobileNavLabel: 'Mobile',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    /** Label of the header download button on pages that are not a landing page. Landing pages use copy.hero.cta. */
    cta: 'Download now',
    home: 'Home',
    howItWorks: 'How it works',
    features: 'Features',
    blog: 'Blog',
  },
  mobileBar: {
    /** Pages that are not a landing page. Landing pages use copy.hero.cta. */
    cta: 'Get checkapp free',
  },
  cookie: {
    label: 'Cookie consent',
    text: 'We use cookies to improve your experience and understand site traffic.',
    privacy: 'Privacy policy',
    necessary: 'Necessary only',
    accept: 'Accept all',
  },
  footer: {
    heading: 'checkapp footer',
    tagline: 'Your digital health companion. Take a photo and DiDi shares a short wellness insight, only when you ask.',
    product: 'Product',
    company: 'Company',
    connect: 'Connect',
    features: 'Features',
    howItWorks: 'How it works',
    blog: 'Blog',
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact',
    instagram: 'Instagram',
    twitter: 'Twitter/X',
    regionNav: 'Choose your region',
    regionHeading: 'Region',
    opensInNewTab: 'opens in a new tab',
    /** Spoken after a link whose page is only available in English (shown on the Russian pages). */
    pageInEnglish: 'page in English',
    copyright: '© {year} {name}',
  },
  notFound: {
    eyebrow: '404',
    title: 'This page wandered off',
    lede: "DiDi looked everywhere and could not find it. Let's get you back to somewhere that exists.",
    back: 'Back to home',
  },
  /** The download page (/download/ and its Russian twin /ru/download/). The APK flow itself lives in DownloadView. */
  download: {
    metaTitle: 'Download checkapp for Android',
    metaDescription:
      'Download the checkapp Android APK and start daily check-ins with DiDi, your AI wellness companion.',
    breadcrumbHome: 'Home',
    breadcrumbDownload: 'Download',
    eyebrow: 'Android',
    title: 'Download checkapp',
    lede: 'Direct APK for Android.',
    apk: 'Download APK',
    play: 'Get it on Google Play',
    soonTitle: 'APK coming shortly',
    /** Ends before the contact e-mail address, which the page adds as a link. */
    soonText:
      "We're preparing the production Android build. This page will unlock the download as soon as the file is published. Check back soon, or email",
    installTitle: 'Install on Android',
    step1: { before: 'Tap ', strong: 'Download APK', after: ' on this page (from your phone).' },
    step2: {
      before: 'If prompted, allow installs from this browser under ',
      em: 'Install unknown apps',
      after: '.',
    },
    step3: { before: 'Open the downloaded file and tap ', strong: 'Install', after: '.' },
    step4: 'Open checkapp and create your account.',
    beforeTitle: 'Before you install',
    androidVersion: 'Android 8.0 or newer recommended.',
    playStatus: 'Google Play listing is in progress; the APK here is the official direct download.',
  },
};

export type Dict = typeof en;
