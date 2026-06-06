import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import {
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Users,
  LayoutDashboard,
  Target,
  TrendingUp,
  Lightbulb,
  Map,
  FileSpreadsheet,
  Globe,
  FileText,
  ArrowRight,
  ZoomIn,
  X,
  Loader2,
} from "lucide-react";
import { toPng } from "html-to-image";

interface SlideData {
  id: number;
  title: string;
  text: React.ReactNode;
  visual: React.ReactNode;
  imageUrl?: string;
}

const slides: SlideData[] = [
  {
    id: 1,
    title: "Модульный конструктор",
    imageUrl:
      "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-1.webp?raw=true",
    text: (
      <>
        <p className="mb-2 font-bold text-gray-900 border-b border-gray-100 pb-2">
          как написать победную заявку на грант
        </p>
        <p className="text-gray-600">
          Руководство для начинающих: от локальной проблемы до стабильного
          финансирования
        </p>
      </>
    ),
    visual: (
      <div className="flex flex-col items-center justify-between h-full gap-2 w-full relative pt-4 pb-2 px-2">
        {/* Bridge */}
        <div className="flex items-end justify-between w-full px-2 mb-6 relative z-10">
          {/* Left shore */}
          <div className="flex flex-col items-center pb-2">
            <span className="font-bold text-red-500 text-[10px] md:text-sm mb-1 uppercase tracking-wider text-center bg-white/80 rounded px-1">
              Проблема
            </span>
            <div className="w-16 md:w-20 h-4 bg-slate-300 rounded-t-sm border-b-0 border-2 border-slate-400"></div>
          </div>

          {/* Bridge blocks */}
          <div className="flex-1 flex justify-center items-end relative bottom-2 gap-0 md:gap-1 px-1">
            {[
              "Цель",
              "Аудитория",
              "План",
              "Бюджет",
              "Команда",
              "Результаты",
            ].map((b, i) => (
              <motion.div
                key={b}
                initial={{ y: -50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, type: "spring", bounce: 0.4 }}
                className={`px-1 py-2 md:px-2 md:py-3 text-white border border-blue-700/80 shadow-md relative group bg-gradient-to-br from-blue-500 to-blue-600`}
                style={{
                  marginBottom: i < 3 ? `${i * 10}px` : `${(5 - i) * 10}px`,
                  zIndex: 10 - i,
                }}
              >
                <span className="text-[8px] md:text-[10px] font-bold leading-tight md:leading-normal transform -rotate-12 group-hover:rotate-0 transition-transform block">
                  {b}
                </span>
                {/* Interlocking puzzle-like notches */}
                {i > 0 && (
                  <div className="absolute -left-1.5 md:-left-2 top-1/2 -translate-y-1/2 w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full z-[-1]"></div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Right shore */}
          <div className="flex flex-col items-center pb-2">
            <span className="font-bold text-green-600 text-[10px] md:text-sm mb-1 uppercase tracking-wider text-center bg-white/80 rounded px-1">
              Финансирование
            </span>
            <div className="w-16 md:w-20 h-4 bg-slate-300 rounded-t-sm border-b-0 border-2 border-slate-400"></div>
          </div>
        </div>

        {/* Water */}
        <div className="absolute bottom-[4.5rem] left-0 right-0 h-10 overflow-hidden flex flex-col justify-center opacity-60 px-4 md:px-8">
          <svg
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
            className="w-full h-3 text-blue-300 stroke-current"
          >
            <motion.path
              animate={{
                d: [
                  "M0,5 Q12.5,0 25,5 T50,5 T75,5 T100,5",
                  "M0,5 Q12.5,10 25,5 T50,5 T75,5 T100,5",
                  "M0,5 Q12.5,0 25,5 T50,5 T75,5 T100,5",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <svg
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
            className="w-full h-4 text-blue-400 stroke-current mt-1 ml-2"
          >
            <motion.path
              animate={{
                d: [
                  "M0,5 Q12.5,10 25,5 T50,5 T75,5 T100,5",
                  "M0,5 Q12.5,0 25,5 T50,5 T75,5 T100,5",
                  "M0,5 Q12.5,10 25,5 T50,5 T75,5 T100,5",
                ],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Bottom text */}
        <div className="mt-auto w-full px-2 py-3 border border-dashed border-blue-300 bg-blue-50/80 rounded-xl text-center z-20">
          <p className="text-xs md:text-sm font-bold text-blue-800">
            «Краткий гид по сборке вашего проекта. Без воды и канцелярита.»
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "2. Логика проекта",
    imageUrl:
      "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-2.webp?raw=true",
    text: "Заявка — это мост. Вы переводите целевую аудиторию из точки А (Проблема) в точку Б (Решение).",
    visual: (
      <div className="flex flex-col items-center justify-center h-full pt-4">
        <div className="flex justify-between w-full px-8 mb-2">
          <span className="font-bold text-red-500 flex items-center gap-1">
            <XCircle size={16} /> Точка А
          </span>
          <span className="font-bold text-green-600 flex items-center gap-1">
            Точка Б <CheckCircle2 size={16} />
          </span>
        </div>
        <div className="w-4/5 h-16 border-4 border-b-0 border-blue-400 rounded-t-full relative overflow-hidden">
          <motion.div
            animate={{ x: ["-10%", "110%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-blue-200/50 to-transparent"
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm bg-white px-3 py-1 font-bold text-blue-600 rounded-full shadow-sm">
            Задачи
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "3. Главная ошибка",
    imageUrl:
      "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-3.webp?raw=true",
    text: "Фокус на средствах, а не на цели. Проект — это не закупка оборудования, а изменение жизни людей.",
    visual: (
      <div className="grid grid-cols-2 gap-4 h-full">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="border border-red-200 bg-red-50 p-4 rounded-xl flex flex-col justify-center items-center text-center shadow-inner"
        >
          <XCircle size={40} className="text-red-500 mb-2" />
          <p className="font-bold text-red-700 text-sm">
            "Нам нужно купить 10 ноутбуков"
          </p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="border border-green-200 bg-green-50 p-4 rounded-xl flex flex-col justify-center items-center text-center shadow-md"
        >
          <CheckCircle2 size={40} className="text-green-500 mb-2" />
          <p className="font-bold text-green-700 text-sm">
            "Мы обучим 30 пенсионеров компьютерной грамотности"
          </p>
        </motion.div>
      </div>
    ),
  },
  {
    id: 4,
    title: "4. Формула актуальности",
    imageUrl: "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-4.webp?raw=true",
    text: "Проблема должна быть доказана цифрами, а не эмоциями. Используйте формулу боли.",
    visual: (
      <div className="flex flex-col gap-3 h-full justify-center">
        {[
          { label: "Кто страдает? (Группа)", icon: Users },
          { label: "Как сильно? (Цифры)", icon: TrendingUp },
          { label: "Что будет, если не решить?", icon: Target },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex items-center gap-4 bg-white border border-blue-100 p-3 rounded-lg shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <item.icon size={20} />
            </div>
            <p className="text-sm font-bold text-gray-800">{item.label}</p>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 5,
    title: "5. Цель по SMART",
    imageUrl: "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-5.webp?raw=true",
    text: "Цель всегда одна. Она должна быть конкретной и измеримой.",
    visual: (
      <div className="flex flex-wrap items-center justify-center gap-2 h-full">
        {[
          { l: "Specific", c: "blue" },
          { l: "Measurable", c: "orange" },
          { l: "Achievable", c: "green" },
          { l: "Relevant", c: "purple" },
          { l: "Time-bound", c: "red" },
        ].map((s, i) => (
          <motion.div
            key={s.l}
            whileHover={{ scale: 1.1 }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`px-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-lg shadow-sm`}
          >
            {s.l}
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 6,
    title: "6. Задачи = Ступеньки",
    imageUrl: "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-6.webp?raw=true",
    text: "Задачи — это конкретные этапы, которые нужно выполнить, чтобы достичь цели. Не путайте с процессами.",
    visual: (
      <div className="flex items-end justify-center h-full pb-4">
        <div className="flex gap-2 items-end">
          {[1, 2, 3].map((step, i) => (
            <motion.div
              key={step}
              initial={{ height: 0 }}
              whileInView={{ height: `${(i + 1) * 30}%` }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="w-16 bg-blue-400 rounded-t-lg border-b-4 border-blue-600 flex justify-center items-center text-xs text-white font-bold shadow-md relative"
            >
              <span className="absolute -top-6 text-blue-600">Шаг {step}</span>
            </motion.div>
          ))}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `100%` }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-20 bg-green-500 rounded-t-lg flex justify-center items-center text-sm text-white font-extrabold shadow-lg relative ml-2"
          >
            <span className="absolute -top-6 text-green-600">Цель</span>
            <Target size={24} className="opacity-50" />
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    title: "7. Целевая аудитория",
    imageUrl: "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-7.webp?raw=true",
    text: "Чем точнее вы опишете того, для кого работаете, тем убедительнее звучит заявка.",
    visual: (
      <div className="flex flex-col justify-center h-full gap-6 px-4">
        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner flex items-center">
          <motion.div className="absolute left-1/4 right-1/4 h-full bg-blue-300 opacity-50" />
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute left-[45%] right-[45%] h-full bg-orange-500 rounded-full z-10 shadow-lg border-2 border-white flex items-center justify-center"
          >
            <Users size={12} className="text-white" />
          </motion.div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 font-bold">
          <span className="flex flex-col items-center">
            <XCircle size={14} className="text-red-400 mb-1" /> Все люди
          </span>
          <span className="flex flex-col items-center">Молодёжь</span>
          <span className="text-orange-600 flex flex-col items-center">
            <CheckCircle2 size={14} className="text-green-500 mb-1" /> Студенты
            1-2 курса
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 8,
    title: "8. Мероприятия и методы",
    imageUrl: "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-8.webp?raw=true",
    text: "Опишите, как именно вы будете решать задачи. Кто, что, где и как часто будет делать.",
    visual: (
      <div className="flex items-center justify-center gap-4 h-full relative">
        {[Map, FileText, LayoutDashboard].map((Icon, i) => (
          <React.Fragment key={i}>
            <motion.div
              whileHover={{ y: -5 }}
              className="w-16 h-16 rounded-2xl border-2 border-blue-200 flex items-center justify-center font-bold text-blue-600 z-10 bg-white shadow-lg"
            >
              <Icon size={24} />
            </motion.div>
            {i < 2 && <ArrowRight className="text-blue-300" />}
          </React.Fragment>
        ))}
      </div>
    ),
  },
  {
    id: 9,
    title: "9. Команда",
    imageUrl: "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-9.webp?raw=true",
    text: "Фонды инвестируют в людей. Докажите, что у вашей команды есть компетенции и опыт для реализации.",
    visual: (
      <div className="flex justify-center items-center gap-6 h-full">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex flex-col items-center"
        >
          <div className="w-14 h-14 bg-white border border-gray-200 rounded-full mb-2 flex items-center justify-center shadow-sm text-2xl">
            👩‍💼
          </div>
          <span className="text-xs font-bold text-gray-800">Руководитель</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-blue-50 border-2 border-blue-400 shadow-md rounded-full mb-2 flex items-center justify-center text-3xl relative">
            👨‍🏫
            <span className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              PRO
            </span>
          </div>
          <span className="text-sm font-bold text-blue-800">Наставник</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex flex-col items-center"
        >
          <div className="w-14 h-14 bg-white border border-gray-200 rounded-full mb-2 flex items-center justify-center shadow-sm text-2xl">
            👩‍💻
          </div>
          <span className="text-xs font-bold text-gray-800">Медиа</span>
        </motion.div>
      </div>
    ),
  },
  {
    id: 10,
    title: "10. Календарный план",
    imageUrl: "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-10.webp?raw=true",
    text: "План должен быть четко привязан к задачам. Кто отвечает за каждый пункт и когда он завершится?",
    visual: (
      <div className="flex flex-col gap-4 justify-center h-full w-full max-w-[280px] mx-auto">
        {[
          {
            color: "text-blue-600 bg-blue-100",
            bar: "bg-blue-500",
            width: "30%",
            delay: 0,
          },
          {
            color: "text-orange-600 bg-orange-100",
            bar: "bg-orange-500",
            width: "60%",
            delay: 0.2,
          },
          {
            color: "text-green-600 bg-green-100",
            bar: "bg-green-500",
            width: "100%",
            delay: 0.4,
          },
        ].map((bar, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded flex justify-center items-center text-[10px] font-bold ${bar.color}`}
            >
              {i + 1}
            </div>
            <div
              className={`h-3 flex-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200`}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: bar.width }}
                transition={{ duration: 1, delay: bar.delay }}
                className={`h-full rounded-full ${bar.bar}`}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 11,
    title: "11. Количественные итоги",
    imageUrl: "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-11.webp?raw=true",
    text: 'Что можно посчитать? Люди, потоки, изделия. Избегайте "дутых" цифр охватов в соцсетях.',
    visual: (
      <div className="grid grid-cols-2 gap-6 h-full items-center px-4">
        <motion.div
          whileHover={{ y: -5 }}
          className="text-center p-4 border border-blue-100 bg-white rounded-2xl shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 rounded-bl-full pointer-events-none"></div>
          <Users size={24} className="mx-auto text-blue-400 mb-2" />
          <div className="font-black text-blue-600 text-3xl">500+</div>
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">
            Участников
          </div>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          className="text-center p-4 border border-orange-100 bg-white rounded-2xl shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50/50 rounded-bl-full pointer-events-none"></div>
          <LayoutDashboard size={24} className="mx-auto text-orange-400 mb-2" />
          <div className="font-black text-orange-500 text-3xl">12</div>
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">
            Мероприятий
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    id: 12,
    title: "12. Качественные итоги",
    imageUrl: "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-12.webp?raw=true",
    text: "Что качественно изменится в жизни целевой аудитории? Как вы это докажете?",
    visual: (
      <div className="flex items-center justify-center h-full gap-4 w-full px-4">
        <div className="flex flex-col items-center">
          <span className="text-4xl grayscale opacity-50 mb-2">😐</span>
          <span className="text-[10px] font-bold text-gray-400">Было</span>
        </div>
        <div className="flex-1 border-t-2 border-dashed border-blue-300 relative">
          <motion.div
            animate={{ x: [0, 50, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 w-8 h-8 rounded-full bg-blue-100 border border-blue-400 flex justify-center items-center shadow-sm -ml-4 left-1/2"
          >
            <Lightbulb size={14} className="text-blue-600" />
          </motion.div>
        </div>
        <div className="flex flex-col items-center">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-4xl mb-2"
          >
            🤩
          </motion.span>
          <span className="text-[10px] font-bold text-green-600">Стало</span>
        </div>
      </div>
    ),
  },
  {
    id: 13,
    title: "13. Бюджет: ничего лишнего",
    imageUrl: "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-13.webp?raw=true",
    text: "Бюджет — это отражение календарного плана. Расходы должны вытекать из задач напрямую.",
    visual: (
      <div className="flex justify-center items-center h-full gap-4 md:gap-8 cursor-pointer">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="border shadow-sm border-blue-100 p-4 rounded-2xl bg-white flex flex-col items-center justify-center w-28 h-28 relative"
        >
          <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
            1
          </div>
          <Target size={32} className="text-blue-500 mb-2" />
          <span className="text-xs font-bold text-gray-800">Задача</span>
        </motion.div>
        <ArrowRight className="text-gray-300" size={32} />
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="border shadow-sm border-orange-100 p-4 rounded-2xl bg-white flex flex-col items-center justify-center w-28 h-28 relative"
        >
          <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-sm">
            ₽
          </div>
          <FileSpreadsheet size={32} className="text-orange-500 mb-2" />
          <span className="text-xs font-bold text-gray-800">Расход</span>
        </motion.div>
      </div>
    ),
  },
  {
    id: 14,
    title: "14. Развитие",
    imageUrl: "https://github.com/KRISLAWW435/Grant/blob/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-14.webp?raw=true",
    text: "Проект не должен умереть после окончания грантовых денег. Покажите устойчивую модель развития.",
    visual: (
      <div className="flex justify-center items-end h-full gap-3 px-4 pb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-t-lg flex flex-col justify-end items-center pb-2 text-[10px] font-bold text-gray-500">
          Старт
        </div>
        <div className="w-10 h-16 bg-blue-400 rounded-t-lg flex flex-col justify-end items-center pb-2 text-[10px] font-bold text-white shadow-md">
          Грант
        </div>
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: "5rem" }}
          transition={{ duration: 0.5 }}
          className="w-10 bg-green-500 rounded-t-lg flex flex-col justify-end items-center pb-2 text-[10px] font-bold text-white shadow-lg relative"
        >
          <TrendingUp size={16} className="absolute top-2 opacity-50" />
          Год 1
        </motion.div>
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: "6rem" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-10 bg-green-600 rounded-t-lg flex flex-col justify-end items-center pb-2 text-[10px] font-bold text-white shadow-lg relative"
        >
          <TrendingUp size={16} className="absolute top-2 opacity-50" />
          Год 2
        </motion.div>
      </div>
    ),
  },
];

export const GuideCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenIndex === null) return;
      if (e.key === "Escape") {
        setFullscreenIndex(null);
      } else if (e.key === "ArrowRight") {
        setFullscreenIndex((i) => (i! + 1) % slides.length);
      } else if (e.key === "ArrowLeft") {
        setFullscreenIndex((i) => (i! - 1 + slides.length) % slides.length);
      }
    };

    if (fullscreenIndex !== null) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullscreenIndex, slides.length]);

  const nextSlide = () =>
    setCurrentIndex((i) => Math.min(i + 1, slides.length - 1));
  const prevSlide = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  const handleDownloadSlide = async (index: number) => {
    const slide = slides[index];
    if (slide && slide.imageUrl) {
      try {
        const rawUrl = slide.imageUrl.replace(
          /github\.com\/([^\/]+)\/([^\/]+)\/blob\//,
          "raw.githubusercontent.com/$1/$2/"
        ).replace("?raw=true", "");

        const response = await fetch(rawUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `guide-slide-${index + 1}.webp`;
        link.href = url;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Error downloading slide", e);
        alert("Не удалось загрузить слайд.");
      }
      return;
    }

    // Fallback to html-to-image
    const el = document.getElementById(`slide-${index}`);
    if (!el) return;
    try {
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `guide-slide-${index + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Error downloading slide", e);
      alert("Не удалось загрузить слайд.");
    }
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1920, 1080],
      });

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        if (slide.imageUrl) {
          if (i > 0) doc.addPage([1920, 1080], "landscape");

          try {
            const rawUrl = slide.imageUrl.replace(
              /github\.com\/([^\/]+)\/([^\/]+)\/blob\//,
              "raw.githubusercontent.com/$1/$2/"
            ).replace("?raw=true", "");

            const response = await fetch(rawUrl);
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            
            const base64Url = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });

            const img = new window.Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = base64Url;
            });

            const canvas = document.createElement("canvas");
            canvas.width = 1920;
            canvas.height = 1080;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, 1920, 1080);
              
              const scale = Math.max(1920 / img.width, 1080 / img.height);
              const w = img.width * scale;
              const h = img.height * scale;
              const x = (1920 - w) / 2;
              const y = (1080 - h) / 2;
              
              ctx.drawImage(img, x, y, w, h);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
              doc.addImage(dataUrl, "JPEG", 0, 0, 1920, 1080);
            }
          } catch (e) {
            console.error(`Error loading slide ${i}`, e);
            throw new Error(`Ошибка загрузки слайда ${i + 1}`);
          }
        }
      }

      doc.save("grant-guide.pdf");
    } catch (e) {
      console.error("Error creating PDF", e);
      alert("Не удалось создать PDF-файл. Пожалуйста, попробуйте позже.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-[#F8F9FA] guide-print-section relative overflow-hidden">
      <div className="w-full">
        <div className="text-center mb-10 md:mb-16 hide-on-print px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-950 mb-4 tracking-tight">
            Гайд для начинающих: как собрать победную заявку
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            14 слайдов — от локальной проблемы до финансирования. Без воды и
            канцелярита.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className={`inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-800 rounded-full font-bold shadow-sm transition-all text-sm ${isExporting ? "opacity-75 cursor-not-allowed" : "hover:bg-gray-50"}`}
          >
            {isExporting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            {isExporting ? "Экспорт в PDF..." : "Быстро скачать весь гайд (PDF)"}
          </motion.button>
        </div>

        {/* Carousel / Swipeable area */}
        <div className="relative group w-full flex justify-center items-center hide-on-print px-4 md:px-12 py-8 min-h-[300px]">
          {/* Invisible spacer for responsive height */}
          <div className="w-[90%] md:w-[75%] max-w-[900px] opacity-0 pointer-events-none flex flex-col">
            <div style={{ aspectRatio: "16/9" }} className="w-full"></div>
            <div className="mt-4 h-10"></div>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute -bottom-2 md:bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-4">
            <motion.button
              whileHover={{ scale: currentIndex > 0 ? 1.1 : 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`w-10 h-10 md:w-12 md:h-12 bg-white shadow-lg border border-gray-100 rounded-full flex items-center justify-center transition-colors ${currentIndex === 0 ? "text-gray-300 cursor-not-allowed opacity-50" : "text-blue-600 hover:bg-blue-50"}`}
            >
              <ChevronLeft size={24} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: currentIndex < slides.length - 1 ? 1.1 : 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextSlide}
              disabled={currentIndex === slides.length - 1}
              className={`w-10 h-10 md:w-12 md:h-12 bg-white shadow-lg border border-gray-100 rounded-full flex items-center justify-center transition-colors ${currentIndex === slides.length - 1 ? "text-gray-300 cursor-not-allowed opacity-50" : "text-blue-600 hover:bg-blue-50"}`}
            >
              <ChevronRight size={24} />
            </motion.button>
          </div>

          {slides.map((slide, i) => {
            const offset = i - currentIndex;
            if (Math.abs(offset) > 2) return null; // optimize rendering

            return (
              <motion.div
                key={slide.id}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset: dragOffset, velocity }) => {
                  if (dragOffset.x < -50 || velocity.x < -500) {
                    nextSlide();
                  } else if (dragOffset.x > 50 || velocity.x > 500) {
                    prevSlide();
                  }
                }}
                className="absolute w-[90%] md:w-[75%] max-w-[900px] flex flex-col touch-pan-y"
                initial={false}
                animate={{
                  x: `${offset * 105}%`,
                  scale: offset === 0 ? 1 : 0.85,
                  opacity: offset === 0 ? 1 : 0.25,
                  zIndex: offset === 0 ? 10 : 0,
                  pointerEvents: offset === 0 ? "auto" : "none",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* The Slide Card Itself */}
                <div
                  id={`slide-${i}`}
                  onClick={() => setFullscreenIndex(i)}
                  className="bg-white rounded-3xl md:rounded-[40px] shadow-lg border border-gray-100 overflow-hidden relative cursor-pointer w-full group/slide"
                  style={{ aspectRatio: "16/9" }}
                >
                  {/* Fullscreen button */}
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 pointer-events-auto transition-opacity opacity-80 hover:opacity-100">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setFullscreenIndex(i);
                      }}
                      className="p-2 md:p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10"
                    >
                      <ZoomIn size={20} />
                    </motion.button>
                  </div>

                  {slide.imageUrl ? (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover pointer-events-none"
                      draggable={false}
                    />
                  ) : (
                    <>
                      {/* Background Elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50/50 to-transparent rounded-bl-full pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-50/50 to-transparent rounded-tr-full pointer-events-none"></div>

                      <div className="absolute inset-0 p-6 sm:p-8 md:p-12 flex flex-col h-full pointer-events-none">
                        {/* Header */}
                        <div className="flex items-start justify-between z-10 mb-2 md:mb-6">
                          <h3 className="text-lg sm:text-2xl md:text-3xl xl:text-4xl font-extrabold text-[#1a1b1e] tracking-tight leading-tight">
                            {slide.title}
                          </h3>
                          <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-100 italic select-none">
                            {i + 1 > 9 ? i + 1 : `0${i + 1}`}
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="text-xs sm:text-sm md:text-lg text-gray-600 max-w-[85%] z-10 font-medium leading-relaxed">
                          {slide.text}
                        </div>

                        {/* Visual Area */}
                        <div className="flex-1 w-full bg-slate-50/50 rounded-xl md:rounded-2xl mt-4 border border-slate-100 overflow-hidden z-10 p-2 md:p-4">
                          {slide.visual}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 px-2">
                  <p className="text-xs font-bold text-gray-400 select-none">
                    Слайд {i + 1} из {slides.length}
                  </p>
                  <button
                    onClick={() => handleDownloadSlide(i)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white border border-blue-100 shadow-sm px-4 py-2 rounded-full transition-colors active:scale-95 z-20 pointer-events-auto"
                  >
                    <Download size={14} /> Скачать слайд
                  </button>
                </div>
              </motion.div>
            );
          })}

          <style>{`
            .hide-scrollbars::-webkit-scrollbar { display: none; }
            .hide-scrollbars { -ms-overflow-style: none; scrollbar-width: none; }
            
            @media print {
               body * { visibility: hidden; }
               .guide-print-section, .guide-print-section * { visibility: visible; }
               .guide-print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white;}
               .hide-on-print { display: none !important; }
               
               /* Break pages for each slide */
               .print-only-container { display: block !important; margin: 0; padding: 0; }
               .print-slide { 
                  width: 100%; 
                  max-width: 100%;
                  height: auto; 
                  aspect-ratio: 16/9; 
                  page-break-after: always; 
                  page-break-inside: avoid;
                  margin: 0;
                  border: none;
                  box-shadow: none;
               }
            }
          `}</style>

          {/* Print only blocks */}
          <div className="hidden print-only-container">
            {slides.map((slide, i) => (
              <div
                key={`print-${slide.id}`}
                className="print-slide flex flex-col bg-white relative p-12 border border-gray-100"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50/50 to-transparent rounded-bl-full pointer-events-none"></div>
                <div className="flex items-start justify-between z-10 mb-8">
                  <h3 className="text-4xl font-extrabold text-[#1a1b1e] tracking-tight leading-none">
                    {slide.title}
                  </h3>
                  <div className="text-6xl font-black text-gray-100 italic select-none">
                    {i + 1 > 9 ? i + 1 : `0${i + 1}`}
                  </div>
                </div>
                <div className="text-2xl text-gray-600 max-w-[80%] z-10 font-medium leading-relaxed">
                  {slide.text}
                </div>
                <div className="flex-1 w-full bg-slate-50/50 rounded-2xl mt-8 border border-slate-100 overflow-hidden z-10 p-8">
                  {slide.visual}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {fullscreenIndex !== null &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[99999] bg-black/40 flex flex-col justify-center items-center p-4 md:p-8 backdrop-blur-sm"
            onClick={() => setFullscreenIndex(null)}
          >
            <button
              className="absolute top-4 right-4 md:top-6 md:right-6 bg-black/60 border border-white/30 text-white hover:bg-black hover:text-white z-50 p-2 md:p-3 rounded-full transition-colors cursor-pointer shadow-2xl backdrop-blur-md"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenIndex(null);
              }}
              title="Закрыть (Esc)"
            >
              <X size={24} strokeWidth={2.5} />
            </button>

            <motion.div
              className="relative w-full h-[85vh] max-w-[1400px] flex items-center justify-center pointer-events-auto touch-pan-y"
              onClick={(e) => e.stopPropagation()}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.x < -50 || velocity.x < -500) {
                  setFullscreenIndex((i) => (i! + 1) % slides.length);
                } else if (offset.x > 50 || velocity.x > 500) {
                  setFullscreenIndex(
                    (i) => (i! - 1 + slides.length) % slides.length,
                  );
                }
              }}
            >
              {slides[fullscreenIndex].imageUrl ? (
                <img
                  src={slides[fullscreenIndex].imageUrl}
                  className="max-w-full max-h-full object-contain rounded-lg lg:rounded-2xl select-none pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full max-h-full aspect-video bg-white rounded-lg lg:rounded-2xl overflow-hidden relative shadow-2xl flex flex-col select-none pointer-events-none">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50/50 to-transparent rounded-bl-full pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-50/50 to-transparent rounded-tr-full pointer-events-none"></div>

                  <div className="absolute inset-0 p-6 sm:p-8 md:p-12 flex flex-col h-full pointer-events-none">
                    <div className="flex items-start justify-between z-10 mb-2 md:mb-6">
                      <h3 className="text-lg sm:text-2xl md:text-3xl xl:text-4xl font-extrabold text-[#1a1b1e] tracking-tight leading-tight">
                        {slides[fullscreenIndex].title}
                      </h3>
                      <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-100 italic select-none">
                        {fullscreenIndex + 1 > 9
                          ? fullscreenIndex + 1
                          : `0${fullscreenIndex + 1}`}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm md:text-lg text-gray-600 max-w-[85%] z-10 font-medium leading-relaxed">
                      {slides[fullscreenIndex].text}
                    </div>
                    <div className="flex-1 w-full bg-slate-50/50 rounded-xl md:rounded-2xl mt-4 border border-slate-100 overflow-hidden z-10 p-2 md:p-4">
                      {slides[fullscreenIndex].visual}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            <div
              className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 text-white w-full justify-center px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() =>
                  setFullscreenIndex(
                    (i) => (i! - 1 + slides.length) % slides.length,
                  )
                }
                className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md bg-black/40 border border-white/10"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-bold text-xs md:text-sm tracking-widest opacity-80 select-none bg-black/40 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-white/10">
                {fullscreenIndex + 1} / {slides.length}
              </span>
              <button
                onClick={() =>
                  setFullscreenIndex((i) => (i! + 1) % slides.length)
                }
                className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md bg-black/40 border border-white/10"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
};
