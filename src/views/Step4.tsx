import React, { useState, useEffect } from 'react';
import { StepLayout } from '../components/StepLayout.tsx';
import { useAppContext } from '../store.tsx';
import { HelpCircle, Check, Sparkles, AlertCircle, Clock, Info } from 'lucide-react';
import { calculateProjectScores } from '../utils/scoreCalculator.ts';

const FACTORS_BY_SPHERE: Record<string, string[]> = {
  education: [
    'Школьная программа фокусируется только на академических предметах, не развивая гибкие навыки.',
    'Высокая стоимость дополнительного образования (курсы, репетиторы) делает его недоступным для многих семей.',
    'Отсутствие профориентационных площадок в шаговой доступности (особенно в малых городах/сёлах).',
    'Низкая информированность подростков о современных профессиях и карьерных треках.',
    'Слабая вовлечённость работодателей в подготовку молодых кадров.'
  ],
  eco: [
    'Отсутствие инфраструктуры для раздельного сбора отходов в жилых кварталах.',
    'Низкий уровень экологической грамотности населения (не знают, как и зачем сортировать).',
    'Регулярное загрязнение конкретной природной территории (парк, берег реки).',
    'Равнодушие местных властей или бизнеса к экологическим проблемам.',
    'Нехватка волонтёрских организаций, системно занимающихся уборкой и просвещением.'
  ],
  it: [
    'Нехватка практического опыта работы над реальными технологическими задачами у начинающих специалистов.',
    'Отсутствие доступных лабораторий, фаблабов и оборудования для технического творчества.',
    'Высокий порог входа в сферу высоких технологий для ребят из уязвимых групп и регионов.',
    'Отсутствие системы долгосрочного менторства со стороны практикующих IT-специалистов.',
    'Низкая концентрация локальных IT-мероприятий и хакатонов за пределами столиц.'
  ],
  social: [
    'Нежелание или неумение молодых людей брать на себя лидерские роли и социальную ответственность.',
    'Хронический дефицит бесплатных комфортных пространств для молодежного досуга и творчества.',
    'Отсутствие эффективных механизмов социализации трудных подростков и молодежи в кризисных ситуациях.',
    'Низкая вовлеченность молодежи в добровольческую и волонтерскую деятельность.',
    'Проблема дезадаптации и выгорания молодых лидеров некоммерческих инициатив.'
  ],
  urban: [
    'Игнорирование мнения местных жителей и молодежи при планировании благоустройства территорий.',
    'Отсутствие современных, безопасных и многофункциональных зон отдыха в спальных районах.',
    'Низкий уровень бережного отношения горожан к муниципальному имуществу и экологии города.',
    'Дефицит квалифицированных молодых архитекторов и урбанистов, желающих работать с регионами.'
  ],
  sport: [
    'Высокая стоимость абонементов в фитнес-клубы и платных секций для школьников и студентов.',
    'Нехватка оборудованных спортивных площадок в шаговой доступности для дворового спорта.',
    'Слабая вовлеченность людей старшего возраста и инвалидов в регулярную физическую активность.',
    'Дефицит бесплатных качественных спортивных мероприятий, любительских турниров и марафонов.'
  ],
  culture: [
    'Скудный культурный досуг в малых городах, вынуждающий молодежь уезжать за искусством.',
    'Отсутствие выставочных и репетиционных пространств для начинающих мастеров и художников.',
    'Высокий барьер для выхода молодых талантливых авторов на профессиональный культурный рынок РФ.',
    'Исчезновение традиционных народных промыслов из-за отсутствия современных форматов передачи опыта.'
  ],
  patriotism: [
    'Скучные, морально устаревшие формы патриотического воспитания, вызывающие отторжение у молодежи.',
    'Низкий уровень знаний молодежи об истории своей семьи, ее роли в судьбе страны и края.',
    'Забытая история малых населенных пунктов, исчезновение памятников и воинских захоронений.',
    'Рост фейков об историческом прошлом Отечества в сети Интернет без удобных систем опровержений.'
  ],
  universal: [
    'Недостаточная вовлеченность местного сообщества в решение актуальных районных вопросов.',
    'Дефицит комфортных открытых каналов взаимодействия между авторами идей и экспертами.',
    'Слабо развитая культура горизонтальных связей и взаимовыручки внутри города.'
  ]
};

