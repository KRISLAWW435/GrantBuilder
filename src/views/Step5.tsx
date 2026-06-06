import React, { useState, useEffect } from 'react';
import { StepLayout } from '../components/StepLayout.tsx';
import { useAppContext } from '../store.tsx';
import { projectDataConfig } from '../config/projectData.ts';
import { calculateProjectScores } from '../utils/scoreCalculator.ts';
import { DatePickerCalendar } from '../components/DatePickerCalendar.tsx';
import { 
  Check, 
  Pencil, 
  Calendar, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Info 
} from 'lucide-react';

const FIELD_TOOLTIPS: Record<string, { title: string; text: string; examples: string[] }> = {
  timing: {
    title: 'Сроки этапа',
    text: 'Независимый эксперт фонда обязательно проверяет, укладывается ли этап в общие рамки грантового сезона, а также не планируете ли вы активные мероприятия в "мертвый сезон" (например, на школьные каникулы, если целевая группа — подростки).',
    examples: [
      'Подготовительный: Март – Апрель 2026',
      'Основной: Май – Август 2026',
      'Итоговый: Сентябрь 2026'
    ]
  },
  actions: {
    title: 'Ключевые действия',
    text: 'Что конкретно вы будете делать на этом этапе? Перечислите ключевые мероприятия. Начинайте каждое предложение с глаголов действия в неопределённой форме (разработать, заключить, подготовить, запустить, провести).',
    examples: [
      'Для подготовительного этапа: «Разработка программы тренингов, поиск и аренда зала, закупка оборудования (проектор, флипчарты), запуск информационной кампании в школах».',
      'Для основного этапа: «Проведение 8 субботних мастер-классов (по 2 в месяц) для групп по 15 человек. Каждое занятие включает теорию и практику публичных выступлений».',
      'Для итогового этапа: «Организация конкурса ораторов, подготовка дипломов, сбор обратной связи, написание отчёта».'
    ]
  },
  kpi: {
    title: 'Измеримый результат этапа (KPI)',
    text: 'Опишите сухие, понятные метрики. Избегайте общих красивых слов (например, "повысится престиж") и укажите точные измеримые показатели: сколько людей обучено, сколько встреч проведено, какой охват получен.',
    examples: [
      'Для подготовительного этапа: «Заключён договор аренды, закуплено оборудование, подано 80 заявок от участников».',
      'Для основного этапа: «Проведено 8 мастер-классов, обучено 60 подростков, каждый посетил не менее 6 занятий».',
      'Для итогового этапа: «Проведён 1 конкурс, вручено 60 дипломов, 85% участников отметили улучшение навыков».'
    ]
  },
  artifact: {
    title: 'Подтверждающие материалы (бывшие артефакты)',
    text: 'Это физические доказательства (документы, файлы, ссылки, медиа), которыми вы подтвердите грантодателю реальный факт выполнения работ на этапе. Вы не обязаны пригружать их сейчас, но это залог успешной проверки отчёта.',
    examples: [
      'Принимаются любые типы: PDF-файлы, ссылки на облачные хранилища Яндекс.Диск / Google Drive, скриншоты, фотографии, видеозаписи, текстовые документы, таблицы.',
      'Для подготовительного этапа: «Договор с площадкой, фото закупленного оборудования, скриншоты регистрационной формы со списком заявок».',
      'Для основного этапа: «Расписание занятий, фотографии с каждого мастер-класса, видеозаписи лучших выступлений, журнал посещаемости».',
      'Для итогового этапа: «Анкеты обратной связи (сводный график), фото с конкурса, скан итогового отчёта, электронные версии дипломов».'
    ]
  }
};

const CHECKLIST_ITEMS = [
  'В плане указаны конкретные действия, а не общие фразы.',
  'Каждый этап содержит измеримые результаты (цифры, проценты, количество).',
  'Для каждого этапа определено, какие подтверждающие материалы я соберу для отчёта.'
];

