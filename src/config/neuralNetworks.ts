export type NeuralNetworkType = 'text' | 'image' | 'video';

export interface NeuralNetwork {
  id: string;
  name: string;
  provider: string;
  type: NeuralNetworkType;
  needsVpn: boolean;
  description: string;
  url: string;
  registrationUrl?: string;
  limits?: string;
  howToUse?: string;
}

export const NEURAL_NETWORKS: NeuralNetwork[] = [
  // Text
  { 
    id: 'chatgpt', 
    name: 'ChatGPT', 
    provider: 'OpenAI', 
    type: 'text', 
    needsVpn: true, 
    description: 'Универсальный генератор текста, лучший для сложной логики и проработки разделов заявки.', 
    url: 'https://chat.openai.com', 
    registrationUrl: 'https://chat.openai.com/auth/login', 
    limits: 'Ограничения на количество запросов в час для GPT-4, базовая модель без строгих лимитов',
    howToUse: 'Войдите через Email или аккаунт Google. Введите ваш prompt в текстовое поле внизу и отправьте.'
  },
  { 
    id: 'gemini', 
    name: 'Gemini', 
    provider: 'Google', 
    type: 'text', 
    needsVpn: true, 
    description: 'Глубокий анализ, хорош для обоснования актуальности, работы с данными.', 
    url: 'https://gemini.google.com', 
    registrationUrl: 'https://gemini.google.com', 
    limits: 'Безлимитно для базовых нужд',
    howToUse: 'Пройдите авторизацию по Google-аккаунту. В поле ввода отправьте текстовый запрос на русском языке.'
  },
  { 
    id: 'deepseek', 
    name: 'DeepSeek', 
    provider: 'DeepSeek', 
    type: 'text', 
    needsVpn: false, 
    description: 'Мощный бесплатный аналог, понимает русский, умеет критиковать и улучшать текст.', 
    url: 'https://chat.deepseek.com', 
    registrationUrl: 'https://chat.deepseek.com', 
    limits: 'Бесплатно, до 50 сообщений за сессию',
    howToUse: 'Пройдите быструю авторизацию по Email или Google. Напишите ваш промт в чате и нажмите кнопку отправки.'
  },
  { 
    id: 'yandexgpt', 
    name: 'YandexGPT (Алиса)', 
    provider: 'Yandex', 
    type: 'text', 
    needsVpn: false, 
    description: 'Удобна для быстрой генерации коротких блоков.', 
    url: 'https://aliceweb.yandex.ru/', 
    registrationUrl: 'https://passport.yandex.ru/auth', 
    limits: 'Без строгих лимитов',
    howToUse: 'Авторизуйтесь через ваш Яндекс ID. В интерактивном диалоге с Алисой напишите запрос для генерации текста.'
  },
  { 
    id: 'qwen', 
    name: 'Qwen', 
    provider: 'Alibaba', 
    type: 'text', 
    needsVpn: false, 
    description: 'Неплохой генератор текста на русском, можно использовать как резервный вариант.', 
    url: 'https://chat.qwenlm.ai/', 
    registrationUrl: 'https://chat.qwenlm.ai/', 
    limits: 'Достаточные лимиты для обычного использования',
    howToUse: 'Зарегистрируйтесь по почте или Google. Задайте вопрос в поле чата.'
  },
  // Image
  { 
    id: 'kandinsky', 
    name: 'Kandinsky', 
    provider: 'Sber', 
    type: 'image', 
    needsVpn: false, 
    description: 'Российская нейросеть, бесплатно, без VPN.', 
    url: 'https://fusionbrain.ai', 
    registrationUrl: 'https://fusionbrain.ai/editor', 
    limits: 'Безлимитно',
    howToUse: 'Войдите в веб-редактор, в поле ввода опишите желаемое изображение, определитесь со стилем и кликните "Создать".'
  },
  { 
    id: 'fusionbrain', 
    name: 'Fusion Brain', 
    provider: 'Sber', 
    type: 'image', 
    needsVpn: false, 
    description: 'Больше стилей.', 
    url: 'https://fusionbrain.ai', 
    registrationUrl: 'https://fusionbrain.ai/editor', 
    limits: 'Безлимитно',
    howToUse: 'Зайдите в редактор, детально напишите промт для изображения, выберите один из множества стилей и запустите генерацию.'
  },
  { 
    id: 'shedevrum', 
    name: 'Шедеврум', 
    provider: 'Yandex', 
    type: 'image', 
    needsVpn: false, 
    description: 'Российская нейросеть, бесплатно, без VPN.', 
    url: 'https://shedevrum.ai', 
    registrationUrl: 'https://shedevrum.ai', 
    limits: 'Безлимитно (в мобильном приложении)',
    howToUse: 'Нажмите кнопку добавления, выберите тип "Изображение", вставьте текстовое описание вашей идеи и нажмите "Сгенерировать".'
  },
  { 
    id: 'gemini_img', 
    name: 'Gemini (Image)', 
    provider: 'Google', 
    type: 'image', 
    needsVpn: true, 
    description: 'Генерация картинок с лимитами в день.', 
    url: 'https://gemini.google.com', 
    registrationUrl: 'https://gemini.google.com', 
    limits: 'Входит в общие лимиты Gemini',
    howToUse: 'В поле ввода найдите список инструментов, выберите изображение. Вставьте туда ваш промт (например, "Создай картинку...") и отправьте.'
  },
  { 
    id: 'chatgpt_img', 
    name: 'ChatGPT (Image)', 
    provider: 'OpenAI', 
    type: 'image', 
    needsVpn: true, 
    description: 'Генерация картинок с лимитами в день.', 
    url: 'https://chat.openai.com', 
    registrationUrl: 'https://chat.openai.com', 
    limits: '2 бесплатных генерации в день (DALL-E 3)',
    howToUse: 'В чате ChatGPT просто попросите: "Нарисуй изображение... [ваше подробное описание]" и отправьте запрос.'
  },
  { 
    id: 'google_flow_img', 
    name: 'Google Flow (Imagen)', 
    provider: 'Google', 
    type: 'image', 
    needsVpn: true, 
    description: 'Генерация картинок почти без ограничения.', 
    url: 'https://labs.google/fx/ru/tools/flow', 
    registrationUrl: 'https://labs.google/fx/ru/tools/flow', 
    limits: 'Без строгих лимитов',
    howToUse: 'Выберите в чате функцию создания изображения с помощью Нано банана или создания видео. Добавьте промт или ваше готовое изображение.'
  },
  { 
    id: 'meta_ai_img', 
    name: 'Meta AI (Image)', 
    provider: 'Meta', 
    type: 'image', 
    needsVpn: true, 
    description: 'Генерация картинок почти без ограничения.', 
    url: 'https://meta.ai', 
    registrationUrl: 'https://meta.ai', 
    limits: 'Ограничений почти нет (в поддерживаемых странах)',
    howToUse: 'После входа введите команду "Imagine: " и добавьте описание изображения на английском языке.'
  },
  // Video
  { 
    id: 'alice_video', 
    name: 'Яндекс Алиса', 
    provider: 'Yandex', 
    type: 'video', 
    needsVpn: false, 
    description: 'Ограниченное время на 4 секунды, бесплатно.', 
    url: 'https://alice.yandex.ru', 
    registrationUrl: 'https://alice.yandex.ru', 
    limits: 'Короткие зацикленные видео, без строгих лимитов',
    howToUse: 'Выберите в чате функцию "Оживить фото" и добавьте ваше изображение. После этого добавьте ваш промт.'
  },
  { 
    id: 'google_flow_vid', 
    name: 'Google Flow (Veo 3)', 
    provider: 'Google', 
    type: 'video', 
    needsVpn: true, 
    description: 'Генерация с ограничениями в день.', 
    url: 'https://labs.google/fx/ru/tools/flow', 
    registrationUrl: 'https://labs.google/fx/ru/tools/flow', 
    limits: 'Лимиты выдаются порциями каждый день',
    howToUse: 'Выберите в чате функцию создания видео. Учтите ограничения на видео в зависимости от количества кредитов: чем проще модель, тем дешевле. Добавьте промт или ваше готовое изображение.'
  },
  { 
    id: 'vidu_ai', 
    name: 'Vidu AI', 
    provider: 'Vidu', 
    type: 'video', 
    needsVpn: true, 
    description: 'Генерация видео с ограничениями в день.', 
    url: 'https://www.vidu.com/ru', 
    registrationUrl: 'https://www.vidu.com/ru', 
    limits: 'Бесплатные кредиты на ~5-10 видео в день',
    howToUse: 'Нужно выбрать в левой панели "фото в видео", и уже потом в панели выбрать доступные функции, и установить время видео так, чтобы хватило кредитов.'
  },
  { 
    id: 'meta_ai_vid', 
    name: 'Meta AI (Video)', 
    provider: 'Meta', 
    type: 'video', 
    needsVpn: true, 
    description: 'Генерация видео (4-8 секунд, без звука).', 
    url: 'https://meta.ai', 
    registrationUrl: 'https://meta.ai', 
    limits: 'Ограничений почти нет (в поддерживаемых странах)',
    howToUse: 'Напишите текстовое описание для создания клипа (например: "create 5 seconds video of...") и отправьте в чат.'
  },
];