const CONSEQUENCES_BY_SPHERE: Record<string, string[]> = {
  education: [
    'Подростки не могут осознанно выбрать профессию, действуют по шаблону или совету родителей.',
    'Усиливается отток талантливой молодёжи из региона (уезжают за возможностями).',
    'Растёт уровень тревожности и неуверенности в будущем у старшеклассников.',
    'Местный рынок труда не получает мотивированных молодых специалистов.'
  ],
  eco: [
    'Ухудшается здоровье жителей из-за загрязнённой среды.',
    'Деградируют зелёные зоны, снижается биоразнообразие.',
    'Формируется безразличное отношение к природе у подрастающего поколения.',
    'Город теряет привлекательность для туристов и новых жителей.'
  ],
  it: [
    'Способная молодежь бросает программирование или уезжает, не найдя применения навыкам на местах.',
    'Большинство локальных социальных проблем остаются без недорогих современных IT-решений.',
    'Выпускники вузов и курсов не могут устроиться на работу из-за отсутствия портфолио в резюме.'
  ],
  social: [
    'Нарастание социальной пассивности, апатии и деструктивного поведения в молодежной среде.',
    'Медленное развитие волонтерского движения и отставание региональных социальных проектов.',
    'Разобщенность активной молодежи и снижение доверия к общественным институтам.'
  ],
  urban: [
    'Быстрый износ, вандализм новых благоустроенных площадок из-за непричастности жителей к их созданию.',
    'Пустующие серые общественные пространства, не притягивающие горожан.',
    'Растущий отток населения из неуютных и не адекватных запросам городов.'
  ],
  sport: [
    'Снижение общей физической подготовки подрастающего поколения и рост заболеваемости.',
    'Замещение полезного активного досуга пассивным времяпровождением перед экранами.',
    'Нарастание гиподинамии и связанной с ней социально-психологической депрессии у горожан.'
  ],
  culture: [
    'Креативная молодежь не видит перспектив в культуре и уходит в другие прикладные профессии.',
    'Культурная жизнь в муниципалитетах стагнирует, теряется идентичность территории.',
    'Жители лишены доступа к качественным современным культурным проектам.'
  ],
  patriotism: [
    'Формирование формального отношения к исторической памяти как к обязанности, а не ценности.',
    'Утрата связи поколений, деградация исторических мемориалов на периферии.',
    'Незащищенность молодого ума от фальсификаций истории.'
  ],
  universal: [
    'Пассивность целевой группы в решении проблем собственного развития.',
    'Медленный запуск полезных локальных инициатив, высокий уровень неудовлетворенности граждан.'
  ]
};

const EVIDENCE_OPTIONS = [
  'Я провёл опрос среди представителей целевой группы (есть данные, могу приложить).',
  'Существует официальная статистика или исследование (Росстат, ВЦИОМ, отчёты министерств).',
  'Проблема освещалась в местных СМИ или социальных сетях.',
  'Есть личные наблюдения и опыт (работаю с этой аудиторией, живу в этом районе).'
];

const CHECKLIST_ITEMS = [
  'Проблема описана как дефицит возможностей для людей, а не как нехватка денег у организатора.',
  'Есть чёткое объяснение, почему проект важно реализовать именно сейчас.',
  'Приведён хотя бы один источник или доказательство существования проблемы.'
];

