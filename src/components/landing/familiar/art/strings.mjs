/**
 * The words on the four device screens, English and Russian. The Russian strings are drafts like every other Russian string of
 * the landing page (the client approves them); where src/content/copy has the client's wording for the same UI («Чат?»,
 * «Добрый день, Mah!») the final-cta phone uses the same.
 */
export const STR = {
  en: {
    home: { talk: 'Talk?', greet: 'Good afternoon, Mah!', light: 'Light it up!', ready: 'DiDi is ready when you are.', days: '4 days', streak: 'Streak', dow: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], start: 'Start Tongue Scan' },
    scan: { title: 'Scan Details', overall: 'Overall Result', date: 'Today, 4:56 pm', chip: 'Looks stable', labels: ['Tongue Color','Coating','Moisture','Surface Texture'], values: ['Light pink','Thin white coating','Slightly dry','Mostly smooth'], summary: 'Summary', rec: 'Recommended Next Steps', drink: 'Drink more water today', para: null, view: null },
    chat: { ask: 'Hey Mah! Want to check in? Send me a quick photo and I’ll tell you what I notice. \u{1F60A}', time1: '4:56 pm', time2: '4:56 pm', reply: 'Thanks, Mah! Here’s what I noticed. Tap to see your full result.', time3: '4:57 pm', placeholder: null },
    record: { guide: 'Fit your face in the circle' },
  },
  ru: {
    home: { talk: 'Чат?', greet: 'Добрый день, Mah!', light: 'Зажги серию!', ready: 'DiDi ждёт, когда ты готов.', days: '4 дня', streak: 'Серия', dow: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'], start: 'Начать скан языка' },
    scan: { title: 'Детали скана', overall: 'Общий результат', date: 'Сегодня, 16:56', chip: 'Стабильно', labels: ['Цвет языка','Налёт','Влажность','Текстура поверхности'], values: ['Светло-розовый','Тонкий белый налёт','Слегка суховат','В основном гладкая'], summary: 'Резюме', rec: 'Рекомендуемые шаги', drink: 'Выпей больше воды сегодня', para: 'В целом скан выглядит стабильно: на поверхности языка заметна лёгкая сухость. Пей достаточно воды и повтори скан позже — это может помочь.', view: 'Открыть весь диалог' },
    chat: { ask: 'Привет, Mah! Хочешь сделать скан? Пришли мне быстрое фото, и я расскажу, что заметил. \u{1F60A}', time1: '16:56', time2: '16:56', reply: 'Спасибо, Mah! Вот что я заметил. Нажми, чтобы увидеть полный результат.', time3: '16:57', placeholder: 'Спроси меня о чём угодно…' },
    record: { guide: 'Помести лицо в круг' },
  },
};