export const Step5: React.FC = () => {
  const { data, setData } = useAppContext();
  
  // Dynamic variables for Sphere-based Formats
  const sphereId = data.projectSphereId || 'universal';
  const configSphere = projectDataConfig[sphereId as keyof typeof projectDataConfig] || projectDataConfig.universal;
  const formatsList = configSphere.formats || [];

  // Filter out any stale formats from previous sphere selections to prevent selection deadlocks and lock-ups
  const currentFormatsArr = (data.projectFormats || []).filter(fId => 
    fId === 'other' || formatsList.some(f => f.id === fId)
  );
  const checklist = data.step5Checklist || [false, false, false];
  const stages = data.step5Stages || [
    { title: 'Подготовительный', start: '', end: '', actions: '', kpi: '', artifact: '' },
    { title: 'Основной', start: '', end: '', actions: '', kpi: '', artifact: '' },
    { title: 'Итоговый', start: '', end: '', actions: '', kpi: '', artifact: '' }
  ];

  // Tooltips state
  const [activeTooltip, setActiveTooltip] = useState<{ stageIdx: number; field: string } | null>(null);

  // Warning for choosing > 2 formats
  const [showFormatWarning, setShowFormatWarning] = useState(false);

  // States to track which stage cards are expanded (useful for mobile and tablet)
  const [expandedStages, setExpandedStages] = useState<boolean[]>([true, true, true]);

  // Stage Title Editing state
  const [editingTitleIdx, setEditingTitleIdx] = useState<number | null>(null);
  const [tempTitle, setTempTitle] = useState<string>('');

  // Dynamic parsing helper for chronologically comparing dates (supports both DD.MM.YYYY and old "Month YYYY" formats)
  const parseToDate = (str: string): Date | null => {
    if (!str) return null;
    
    // Try DD.MM.YYYY
    const matchDotted = str.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (matchDotted) {
      const day = parseInt(matchDotted[1], 10);
      const month = parseInt(matchDotted[2], 10) - 1;
      const year = parseInt(matchDotted[3], 10);
      return new Date(year, month, day);
    }

    // Try legacy format e.g. "Март 2026"
    const parts = str.split(' ');
    if (parts.length === 2) {
      const russianMonths = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ];
      const mIdx = russianMonths.indexOf(parts[0]);
      const year = parseInt(parts[1], 10);
      if (mIdx !== -1 && !isNaN(year)) {
        return new Date(year, mIdx, 1);
      }
    }

    return null;
  };

  // Сроки chronologically logical verification
  const areDatesLogical = (): boolean => {
    const p = stages[0];
    const m = stages[1];
    const f = stages[2];
    
    if (!p?.start || !p?.end || !m?.start || !m?.end || !f?.start || !f?.end) {
      return false;
    }
    
    const dPStart = parseToDate(p.start);
    const dPEnd = parseToDate(p.end);
    const dMStart = parseToDate(m.start);
    const dMEnd = parseToDate(m.end);
    const dFStart = parseToDate(f.start);
    const dFEnd = parseToDate(f.end);
    
    if (!dPStart || !dPEnd || !dMStart || !dMEnd || !dFStart || !dFEnd) {
      return false;
    }
    
    // Check chronologically correct flow:
    // PStart <= PEnd AND PEnd <= MStart AND MStart <= MEnd AND MEnd <= FStart AND FStart <= FEnd
    return dPStart.getTime() <= dPEnd.getTime() && 
           dPEnd.getTime() <= dMStart.getTime() && 
           dMStart.getTime() <= dMEnd.getTime() && 
           dMEnd.getTime() <= dFStart.getTime() && 
           dFStart.getTime() <= dFEnd.getTime();
  };

  const datesLogical = areDatesLogical();

  // Validations for canProceed button
  const hasFormat = currentFormatsArr.length > 0;
  const isCustomFormatFilled = !currentFormatsArr.includes('other') || (data.customProjectFormat || '').trim().length > 0;
  
  const stagesNotEmpty = stages.every(s => 
    (s.actions || '').trim().length > 0 && 
    (s.kpi || '').trim().length > 0 && 
    (s.artifact || '').trim().length > 0 &&
    s.start.length > 0 &&
    s.end.length > 0
  );
  
  const allChecked = checklist.every(Boolean);

  const canProceed = hasFormat && isCustomFormatFilled && stagesNotEmpty && allChecked && datesLogical;

  // Real-time points scoring
  const { step5: localScore } = calculateProjectScores(data);

  // Timing helper
  const formatTiming = (start: string, end: string) => {
    if (!start && !end) return '___';
    if (!start) return `до ${end}`;
    if (!end) return `с ${start}`;
    if (start === end) return start;
    
    const startParts = start.split(' ');
    const endParts = end.split(' ');
    if (startParts.length === 2 && endParts.length === 2 && startParts[1] === endParts[1]) {
      return `${startParts[0]} – ${endParts[0]} ${endParts[1]}`;
    }
    return `${start} – ${end}`;
  };

  // Structured summary builder
  const textSummary = (() => {
    if (stages.length < 3) return '';
    const p = stages[0];
    const m = stages[1];
    const f = stages[2];
    
    const formatStageText = (s: typeof p, num: number) => {
      const timingText = formatTiming(s.start, s.end);
      const actionsText = s.actions?.trim() || '___';
      const kpiText = s.kpi?.trim() || '___';
      const artifactText = s.artifact?.trim() || '___';
      return `${num}. ${s.title} этап (${timingText})\nДействия: ${actionsText}\nРезультат: ${kpiText}\nПодтверждающие материалы: ${artifactText}`;
    };

    return `Календарный план проекта\n\n` + 
           `${formatStageText(p, 1)}\n\n` + 
           `${formatStageText(m, 2)}\n\n` + 
           `${formatStageText(f, 3)}`;
  })();

  // Synchronize derived state (projectFormat, calendarPlan) on mount and unmount to prevent render lag
  useEffect(() => {
    const syncDerivedState = () => {
      setData(prev => {
        const sphereId = prev.projectSphereId || 'universal';
        const configSphere = projectDataConfig[sphereId as keyof typeof projectDataConfig] || projectDataConfig.universal;
        const formatsList = configSphere.formats || [];
        const availableFormatsMap = new Map<string, string>(formatsList.map(f => [f.id, f.name]));

        const currentSelected = (prev.projectFormats || []).filter(fId => 
          fId === 'other' || formatsList.some(f => f.id === fId)
        );
        const activeFormatsMapped = currentSelected.map(fId => {
          if (fId === 'other') {
            return (prev.customProjectFormat || '').trim() || 'другие проекты';
          }
          return availableFormatsMap.get(fId) || fId;
        });
        const formattedStr = activeFormatsMapped.join(', ');

        const currentStages = prev.step5Stages || [];
        const mappedCalendarPlan = currentStages.map((s, index) => ({
          id: String(index + 1),
          stage: s.title,
          timing: formatTiming(s.start, s.end),
          actions: `${s.actions || ''}. KPI: ${s.kpi || ''}. Материалы: ${s.artifact || ''}`
        }));

        if (
          prev.projectFormat !== formattedStr ||
          JSON.stringify(prev.calendarPlan) !== JSON.stringify(mappedCalendarPlan) ||
          JSON.stringify(prev.projectFormats) !== JSON.stringify(currentSelected)
        ) {
          return {
            ...prev,
            projectFormats: currentSelected,
            projectFormat: formattedStr,
            calendarPlan: mappedCalendarPlan
          };
        }
        return prev;
      });
    };

    // Run on mount
    syncDerivedState();

    // Run on unmount to save fresh state without keypress delay
    return () => {
      syncDerivedState();
    };
  }, []);

  const handleFormatToggle = (formatId: string) => {
    setData(prev => {
      const current = (prev.projectFormats || []).filter(fId => 
        fId === 'other' || formatsList.some(f => f.id === fId)
      );
      const isSelected = current.includes(formatId);
      if (isSelected) {
        setShowFormatWarning(false);
        const nextFormats = current.filter(f => f !== formatId);
        
        // Build interactive string preview dynamically in real-time
        const availableFormatsMap = new Map<string, string>(formatsList.map(f => [f.id, f.name]));
        const activeFormatsMapped = nextFormats.map(fId => {
          if (fId === 'other') {
            return (prev.customProjectFormat || '').trim() || 'другие проекты';
          }
          return availableFormatsMap.get(fId) || fId;
        });
        const nextFormatStr = activeFormatsMapped.join(', ');

        return {
          ...prev,
          projectFormats: nextFormats,
          projectFormat: nextFormatStr,
          customProjectFormat: formatId === 'other' ? '' : (prev.customProjectFormat || '')
        };
      } else {
        if (current.length >= 2) {
          setShowFormatWarning(true);
          return prev;
        } else {
          setShowFormatWarning(false);
          const nextFormats = [...current, formatId];

          // Build interactive string preview dynamically in real-time
          const availableFormatsMap = new Map<string, string>(formatsList.map(f => [f.id, f.name]));
          const activeFormatsMapped = nextFormats.map(fId => {
            if (fId === 'other') {
              return (prev.customProjectFormat || '').trim() || 'другие проекты';
            }
            return availableFormatsMap.get(fId) || fId;
          });
          const nextFormatStr = activeFormatsMapped.join(', ');

          return {
            ...prev,
            projectFormats: nextFormats,
            projectFormat: nextFormatStr
          };
        }
      }
    });
  };

  useEffect(() => {
    if (showFormatWarning) {
      const timer = setTimeout(() => setShowFormatWarning(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showFormatWarning]);

  const handleCheck = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index] = !newChecklist[index];
    setData(prev => ({ ...prev, step5Checklist: newChecklist }));
  };

  const updateStageField = (stageIndex: number, field: string, value: string) => {
    const newStages = stages.map((stage, i) => {
      if (i === stageIndex) {
        return { ...stage, [field]: value };
      }
      return stage;
    });
    setData(prev => ({ ...prev, step5Stages: newStages }));
  };

  const handleChevronToggle = (idx: number) => {
    setExpandedStages(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const saveTitle = (idx: number) => {
    if (tempTitle.trim().length > 0) {
      const updatedStages = stages.map((s, i) => i === idx ? { ...s, title: tempTitle.trim() } : s);
      setData(prev => ({ ...prev, step5Stages: updatedStages }));
    }
    setEditingTitleIdx(null);
  };

  const toggleTooltip = (stageIdx: number, field: string) => {
    setActiveTooltip(prev => 
      prev && prev.stageIdx === stageIdx && prev.field === field ? null : { stageIdx, field }
    );
  };

  const mentorAdvice = `Уважаемый заявитель, Ваш план — это доказательство того, что проект полностью управляем. Независимый эксперт хочет увидеть понятную логику: подготовительный этап должен быть достаточным для старта, основной — содержать все обещанные активности, а итоговый — подводить измеримые итоги.\n\nКаждый этап должен содержать измеримый результат с конкретными цифрами (KPI). Уделите особое внимание подтверждающим материалам — это реальные документы и фото результатов, которые фонд затребует при сдаче отчётов.`;

  return (
    <StepLayout
      title="Как именно мы будем решать проблему?"
      subtitle="Формат мероприятий и детальный календарный план"
      mentorContent={mentorAdvice}
      canProceed={canProceed}
      progressScore={localScore}
      progressMax={20}
    >
      <div className="space-y-10 max-w-[800px] mx-auto">
        
        {/* Block 1: Format Selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="label-sleek block text-lg font-medium">1. Формат мероприятий <span className="text-red-500">*</span></label>
            <span className="text-xs text-gray-500 bg-gray-100 font-medium py-1 px-2.5 rounded-full">выбрано {currentFormatsArr.length} из 2</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">Выберите форматы, которые вы будете использовать в вашем проекте (не более двух).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formatsList.map((fmt) => {
              const isChecked = currentFormatsArr.includes(fmt.id);
              const isDisabled = !isChecked && currentFormatsArr.length >= 2;

              return (
                <div 
                  key={fmt.id}
                  onClick={() => !isDisabled && handleFormatToggle(fmt.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    isDisabled ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100' : 'cursor-pointer select-none'
                  } ${
                    isChecked 
                      ? 'border-cyan-500 bg-cyan-50/50 text-cyan-900 font-semibold shadow-sm' 
                      : !isDisabled && 'border-gray-200 bg-white hover:border-cyan-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`mt-0.5 min-w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                    isChecked ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-sm leading-snug">{fmt.name}</span>
                </div>
              );
            })}

            {/* Other format option */}
            {(() => {
              const isChecked = currentFormatsArr.includes('other');
              const isDisabled = !isChecked && currentFormatsArr.length >= 2;
              return (
                <div 
                  onClick={() => !isDisabled && handleFormatToggle('other')}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    isDisabled ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100' : 'cursor-pointer select-none'
                  } ${
                    isChecked 
                      ? 'border-cyan-500 bg-cyan-50/50 text-cyan-900 font-semibold shadow-sm' 
                      : !isDisabled && 'border-gray-200 bg-white hover:border-cyan-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`mt-0.5 min-w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                    isChecked ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-sm leading-snug">Другой формат мероприятия</span>
                </div>
              );
            })()}
          </div>

          {showFormatWarning && (
            <div className="mt-3 text-xs text-rose-600 font-medium flex items-center gap-1.5 animate-bounce">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Можно выбрать не более двух форматов мероприятий</span>
            </div>
          )}

          {currentFormatsArr.includes('other') && (
            <div className="mt-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Напишите ваш уникальный формат <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={data.customProjectFormat || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setData(prev => {
                    const availableFormatsMap = new Map<string, string>(formatsList.map(f => [f.id, f.name]));
                    const currentSelected = (prev.projectFormats || []).filter(fId => 
                      fId === 'other' || formatsList.some(f => f.id === fId)
                    );
                    const activeFormatsMapped = currentSelected.map(fId => {
                      if (fId === 'other') {
                        return val.trim() || 'другие проекты';
                      }
                      return availableFormatsMap.get(fId) || fId;
                    });
                    const formattedStr = activeFormatsMapped.join(', ');
                    return {
                      ...prev,
                      customProjectFormat: val,
                      projectFormat: formattedStr
                    };
                  });
                }}
                placeholder="Например: Иммерсивный экологический автопробег"
                className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm bg-white"
              />
            </div>
          )}
        </div>

        {/* Block 2: Calendar Stages Constructor */}
        <div className="pt-8 border-t border-gray-100">
          <label className="label-sleek block text-lg font-medium mb-1">2. Календарный план (конструктор этапов) <span className="text-red-500">*</span></label>
          <p className="text-xs text-gray-500 mb-6 font-normal">Обязательно заполните все три этапа. Каждый этап — это карточка с полями ниже.</p>

          <div className="space-y-6">
            {stages.map((stage, idx) => {
              const isActionsFilled = (stage.actions || '').trim().length > 0;
              const isKpiFilled = (stage.kpi || '').trim().length > 0;
              const isArtifactFilled = (stage.artifact || '').trim().length > 0;
              const areTimesSelected = (stage.start || '').length > 0 && (stage.end || '').length > 0;
              const isStageComplete = isActionsFilled && isKpiFilled && isArtifactFilled && areTimesSelected;

              return (
                <div 
                  key={idx}
                  className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-5 hover:border-cyan-300 transition-all duration-200"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="flex items-center justify-center w-7 h-7 bg-cyan-50 text-cyan-700 font-bold rounded-lg text-sm shrink-0">
                        {idx + 1}
                      </span>
                      
                      {editingTitleIdx === idx ? (
                        <div className="flex items-center gap-2 w-full max-w-sm">
                          <input
                            type="text"
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTitle(idx);
                              if (e.key === 'Escape') setEditingTitleIdx(null);
                            }}
                            className="w-full sleek-input p-1 px-3.5 text-sm bg-white border border-gray-300 rounded focus:ring-cyan-500"
                            autoFocus
                          />
                          <button 
                            onClick={() => saveTitle(idx)}
                            className="p-1 px-2 text-green-600 hover:bg-green-50 rounded shrink-0 border border-green-200"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingTitleIdx(null)}
                            className="p-1 px-2 text-gray-400 hover:bg-gray-100 rounded shrink-0 border border-gray-200"
                          >
                            <span className="text-sm">✕</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="text-base font-semibold text-gray-900 truncate">{stage.title} этап</h4>
                          <button
                            onClick={() => {
                              setEditingTitleIdx(idx);
                              setTempTitle(stage.title);
                            }}
                            className="p-1 text-gray-400 hover:text-cyan-600 rounded shrink-0 transition"
                            title="Редактировать название"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {isStageComplete ? (
                        <span className="text-[10px] md:text-xs text-green-600 bg-green-50 font-semibold py-1 px-2.5 rounded-full border border-green-100">
                          ✓ Заполнено
                        </span>
                      ) : (
                        <span className="text-[10px] md:text-xs text-amber-600 bg-amber-50 font-semibold py-1 px-2.5 rounded-full border border-amber-100">
                          Не заполнено
                        </span>
                      )}

                      <button 
                        onClick={() => handleChevronToggle(idx)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        {expandedStages[idx] ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  {expandedStages[idx] && (
                    <div className="space-y-5 animate-in fade-in duration-150">
                      
                      {/* Sроки этапа block */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold text-gray-700 flex items-center gap-1 bg-gray-50/50 py-1 px-2 rounded">
                            <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                            <span>СРОКИ ЭТАПА <span className="text-red-500">*</span></span>
                          </label>
                          <button 
                            onClick={() => toggleTooltip(idx, 'timing')}
                            className="text-gray-400 hover:text-cyan-600 p-0.5 transition"
                            title="Инструкция по заполнению"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Tooltip inline container for Timing */}
                        {activeTooltip?.stageIdx === idx && activeTooltip?.field === 'timing' && (
                          <div className="mb-3.5 p-4.5 bg-cyan-50/70 border border-cyan-100 rounded-xl text-xs text-cyan-900/90 leading-relaxed shadow-inner">
                            <div className="font-bold mb-1.5 flex items-center gap-1.5 text-cyan-950">
                              <Info className="w-4 h-4 text-cyan-600" />
                              <span>{FIELD_TOOLTIPS.timing.title}</span>
                            </div>
                            <p className="mb-2">{FIELD_TOOLTIPS.timing.text}</p>
                            <div className="bg-white/80 p-2.5 rounded-lg border border-cyan-100/50">
                              <span className="font-bold block text-cyan-950 mb-1">Рекомендуемые сроки:</span>
                              <ul className="list-disc list-inside space-y-1">
                                {FIELD_TOOLTIPS.timing.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                              </ul>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Дата начала этапа:</span>
                            <DatePickerCalendar
                              value={stage.start || ''}
                              onChange={(val) => updateStageField(idx, 'start', val)}
                              placeholder="Выберите дату начала"
                            />
                          </div>

                          <div>
                            <span className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Дата окончания этапа:</span>
                            <DatePickerCalendar
                              value={stage.end || ''}
                              onChange={(val) => updateStageField(idx, 'end', val)}
                              placeholder="Выберите дату окончания"
                            />
                          </div>
                        </div>
                        {idx === 0 && (() => {
                          const dStart = parseToDate(stage.start);
                          const dEnd = parseToDate(stage.end);
                          if (dStart && dEnd) {
                            const diffTime = dEnd.getTime() - dStart.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays >= 0 && diffDays < 14) {
                              return (
                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                  <p className="text-xs text-amber-800">
                                    <span className="font-semibold block mb-0.5">Подготовительный этап слишком короткий.</span> 
                                    Для аренды, закупок и набора участников рекомендуется не менее 14 дней.
                                  </p>
                                </div>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>

                      {/* Ключевые действия block */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                            Ключевые действия (мероприятия) <span className="text-red-500">*</span>
                          </label>
                          <button 
                            onClick={() => toggleTooltip(idx, 'actions')}
                            className="text-gray-400 hover:text-cyan-600 p-0.5 transition"
                            title="Инструкция по заполнению"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Tooltip inline container for Actions */}
                        {activeTooltip?.stageIdx === idx && activeTooltip?.field === 'actions' && (
                          <div className="mb-3 p-4.5 bg-cyan-50/70 border border-cyan-100 rounded-xl text-xs text-cyan-900/90 leading-relaxed shadow-inner animate-in slide-in-from-top-2">
                            <div className="font-bold mb-1.5 flex items-center gap-1.5 text-cyan-950">
                              <Info className="w-4 h-4 text-cyan-600" />
                              <span>{FIELD_TOOLTIPS.actions.title}</span>
                            </div>
                            <p className="mb-2">{FIELD_TOOLTIPS.actions.text}</p>
                            <div className="bg-white/80 p-2.5 rounded-lg border border-cyan-100/50">
                              <span className="font-bold block text-cyan-950 mb-1">Пример заполнения в вашем шаге:</span>
                              <p className="italic text-gray-600">{FIELD_TOOLTIPS.actions.examples[idx]}</p>
                            </div>
                          </div>
                        )}

                        {idx === 1 && data.projectFormat && (
                          <div className="mb-3 p-4 bg-indigo-50/50 border border-indigo-100/60 rounded-xl text-xs text-indigo-900 leading-relaxed shadow-sm animate-in fade-in slide-in-from-top-2">
                            <p className="font-semibold mb-2">Вы выбрали формат: <span className="font-bold text-indigo-700">{data.projectFormat}</span>. Убедитесь, что ваш план раскрывает его:</p>
                            <ul className="list-none space-y-1.5 text-indigo-800">
                              <li><strong className="font-semibold text-indigo-950">Подготовка:</strong> Что нужно сделать до начала (материалы, площадка, оборудование, набор участников)?</li>
                              <li><strong className="font-semibold text-indigo-950">Проведение:</strong> Как именно будут проходить мероприятия (серии встреч, интенсив, выставка, курс)?</li>
                              <li><strong className="font-semibold text-indigo-950">Результат:</strong> Как вы зафиксируете успех (фото, работы, анкеты, дипломы)?</li>
                            </ul>
                          </div>
                        )}

                        <textarea
                          maxLength={400}
                          rows={3}
                          value={stage.actions || ''}
                          onChange={(e) => updateStageField(idx, 'actions', e.target.value)}
                          placeholder={
                            idx === 0 
                              ? 'Пример: Разработка программы тренингов, поиск и аренда зала, закупка оборудования (проектор, флипчарты), запуск информационной кампании...'
                              : idx === 1 
                              ? 'Пример: Проведение 8 субботних мастер-классов (по 2 в месяц) для групп по 15 человек. Отработка ораторских навыков...'
                              : 'Пример: Организация конкурса ораторов, подготовка дипломов, сбор обратной связи, написание итогового отчета...'
                          }
                          className="w-full sleek-input rounded-xl p-3 text-xs md:text-sm focus:ring-cyan-500 focus:border-cyan-500 block border border-gray-200 shadow-sm bg-white resize-none"
                        />
                        <div className="text-right text-[10px] text-gray-400 mt-1">
                          {(stage.actions || '').length}/400 символов
                        </div>
                      </div>

                      {/* KPI block */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                            Измеримый результат этапа (KPI) <span className="text-red-500">*</span>
                          </label>
                          <button 
                            onClick={() => toggleTooltip(idx, 'kpi')}
                            className="text-gray-400 hover:text-cyan-600 p-0.5 transition"
                            title="Инструкция по заполнению"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </div>

                        {activeTooltip?.stageIdx === idx && activeTooltip?.field === 'kpi' && (
                          <div className="mb-3 p-4.5 bg-cyan-50/70 border border-cyan-100 rounded-xl text-xs text-cyan-900/90 leading-relaxed shadow-inner animate-in slide-in-from-top-2">
                            <div className="font-bold mb-1.5 flex items-center gap-1.5 text-cyan-950">
                              <Info className="w-4 h-4 text-cyan-600" />
                              <span>{FIELD_TOOLTIPS.kpi.title}</span>
                            </div>
                            <p className="mb-2">{FIELD_TOOLTIPS.kpi.text}</p>
                            <div className="bg-white/80 p-2.5 rounded-lg border border-cyan-100/50">
                              <span className="font-bold block text-cyan-950 mb-1">Пример готового KPI:</span>
                              <p className="italic text-gray-600">{FIELD_TOOLTIPS.kpi.examples[idx]}</p>
                            </div>
                          </div>
                        )}

                        <textarea
                          rows={2}
                          value={stage.kpi || ''}
                          onChange={(e) => updateStageField(idx, 'kpi', e.target.value)}
                          placeholder={
                            idx === 0 
                              ? 'Пример: Заключён договор аренды, закуплено оборудование, подано 80 заявок от участников.'
                              : idx === 1 
                              ? 'Пример: Проведено 8 мастер-классов, обучено 60 подростков, каждый посетил не менее 6 занятий.'
                              : 'Пример: Проведён 1 конкурс, вручено 60 дипломов, 85% участников отметили улучшение навыков.'
                          }
                          className="w-full sleek-input rounded-xl p-3 text-xs md:text-sm focus:ring-cyan-500 focus:border-cyan-500 block border border-gray-200 shadow-sm bg-white resize-none"
                        />
                      </div>

                      {/* Артефакты / Подтверждающие материалы block */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                            Подтверждающие материалы (артефакты) <span className="text-red-500">*</span>
                          </label>
                        </div>

                        {/* Единая памятка по подтверждающим материалам */}
                        <div className="mb-3.5 p-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed shadow-xs">
                          <p className="font-bold text-slate-900 text-[13px] mb-2 flex items-center gap-1.5">
                            <Info className="w-4 h-4 text-cyan-600 shrink-0" />
                            <span>Какие подтверждающие материалы нужно будет собрать для отчёта?</span>
                          </p>
                          <p className="mb-3.5 text-slate-600">
                            Это физические доказательства того, что вы выполнили работу: документы, фото, видео, скриншоты, ссылки. Сами файлы не нужно прикреплять сейчас — просто опишите, что именно планируете получить по итогам этапа.
                          </p>
                          
                          <div className="mb-3.5 space-y-2">
                            <div className="font-semibold text-slate-800">Ориентируйтесь на тип вашего результата:</div>
                            <ul className="list-none space-y-1.5 pl-1.5">
                              <li className="flex items-start gap-2">
                                <span className="text-cyan-500 font-bold shrink-0">•</span>
                                <span><strong className="text-slate-950 font-semibold">Если результат — люди (обучено, привлечено):</strong> списки с подписями, анкеты обратной связи, журналы посещаемости.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-cyan-500 font-bold shrink-0">•</span>
                                <span><strong className="text-slate-950 font-semibold">Если результат — события (проведено, организовано):</strong> фото, видео, программы мероприятий, скриншоты прямых эфиров.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-cyan-500 font-bold shrink-0">•</span>
                                <span><strong className="text-slate-950 font-semibold">Если результат — контент (создано, опубликовано):</strong> ссылки на публикации, скриншоты, pdf-файлы.</span>
                              </li>
                            </ul>
                          </div>

                          <div className="pt-2.5 border-t border-slate-200/60 bg-white/40 -mx-4.5 -mb-4.5 px-4.5 pb-4.5 rounded-b-2xl space-y-1.5">
                            {idx === 0 && (
                              <p className="text-[11px] text-slate-600">
                                <span className="font-bold text-cyan-800">Пример для подготовительного этапа:</span> «Договор аренды помещения, фото закупленного оборудования, скриншоты регистрационной формы со списком заявок».
                              </p>
                            )}
                            {idx === 1 && (
                              <p className="text-[11px] text-slate-600">
                                <span className="font-bold text-cyan-800">Пример для основного этапа:</span> «Фото с каждого мастер-класса, заполненные анкеты участников, скриншоты постов в соцсетях».
                              </p>
                            )}
                            {idx === 2 && (
                              <p className="text-[11px] text-slate-600">
                                <span className="font-bold text-cyan-800">Пример для итогового этапа:</span> «Анкеты обратной связи (сводный график), фото с конкурса, скан итогового отчёта, электронные версии дипломов».
                              </p>
                            )}
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={stage.artifact || ''}
                          onChange={(e) => updateStageField(idx, 'artifact', e.target.value)}
                          placeholder="Например, фотографии, списки, анкеты…"
                          className="w-full sleek-input rounded-xl p-3 text-xs md:text-sm focus:ring-cyan-500 focus:border-cyan-500 block border border-gray-200 shadow-sm bg-white resize-none"
                        />
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Dates Chronology Incorrect Alert */}
        {stagesNotEmpty && !datesLogical && (
          <div className="p-4 bg-rose-55 text-rose-950/90 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs leading-relaxed animate-pulse">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-950 mb-0.5">Внимание: хронологический порядок нарушен!</strong> 
              Пожалуйста, скорректируйте Месяцы начала и окончания. Подготовительный этап должен быть в самом начале, Основной этап следовать за ним, а Итоговый этап завершать весь цикл проекта. Нарушение хронологии блокирует переход на следующий шаг.
            </div>
          </div>
        )}

        {/* Block 3: Project Summary / Preview */}
        <div className="pt-8 border-t border-gray-100">
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-600 shrink-0 animate-pulse" />
              <span>Календарный план в вашей заявке (предпросмотр)</span>
            </h4>
            
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5">
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-line">
                {textSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Block 3.5: KPI Summary */}
        <div className="pt-8 border-t border-gray-100">
          <label className="label-sleek mb-4 block text-lg font-semibold text-gray-900">Сводка ключевых показателей проекта (KPI)</label>
          <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3">
            {[0, 1, 2].map(i => {
              const stageKpi = stages[i]?.kpi?.trim();
              const stageName = stages[i]?.title || `Этап ${i + 1}`;
              return (
                <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <span className="text-sm font-semibold text-gray-700 min-w-[200px]">{stageName} этап:</span>
                  {stageKpi ? (
                    <span className="text-sm text-gray-900 leading-snug">{stageKpi}</span>
                  ) : (
                    <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">Не указано</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Block 4: Confirmation Checklist */}
        <div className="pt-8 border-t border-gray-100">
          <label className="label-sleek mb-4 block text-lg font-semibold text-gray-900">Чек-лист подтверждения</label>
          <div className="space-y-3">
            {CHECKLIST_ITEMS.map((text, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors"
              >
                <div 
                  onClick={() => handleCheck(idx)}
                  className={`mt-0.5 min-w-6 h-6 rounded cursor-pointer border flex items-center justify-center transition-all flex-shrink-0 ${
                    checklist[idx] ? 'bg-cyan-500 border-cyan-500 text-white shadow-sm' : 'border-gray-300 hover:border-cyan-400 bg-white'
                  }`}
                >
                  {checklist[idx] && <Check className="w-4 h-4" />}
                </div>
                
                <div className="flex-1">
                  <span 
                    onClick={() => handleCheck(idx)}
                    className={`text-sm md:text-base leading-snug cursor-pointer select-none ${checklist[idx] ? 'text-gray-900 font-medium' : 'text-gray-600'}`}
                  >
                    {text}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {!allChecked && (
             <p className="text-sm text-red-500 mt-4 text-center font-medium animate-pulse">
               Пожалуйста, подтвердите все пункты чек-листа, чтобы продолжить.
             </p>
          )}
        </div>

      </div>
    </StepLayout>
  );
};
