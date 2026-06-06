export type AIToolCategory = 'text' | 'image' | 'video';

export interface AITool {
  id: string;
  name: string;
  category: AIToolCategory;
  description: string;
  limits: string;
  requiresVpn: boolean;
  link: string;
  icon?: string;
  tags: string[];
}

export const AI_TOOLS: AITool[] = [
  // Text tools
  {
    id: 'deepseek-text',
    name: 'DeepSeek',
    category: 'text',
    description: 'Анализ заявки по критериям, переписывание разделов в академическом стиле, поиск слабых мест, генерация вариантов названий.',
    limits: 'Полностью бесплатен, почти без лимитов.',
    requiresVpn: false,
    link: 'https://chat.deepseek.com/',
    tags: ['Анализ заявки', 'Стиль и формулировки']
  },
  {
    id: 'qwen-text',
    name: 'Qwen (Alibaba)',
    category: 'text',
    description: 'Мощная модель, отлично понимает русский. Хороша для стилистической доработки, написания ярких вступлений, упрощения сложных формулировок.',
    limits: 'Бесплатные попытки обновляются ежедневно.',
    requiresVpn: false,
    link: 'https://chat.qwen.ai/',
    tags: ['Стиль и формулировки', 'Написание с нуля']
  },
  {
    id: 'alice-text',
    name: 'Яндекс Алиса',
    category: 'text',
    description: 'Быстрый фактчекинг, поиск актуальной статистики, проверка читабельности. Удобна для коротких правок и вопросов по ходу работы.',
    limits: 'Бесплатно, доступно с аккаунтом Яндекса.',
    requiresVpn: false,
    link: 'https://a.ya.ru/',
    tags: ['Фактчекинг', 'Проверка текста']
  },
  {
    id: 'chatgpt-text',
    name: 'ChatGPT (OpenAI)',
    category: 'text',
    description: 'Флагманский чат-бот. Генерация текста, перефразирование, анализ структуры.',
    limits: 'Бесплатный тариф даёт около 20–30 запросов в день.',
    requiresVpn: true,
    link: 'https://chatgpt.com/',
    tags: ['Генерация текста', 'Анализ заявки']
  },
  {
    id: 'gemini-text',
    name: 'Gemini (Google)',
    category: 'text',
    description: 'Глубокий анализ длинных документов, перефразирование, создание планов. Может предложить визуализацию идеи.',
    limits: 'Бесплатные квоты с гугл-аккаунтом.',
    requiresVpn: true,
    link: 'https://gemini.google.com/',
    tags: ['Анализ заявки', 'Стиль и формулировки']
  },
  {
    id: 'grok-text',
    name: 'Grok (xAI)',
    category: 'text',
    description: 'Хорош для генерации идей, проверки логики. Доступен через сайт или Telegram-бот @GrokAI (в Telegram без смены IP).',
    limits: 'Бесплатная версия Grok 3 позволяет задавать ограниченное количество вопросов в день.',
    requiresVpn: true,
    link: 'https://grok.com/',
    tags: ['Анализ заявки', 'Генерация идей']
  },

  // Image tools
  {
    id: 'shedevrum-image',
    name: 'Шедеврум (Яндекс)',
    category: 'image',
    description: 'Генерация изображений с пониманием русского языка.',
    limits: 'До 70 изображений в день.',
    requiresVpn: false,
    link: 'https://shedevrum.ai/',
    tags: ['Афиши и иллюстрации', 'На русском']
  },
  {
    id: 'chatgpt-image',
    name: 'ChatGPT / DALL·E',
    category: 'image',
    description: 'Встроенный генератор изображений по текстовому описанию от OpenAI.',
    limits: 'До 3 изображений в день на бесплатном тарифе.',
    requiresVpn: true,
    link: 'https://chatgpt.com/',
    tags: ['Логотипы', 'Афиши и иллюстрации']
  },
  {
    id: 'gemini-image',
    name: 'Gemini / Imagen',
    category: 'image',
    description: 'Высокое качество, фотореализм. Работает через Google AI Studio или Flow.',
    limits: 'Бесплатно в рамках квот платформы.',
    requiresVpn: true,
    link: 'https://gemini.google.com/',
    tags: ['Фотореализм', 'Логотипы']
  },
  {
    id: 'leonardo-image',
    name: 'Leonardo AI',
    category: 'image',
    description: 'Множество стилей, высокая детализация.',
    limits: 'Около 150 бесплатных кредитов в день.',
    requiresVpn: true,
    link: 'https://leonardo.ai/',
    tags: ['Арт', 'Афиши и иллюстрации']
  },
  {
    id: 'meta-image',
    name: 'Meta AI',
    category: 'image',
    description: 'Генерация изображений через чат Meta.',
    limits: 'Бесплатно, есть ежедневные ограничения.',
    requiresVpn: true,
    link: 'https://www.meta.ai/',
    tags: ['Иллюстрации', 'Универсальный']
  },

  // Video tools
  {
    id: 'shedevrum-video',
    name: 'Шедеврум (Яндекс)',
    category: 'video',
    description: 'До 10 коротких анимаций в день. Быстро, на русском языке.',
    limits: 'До 10 видео в день, до 5 секунд каждое.',
    requiresVpn: false,
    link: 'https://shedevrum.ai/',
    tags: ['Анимация логотипа', 'Короткие видео']
  },
  {
    id: 'veo-video',
    name: 'Google Flow (Veo)',
    category: 'video',
    description: 'Самое реалистичное качество видео от Google. Позволяет генерировать ролики по текстовому описанию.',
    limits: 'До 5 видео в день.',
    requiresVpn: true,
    link: 'https://labs.google/fx/ru/tools/flow',
    tags: ['Промо-ролики', 'Фотореализм']
  },
  {
    id: 'vidu-video',
    name: 'Vidu AI',
    category: 'video',
    description: 'Китайская нейросеть для генерации видео высокого качества. Простой интерфейс, видео от 4 секунд.',
    limits: '80 кредитов при регистрации.',
    requiresVpn: true,
    link: 'https://www.vidu.com/ru',
    tags: ['Промо-ролики', 'Анимация логотипа']
  },
  {
    id: 'meta-video',
    name: 'Meta AI',
    category: 'video',
    description: 'Для черновика или визуализации идеи. Присутствует полупрозрачный водяной знак.',
    limits: 'Бесплатно, есть ежедневные ограничения.',
    requiresVpn: true,
    link: 'https://www.meta.ai/',
    tags: ['Черновики', 'Промо-ролики']
  }
];