export const Step4: React.FC = () => {
  const { data, setData } = useAppContext();
  
  // Helper to resolve primary target group name
  const getPrimaryGroupName = () => {
    const rawGroup = data.targetGroups?.[0];
    if (!rawGroup) return 'не указана';
    if (rawGroup.toLowerCase() === 'other' || rawGroup === 'Другое' || rawGroup === 'Другой' || rawGroup === 'Другое (свой вариант)') {
      return data.customTargetGroup || 'Другая целевая группа';
    }
    return rawGroup;
  };

  const primaryGroup = getPrimaryGroupName();
  const ageValue = data.ageFrom && data.ageTo ? `${data.ageFrom}–${data.ageTo}` : 'не указан';
  const groupAgeStr = ageValue !== 'не указан' ? `${ageValue} лет` : 'не указан';
  const keyNeed = data.targetMotivation 
    ? data.targetMotivation.split('\n').join(', ').toLowerCase() 
    : 'не определена';

  // Initialize checklist from store
  const checklist = data.step4Checklist || [false, false, false];
  const [showFactorWarning, setShowFactorWarning] = useState(false);
  const [showConsequenceWarning, setShowConsequenceWarning] = useState(false);

  const sphereId = data.projectSphereId || 'universal';

  // Load relevant lists
  const activeFactors = FACTORS_BY_SPHERE[sphereId] || FACTORS_BY_SPHERE.universal;
  const activeConsequences = CONSEQUENCES_BY_SPHERE[sphereId] || CONSEQUENCES_BY_SPHERE.universal;

  const currentFactorsArr = data.problemFactors || [];
  const currentConsequencesArr = data.problemConsequences || [];
  const currentEvidenceArr = data.problemEvidence || [];

  // Validations
  const isFactorsValid = currentFactorsArr.length > 0 &&
    (!currentFactorsArr.includes('other') || (data.customProblemFactor || '').trim().length > 0);
  
  const isConsequencesValid = currentConsequencesArr.length > 0 &&
    (!currentConsequencesArr.includes('other') || (data.customProblemConsequence || '').trim().length > 0);

  const isSolutionValid = (data.problemSolution || '').trim().length >= 50;
  const isEvidenceValid = currentEvidenceArr.length > 0 || (data.problemEvidenceLinks || '').trim().length > 0;
  const isUrgencyValid = (data.problemUrgency || '').trim().length >= 20;
  const allChecked = checklist.every(Boolean);

  const canProceed = isFactorsValid && 
                     isConsequencesValid && 
                     isSolutionValid && 
                     isEvidenceValid && 
                     isUrgencyValid && 
                     allChecked;

  // Compile Dynamic Text Summary
  const textSummary = (() => {
    const city = data.projectCity || '___';
    const projectTitle = data.projectTitle || '___';
    
    // Factors
    const mappedFactors = currentFactorsArr.map(f => {
      if (f === 'other') {
        return data.customProblemFactor?.trim() ? data.customProblemFactor.trim() : 'другие факторы';
      }
      return f;
    });
    const factorsStr = mappedFactors.length > 0 ? mappedFactors.join(', ').toLowerCase() : '___';
    
    // Consequences
    const mappedConsequences = currentConsequencesArr.map(c => {
      if (c === 'other') {
        return data.customProblemConsequence?.trim() ? data.customProblemConsequence.trim() : 'другие последствия';
      }
      return c;
    });
    const consequencesStr = mappedConsequences.length > 0
      ? mappedConsequences.join(' и ').toLowerCase()
      : '___';
      
    // Solution  
    const solutionText = data.problemSolution ? data.problemSolution : '___';
    
    // Evidence
    const evidenceParts = [];
    
    // Add textual factor confirmations if any
    currentFactorsArr.forEach(f => {
      const conf = data.factorConfirmations?.[f];
      if (conf && conf.trim()) {
        evidenceParts.push(conf.trim());
      }
    });

    if (currentEvidenceArr.length > 0) {
      evidenceParts.push(currentEvidenceArr.join(', ').toLowerCase());
    }
    if (data.problemEvidenceLinks && data.problemEvidenceLinks.trim()) {
      evidenceParts.push(`(источники: ${data.problemEvidenceLinks.trim()})`);
    }
    const evidenceStr = evidenceParts.length > 0 ? evidenceParts.join(', ') : '___';
    
    // Urgency
    const urgencyStr = data.problemUrgency ? data.problemUrgency : '___';

    return `В г. ${city} остро стоит проблема: ${factorsStr}. Это приводит к тому что ${consequencesStr}. Ситуация подтверждается данными: ${evidenceStr}. Проект «${projectTitle}» устранит причины проблемы данным способом: ${solutionText}. Реализация необходима именно сейчас, поскольку ${urgencyStr}.`;
  })();

  // Synchronise compiled values back to general context
  useEffect(() => {
    if (canProceed) {
      setData(prev => ({
        ...prev,
        projectProblem: textSummary,
        problemFact: currentFactorsArr.map(f => f === 'other' ? prev.customProblemFactor : f).join(', '),
        problemConsequence: currentConsequencesArr.map(c => c === 'other' ? prev.customProblemConsequence : c).join(', ')
      }));
    }
  }, [textSummary, canProceed]);

  const handleCheck = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index] = !newChecklist[index];
    setData(prev => ({ ...prev, step4Checklist: newChecklist }));
  };

  const handleFactorToggle = (factor: string) => {
    if (currentFactorsArr.includes(factor)) {
      setData(prev => ({
        ...prev,
        problemFactors: currentFactorsArr.filter(f => f !== factor),
        customProblemFactor: factor === 'other' ? '' : prev.customProblemFactor
      }));
      setShowFactorWarning(false);
    } else {
      if (currentFactorsArr.length >= 3) {
        setShowFactorWarning(true);
        setTimeout(() => setShowFactorWarning(false), 2500);
      } else {
        setData(prev => ({
          ...prev,
          problemFactors: [...currentFactorsArr, factor]
        }));
        setShowFactorWarning(false);
      }
    }
  };

  const handleConsequenceToggle = (consequence: string) => {
    if (currentConsequencesArr.includes(consequence)) {
      setData(prev => ({
        ...prev,
        problemConsequences: currentConsequencesArr.filter(c => c !== consequence),
        customProblemConsequence: consequence === 'other' ? '' : prev.customProblemConsequence
      }));
      setShowConsequenceWarning(false);
    } else {
      if (currentConsequencesArr.length >= 2) {
        setShowConsequenceWarning(true);
        setTimeout(() => setShowConsequenceWarning(false), 2500);
      } else {
        setData(prev => ({
          ...prev,
          problemConsequences: [...currentConsequencesArr, consequence]
        }));
        setShowConsequenceWarning(false);
      }
    }
  };

  const handleEvidenceToggle = (evidence: string) => {
    if (currentEvidenceArr.includes(evidence)) {
      setData(prev => ({
        ...prev,
        problemEvidence: currentEvidenceArr.filter(e => e !== evidence)
      }));
    } else {
      setData(prev => ({
        ...prev,
        problemEvidence: [...currentEvidenceArr, evidence]
      }));
    }
  };

  // Score Calculation
  const { step4: localScore } = calculateProjectScores(data);

  const mentorAdvice = `Эксперт хочет увидеть не вашу нужду в деньгах, а объективную проблему целевой группы. Используйте "формулу боли":\n\n1. Факт — что конкретно не так (статистика, наблюдение).\n2. Последствия — как это ухудшает жизнь людей.\n3. Решение — как ваш проект устранит причину или загладит последствия.\n\nОбязательно укажите, откуда вы знаете о проблеме: провели опрос, нашли исследование, есть публикации в СМИ. Голословное утверждение "это важно" не работает. И помните: проблема должна быть связана с номинацией, которую вы выбрали в Шаге 1.`;

  return (
    <StepLayout
      title="Какую проблему решает ваш проект? Обоснование актуальности"
      subtitle="Покажите, что проблема реальна, подтверждена фактами и требует решения именно сейчас."
      mentorContent={mentorAdvice}
      canProceed={canProceed}
      progressScore={localScore}
      progressMax={20}
    >
      <div className="space-y-10 max-w-[800px] mx-auto">
        
        {/* Dynamic Reminder Block */}
        <div className="bg-gradient-to-br from-indigo-50/70 to-indigo-50/40 border border-indigo-100 rounded-[24px] p-5.5 text-sm text-indigo-950 leading-relaxed shadow-xs relative flex flex-col sm:flex-row gap-4 items-start overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-100/80 text-indigo-800 font-bold text-[10px] uppercase tracking-widest rounded-bl-xl rounded-tr-2xl">
            Напоминание
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-100/70 flex items-center justify-center shrink-0 text-indigo-600 shadow-sm border border-indigo-100/50">
            <Info size={20} />
          </div>
          <div className="flex-1 mt-1 sm:mt-0">
            <p className="text-indigo-900/90 text-[13px] md:text-sm leading-relaxed font-normal">
              Вы определили, что ваш проект направлен на основную целевую группу:{' '}
              <span className="font-semibold text-indigo-950 underline decoration-indigo-300 decoration-2 underline-offset-2">{primaryGroup}</span>
              {groupAgeStr !== 'не указан' ? `, возраст ` : ''}
              {groupAgeStr !== 'не указан' && (
                <span className="font-semibold text-indigo-950">{groupAgeStr}</span>
              )}
              . Их ключевая потребность:{' '}
              <span className="font-semibold text-indigo-1000 font-medium text-indigo-950">{keyNeed}</span>.
            </p>
            <p className="text-indigo-900/95 text-[13px] md:text-sm leading-relaxed font-medium mt-2">
              Теперь обсудите, почему эта потребность является острой проблемой, требующей решения именно сейчас.
            </p>
          </div>
        </div>

        {/* Block 1: Key Factors */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="label-sleek block text-lg font-medium">1. Ключевые факторы проблемы <span className="text-red-500">*</span></label>
            <span className="text-xs text-gray-500 bg-gray-100 font-medium py-1 px-2.5 rounded-full">выбрано {currentFactorsArr.length} из 3</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">Выберите до трёх основных причин, которые создают данную проблему.</p>
          
          <div className="space-y-3">
            {activeFactors.map((factor) => {
              const isChecked = currentFactorsArr.includes(factor);
              const isDisabled = !isChecked && currentFactorsArr.length >= 3;

              return (
                <div key={factor} className="flex flex-col gap-1.5">
                  <div 
                    onClick={() => !isDisabled && handleFactorToggle(factor)}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                      isDisabled ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100' : 'cursor-pointer select-none'
                    } ${
                      isChecked 
                        ? 'border-cyan-500 bg-cyan-50/50 text-cyan-900 font-medium shadow-sm' 
                        : !isDisabled && 'border-gray-100 bg-white hover:border-cyan-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className={`mt-0.5 min-w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                      isChecked ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm leading-snug">{factor}</span>
                  </div>
                  {isChecked && (
                    <div className="ml-8 mt-1 mb-2 animate-in fade-in slide-in-from-top-1">
                      <p className="text-xs text-gray-600 mb-1.5 font-medium">Чем подтверждается этот факт для вашего города / региона? (кратко)</p>
                      <input
                        type="text"
                        value={data.factorConfirmations?.[factor] || ''}
                        onChange={(e) => setData({ 
                          ...data, 
                          factorConfirmations: { 
                            ...(data.factorConfirmations || {}), 
                            [factor]: e.target.value 
                          } 
                        })}
                        placeholder="Например: опрос 20 молодых художников, отсутствие галерей в Сызрани по данным 2ГИС"
                        className="w-full sleek-input rounded-xl p-3 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-200 shadow-sm bg-white"
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Other Factor option */}
            {(() => {
              const isChecked = currentFactorsArr.includes('other');
              const isDisabled = !isChecked && currentFactorsArr.length >= 3;
              return (
                <div key="other" className="flex flex-col gap-1.5">
                  <div 
                    onClick={() => !isDisabled && handleFactorToggle('other')}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                      isDisabled ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100' : 'cursor-pointer select-none'
                    } ${
                      isChecked 
                        ? 'border-cyan-500 bg-cyan-50/50 text-cyan-900 font-medium shadow-sm' 
                        : !isDisabled && 'border-gray-100 bg-white hover:border-cyan-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className={`mt-0.5 min-w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                      isChecked ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm leading-snug">Другой фактор проблемы</span>
                  </div>
                  {isChecked && (
                    <div className="ml-8 mt-1 mb-2 animate-in fade-in slide-in-from-top-1">
                      <p className="text-xs text-gray-600 mb-1.5 font-medium">Чем подтверждается этот факт для вашего города / региона? (кратко)</p>
                      <input
                        type="text"
                        value={data.factorConfirmations?.['other'] || ''}
                        onChange={(e) => setData({ 
                          ...data, 
                          factorConfirmations: { 
                            ...(data.factorConfirmations || {}), 
                            ['other']: e.target.value 
                          } 
                        })}
                        placeholder="Например: опрос 20 молодых художников, отсутствие галерей в Сызрани по данным 2ГИС"
                        className="w-full sleek-input rounded-xl p-3 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-200 shadow-sm bg-white"
                      />
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {showFactorWarning && (
            <div className="mt-3 text-xs text-rose-600 font-medium flex items-center gap-1.5 animate-bounce">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Можно выбрать не более трёх факторов</span>
            </div>
          )}

          {currentFactorsArr.length > 0 && (
            <div className="mt-4 p-3 bg-cyan-50/35 border border-cyan-100/50 rounded-xl text-xs text-cyan-800 leading-relaxed">
              <strong>Вы выбрали следующие ключевые факторы:</strong>{' '}
              {currentFactorsArr.map((f, i) => (
                <span key={i}>
                  {i > 0 && ', '}
                  {f === 'other' ? (data.customProblemFactor || 'другие факторы') : f}
                </span>
              ))}
              . Они будут основой для описания проблемы.
            </div>
          )}

          {currentFactorsArr.includes('other') && (
            <div className="mt-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Напишите ваш ключевой фактор проблемы <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={data.customProblemFactor || ''}
                onChange={(e) => setData({ ...data, customProblemFactor: e.target.value })}
                placeholder="Например: Недостаток спортивного оборудования в микрорайоне Первомайский"
                className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm bg-white"
              />
            </div>
          )}
        </div>

        {/* Block 2: Consequences */}
        <div className="pt-8 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <label className="label-sleek block text-lg font-medium">2. Негативные результаты (последствия) <span className="text-red-500">*</span></label>
            <span className="text-xs text-gray-500 bg-gray-100 font-medium py-1 px-2.5 rounded-full">выбрано {currentConsequencesArr.length} из 2</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">К каким негативным результатам приводят выбранные факторы? Выберите до двух наиболее значимых последствий. Если вашего варианта нет в списке, выберите «Другое» и впишите свой.</p>

          <div className="space-y-3">
            {activeConsequences.map((consequence) => {
              const isChecked = currentConsequencesArr.includes(consequence);
              const isDisabled = !isChecked && currentConsequencesArr.length >= 2;

              return (
                <div 
                  key={consequence}
                  onClick={() => !isDisabled && handleConsequenceToggle(consequence)}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                    isDisabled ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100' : 'cursor-pointer select-none'
                  } ${
                    isChecked 
                      ? 'border-cyan-500 bg-cyan-50/50 text-cyan-900 font-medium shadow-sm' 
                      : !isDisabled && 'border-gray-100 bg-white hover:border-cyan-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className={`mt-0.5 min-w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                    isChecked ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5 animate-in zoom-in-50" />}
                  </div>
                  <span className="text-sm leading-snug">{consequence}</span>
                </div>
              );
            })}

            {/* Other Consequence option */}
            {(() => {
              const isChecked = currentConsequencesArr.includes('other');
              const isDisabled = !isChecked && currentConsequencesArr.length >= 2;
              return (
                <div 
                  onClick={() => !isDisabled && handleConsequenceToggle('other')}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                    isDisabled ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100' : 'cursor-pointer select-none'
                  } ${
                    isChecked 
                      ? 'border-cyan-500 bg-cyan-50/50 text-cyan-900 font-medium shadow-sm' 
                      : !isDisabled && 'border-gray-100 bg-white hover:border-cyan-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className={`mt-0.5 min-w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                    isChecked ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5 animate-in zoom-in-50" />}
                  </div>
                  <span className="text-sm leading-snug">Другое (свой вариант)</span>
                </div>
              );
            })()}
          </div>

          {showConsequenceWarning && (
            <div className="mt-3 text-xs text-rose-600 font-medium flex items-center gap-1.5 animate-bounce">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Можно выбрать не более двух последствий</span>
            </div>
          )}

          {currentConsequencesArr.includes('other') && (
            <div className="mt-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Опишите последствие <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={data.customProblemConsequence || ''}
                onChange={(e) => setData({ ...data, customProblemConsequence: e.target.value })}
                placeholder="Опишите, к какому негативному результату приводит проблема"
                className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm bg-white"
              />
            </div>
          )}
        </div>

        {/* Block 3: Evidence Base */}
        <div className="pt-8 border-t border-gray-100">
          <div className="p-6 bg-cyan-50/20 border border-cyan-100/50 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-cyan-600 shrink-0" />
              <span className="text-xs uppercase font-extrabold text-cyan-700 tracking-wider">Важно для эксперта</span>
            </div>
            
            <label className="label-sleek block text-lg font-medium mb-1">3. Доказательная база проблемы <span className="text-red-500">*</span></label>
            <p className="text-xs text-cyan-800/85 mb-4 leading-relaxed">Откуда вы знаете, что проблема реально существует? Отметьте варианты и укажите ссылки или результаты опросов.</p>

            <div className="space-y-3 mb-5">
              {EVIDENCE_OPTIONS.map((evidence) => {
                const isChecked = currentEvidenceArr.includes(evidence);

                return (
                  <div 
                    key={evidence}
                    onClick={() => handleEvidenceToggle(evidence)}
                    className={`flex items-start gap-3 p-4.5 rounded-xl border transition-all cursor-pointer select-none bg-white ${
                      isChecked 
                        ? 'border-cyan-500 text-cyan-900 font-medium shadow-sm' 
                        : 'border-gray-100 hover:border-cyan-200 hover:bg-gray-50/50 text-gray-600'
                    }`}
                  >
                    <div className={`mt-0.5 min-w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                      isChecked ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs md:text-sm leading-snug">{evidence}</span>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyan-950 mb-1.5">Ссылки на источники, статьи или подробности исследований</label>
              <input
                type="text"
                value={data.problemEvidenceLinks || ''}
                onChange={(e) => setData({ ...data, problemEvidenceLinks: e.target.value })}
                placeholder="Например: Ссылка на статью в газете, или 'Опрос проведён в марте 2026 года среди 120 жителей...'"
                className="w-full sleek-input rounded-xl p-4 text-xs focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm bg-white"
              />
            </div>
          </div>
        </div>

        {/* Block 4: Solution */}
        <div className="pt-8 border-t border-gray-100">
          <label className="label-sleek block text-lg font-medium mb-2">4. Решение проблемы <span className="text-red-500">*</span></label>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Опишите, как именно ваш проект устранит или смягчит проблему. Используйте глаголы действия: создадим, запустим, обучим, вовлечём, разработаем. Покажите связь с выбранными факторами.
          </p>

          <textarea
            minLength={50}
            maxLength={600}
            rows={5}
            value={data.problemSolution || ''}
            onChange={(e) => setData({ ...data, problemSolution: e.target.value })}
            placeholder="Пример: Мы организуем серию бесплатных профориентационных мастер-классов с участием представителей местных компаний..."
            className={`w-full sleek-input rounded-2xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border resize-none shadow-sm ${
              data.problemSolution && data.problemSolution.length < 50 ? 'border-amber-300 focus:border-amber-400 focus:ring-amber-200' : 'border-gray-200'
            }`}
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={`${isSolutionValid ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
              {isSolutionValid ? '✓ Минимум 50 символов набрано' : `Нужно еще ${Math.max(0, 50 - (data.problemSolution || '').length)} символов`}
            </span>
            <span className="text-gray-400">{(data.problemSolution || '').length}/600</span>
          </div>
        </div>

        {/* Block 5: Urgency Factor */}
        <div className="pt-8 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <label className="label-sleek block text-lg font-medium">5. Фактор срочности <span className="text-red-500">*</span></label>
          </div>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Почему проект нужно реализовать именно сейчас? Укажите внешние обстоятельства, сезонные факторы, приближающиеся знаковые даты или напишите: "Проблема стабильно актуальна, откладывание лишь усугубляет ситуацию".
          </p>

          <input
            type="text"
            maxLength={300}
            value={data.problemUrgency || ''}
            onChange={(e) => setData({ ...data, problemUrgency: e.target.value })}
            placeholder="В связи с сезонным ростом загрязнения локальной реки... / Проблема стабильно запущенна и откладывание..."
            className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm bg-white"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={`${isUrgencyValid ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
              {isUrgencyValid ? '✓ Минимальная длина срочности набрана' : `Нужно еще ${Math.max(0, 20 - (data.problemUrgency || '').length)} символов`}
            </span>
            <span className="text-gray-400">{(data.problemUrgency || '').length}/300</span>
          </div>
        </div>

        {/* Block 6: Compilation Preview */}
        <div className="pt-8 border-t border-gray-100">
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse" />
              <span>Так будет выглядеть раздел "Актуальность" в вашей заявке</span>
            </h4>
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4">
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed italic">{textSummary}</p>
            </div>
          </div>
        </div>

        {/* Block 7: Confirmation Checklist */}
        <div className="pt-8 border-t border-gray-100">
          <label className="label-sleek mb-4 block text-lg font-medium">Чек-лист подтверждения</label>
          <div className="space-y-4">
            {CHECKLIST_ITEMS.map((text, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors">
                <div 
                  onClick={() => handleCheck(idx)}
                  className={`mt-0.5 min-w-6 h-6 rounded cursor-pointer border flex items-center justify-center transition-all flex-shrink-0 ${
                    checklist[idx] ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-300 hover:border-cyan-400 bg-white'
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
