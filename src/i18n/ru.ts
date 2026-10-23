import type { Dict } from './en';

/**
 * Shell strings in Russian. DRAFT: the client has not approved any of this wording yet (docs/landing-copy.md lists the
 * drafts). Informal «ты», short, no medical claims. The landing sections' own wording is the client's text in
 * src/content/copy/ru.ts; this file only holds the chrome around them.
 */
export const ru: Dict = {
  skipLink: 'Перейти к содержимому', // DRAFT
  header: {
    navLabel: 'Основная навигация', // DRAFT
    mobileNavLabel: 'Мобильная навигация', // DRAFT
    openMenu: 'Открыть меню', // DRAFT
    closeMenu: 'Закрыть меню', // DRAFT
    cta: 'Скачать checkapp', // DRAFT
    home: 'Главная', // DRAFT
    howItWorks: 'Как это работает', // DRAFT
    features: 'Возможности', // DRAFT
    blog: 'Блог', // DRAFT
  },
  mobileBar: {
    cta: 'Скачать checkapp', // DRAFT
  },
  cookie: {
    label: 'Согласие на cookie', // DRAFT
    text: 'Мы используем cookie, чтобы сайт работал лучше и чтобы понимать, как им пользуются.', // DRAFT
    privacy: 'Политика конфиденциальности', // DRAFT
    necessary: 'Только нужные', // DRAFT: short enough to share a 320px row with «Принять все»
    accept: 'Принять все', // DRAFT
  },
  footer: {
    heading: 'Подвал сайта checkapp', // DRAFT
    tagline: 'Твой цифровой друг здоровья. Сделай фото — и DiDi даст короткий wellness-разбор, только когда ты сам попросишь.', // DRAFT
    product: 'Продукт', // DRAFT
    company: 'Компания', // DRAFT
    connect: 'Связь', // DRAFT
    features: 'Возможности', // DRAFT
    howItWorks: 'Как это работает', // DRAFT
    blog: 'Блог', // DRAFT
    privacy: 'Конфиденциальность', // DRAFT
    terms: 'Условия', // DRAFT
    deleteAccount: 'Удалить аккаунт', // DRAFT
    contact: 'Контакты', // DRAFT
    instagram: 'Instagram',
    twitter: 'Twitter/X',
    legalNav: 'Юридическая информация', // DRAFT
    regionNav: 'Выбери регион', // DRAFT
    regionHeading: 'Регион', // DRAFT
    opensInNewTab: 'откроется в новой вкладке', // DRAFT
    pageInEnglish: 'страница на английском', // DRAFT
    copyright: '© {year} {name} · Только для общего благополучия · Не медицинское изделие', // DRAFT
  },
  notFound: {
    eyebrow: '404',
    title: 'Эта страница куда-то пропала', // DRAFT
    lede: 'DiDi искал везде и не нашёл её. Давай вернём тебя туда, где всё на месте.', // DRAFT
    back: 'На главную', // DRAFT
  },
};
