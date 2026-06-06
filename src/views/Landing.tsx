import React from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../store.tsx';
import { GuideCarousel } from '../components/GuideCarousel';

const ADVANTAGES = [
  { icon: '📋', title: 'Пошаговая структура', desc: '8 шагов, соответствующих логике экспертов ФПГ, ПФКИ и Росмолодёжи' },
  { icon: '💡', title: 'Умные подсказки', desc: 'На каждом шаге — советы, примеры и памятки, как заполнить раздел правильно' },
  { icon: '📊', title: 'Оценка готовности', desc: 'Конструктор подсчитывает заполненные поля и показывает, какие блоки требуют доработки' },
  { icon: '📄', title: 'Готовый Word + ИИ-аудит', desc: 'Черновик заявки в формате Word и автоматический промт для проверки в DeepSeek' }
];

const STEPS = [
  'Вы отвечаете на вопросы — конструктор ведёт вас от идеи до бюджета.',
  'Получаете черновик и оценку — система покажет, насколько полно вы описали проект.',
  'Отправляете на ИИ-аудит — по одному клику заявка копируется в DeepSeek с готовым строгим промтом.'
];

export const Landing: React.FC = () => {
  const { setStep } = useAppContext();

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-6 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl text-center space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-950">
            Соберите грантовую заявку <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-600">за 8 шагов</span> — без страха перед чистым листом
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Пошаговый конструктор с подсказками и оценкой качества. Вы получаете структурированный черновик для подачи в фонд, а нейросеть DeepSeek поможет найти слабые места.
          </p>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep(1)}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white rounded-full font-bold text-lg shadow-lg transition-all"
            >
              Начать проект
            </motion.button>
            <p className="text-sm text-gray-500 mt-2">Бесплатно. Без регистрации. Сохраните черновик в браузере.</p>
          </div>

          {/* Advantages */}
          <div className="grid md:grid-cols-2 gap-4 text-left pt-4">
             {ADVANTAGES.map((adv, i) => (
               <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                 <div className="text-2xl mt-0.5">{adv.icon}</div>
                 <div>
                    <h4 className="font-bold text-gray-950 text-lg mb-1">{adv.title}</h4>
                    <p className="text-base text-gray-700 leading-relaxed">{adv.desc}</p>
                 </div>
               </div>
             ))}
          </div>

          {/* How it works */}
          <div>
             <h3 className="text-xl font-bold text-gray-950 mb-3 pt-2">Как это работает</h3>
             <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-6">
               {STEPS.map((step, i) => (
                  <div key={i} className="flex-1 max-w-[280px] text-center flex flex-col items-center">
                     <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-base mb-3">{i+1}</div>
                     <p className="text-base text-gray-700 leading-snug">{step}</p>
                  </div>
               ))}
             </div>
          </div>

        </motion.div>
      </div>

      <GuideCarousel />
    </>
  );
};
