import React, { useState } from 'react';
import { StepLayout } from '../components/StepLayout.tsx';
import { useAppContext } from '../store.tsx';
import { SPHERES, projectDataConfig } from '../config/projectData.ts';
import { HelpCircle, Check, Lightbulb, X, ChevronDown } from 'lucide-react';
import { calculateProjectScores } from '../utils/scoreCalculator.ts';

const SCALES = [
  { id: 'local', label: 'Локальный', hint: 'микрорайон, одно поселение' },
  { id: 'municipal', label: 'Муниципальный', hint: 'город / район' },
  { id: 'regional', label: 'Региональный', hint: 'весь субъект РФ' },
  { id: 'interregional', label: 'Межрегиональный', hint: 'несколько субъектов' },
  { id: 'online', label: 'Онлайн / несколько регионов', hint: 'Межрегиональный охват через интернет' }
];

const CHECKLIST_ITEMS = [
  'Название проекта чётко отражает его содержание и результат.',
  'Выбранная сфера и масштаб соответствуют целям номинации (указанной в Шаге 1).',
  'Регион реализации указан точно, проект привязан к конкретной территории.'
];

export const Step2: React.FC = () => {
  const { data, setData } = useAppContext();
  const [checklist, setChecklist] = useState([false, false, false]);
  const [hoveredSphereId, setHoveredSphereId] = useState<string | null>(null);
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  
  const isPFKI = data.selectedFund === 'pfki';

  const handleCheck = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index] = !newChecklist[index];
    setChecklist(newChecklist);
  };

  const handleSphereSelect = (id: string, name: string) => {
    if (id === data.projectSphereId) return;
    setIsExamplesOpen(false);

    setData(prev => ({
      ...prev,
      projectSphereId: id,
      projectSphereName: id === 'universal' ? '' : name,
      
      // Reset Step 3 (Audience / Target Group)
      targetAudience: '',
      targetGroup: '',
      targetGroups: [],
      primaryTargetGroup: '',
      customTargetGroup: '',
      customMotivation: '',
      ageFrom: '',
      ageTo: '',
      targetNeeds: [],
      needEvidence: '',
      targetUtp: '',
      directReach: '',
      indirectReach: '',
      reachJustification: '',
      recruitmentChannels: '',
      targetMotivation: '',
      participantsCount: '',

      // Reset Step 4 (Problem)
      projectProblem: '',
      problemFact: '',
      problemConsequence: '',
      problemSolution: '',
      problemFactors: [],
      customProblemFactor: '',
      problemConsequences: [],
      customProblemConsequence: '',
      problemEvidence: [],
      problemEvidenceLinks: '',
      problemUrgency: '',
      step4Checklist: [false, false, false],

      // Reset Step 5 (Format / Calendar)
      projectFormat: '',
      projectFormats: [],
      customProjectFormat: '',
      step5Stages: [
        { title: 'Подготовительный', start: '', end: '', actions: '', kpi: '', artifact: '' },
        { title: 'Основной', start: '', end: '', actions: '', kpi: '', artifact: '' },
        { title: 'Итоговый', start: '', end: '', actions: '', kpi: '', artifact: '' }
      ],
      step5Checklist: [false, false, false],
      calendarPlan: [],

      // Reset Step 6 (Budget)
      budgetItems: [],
      totalBudget: '',
      cofinancing: '',
      partners: '',
      step6BudgetItems: [],
      step6HasPartners: false,
      step6Partners: [],
      step6Checklist: [false, false, false],

      // Reset Step 7 (Team)
      leaderCompetence: '',
      teamMembers: [],
      projectTeam: '',
      step7Leader: { name: '', experience: '' },
      step7Members: [],
      step7Checklist: [false, false, false]
    }));
  };

  const filteredSpheres = SPHERES.filter((sphere: any) => {
    if (!data.selectedFund) return true;
    return sphere.allowedFunds?.includes(data.selectedFund);
  });

  const activeSphereId = hoveredSphereId || data.projectSphereId;
  const activeSphereObj = SPHERES.find(s => s.id === activeSphereId);
  const showWarning = Boolean(
    activeSphereObj &&
    (activeSphereObj as any).warningFor?.includes(data.selectedFund)
  );

  const sphereConfig = data.projectSphereId && projectDataConfig[data.projectSphereId as keyof typeof projectDataConfig]
    ? (projectDataConfig[data.projectSphereId as keyof typeof projectDataConfig] as any)
    : null;

  const activeExamples = sphereConfig
    ? (
      data.selectedFund === 'pfki' ? sphereConfig.titleExamplesCultural : 
      data.selectedFund === 'rosmol' ? sphereConfig.titleExamplesRosmolodezh : 
      sphereConfig.titleExamples
    ) || []
    : [];

  const titleLength = data.projectTitle?.length || 0;
  const isTitleGood = titleLength >= 10 && titleLength <= 80;
  const isTitleTooShort = titleLength > 0 && titleLength < 10;
  const isTitleTooLong = titleLength > 80;

  const shortDescLength = data.shortDescription?.length || 0;
  const conceptLength = data.creativeConcept?.length || 0;

  const allChecked = checklist.every(Boolean);

  const canProceed = Boolean(data.projectSphereId) &&
                     (data.projectSphereId !== 'universal' || Boolean(data.projectSphereName?.trim())) &&
                     Boolean(data.nomination?.trim()) &&
                     Boolean(data.projectTitle?.trim() && data.projectTitle.length >= 5 && data.projectTitle.length <= 100) &&
                     Boolean(data.shortDescription?.trim()) &&
                     Boolean(data.projectRegion?.trim()) &&
                     Boolean(data.projectCity?.trim()) &&
                     Boolean(data.projectScale) &&
                     (!isPFKI || conceptLength >= 50) &&
                     allChecked;

  const { step2: localScore } = calculateProjectScores(data);
  const progressMax = 13;

  const mentorContent = "Список доступных сфер проекта адаптирован под требования выбранного вами фонда. Название — ваш первый контакт с экспертом. Оно должно работать как заголовок новости: сразу давать понять, о чём проект и для кого. Избегайте штампов вроде \"Развитие творчества\" — вместо этого сформулируйте обещание: \"Арт-мастерская: бесплатные курсы по керамике для подростков из спальных районов\". Если вы подаётесь на культурный грант, название должно звучать как бренд, вызывать эмоцию и отражать уникальность вашей идеи.";

  return (
    <StepLayout
      title="Фундамент проекта: сфера, название, география"
      subtitle="Определите направление и узнаваемое имя вашей инициативы. От этого зависит, как эксперты будут воспринимать проект с первой секунды."
      mentorContent={mentorContent}
      canProceed={canProceed}
      progressScore={localScore}
      progressMax={progressMax}
    >
      <div className="space-y-10">
        
        {/* Block 1: Sphere */}
        <div>
          <label className="label-sleek mb-2 block text-lg font-medium">Сфера проекта <span className="text-red-500">*</span></label>
          <div className="text-sm text-gray-500 mb-4 font-medium uppercase tracking-wider">Тематические направления (для ориентации)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSpheres.map((sphere) => (
              <div 
                key={sphere.id}
                onClick={() => handleSphereSelect(sphere.id, sphere.name)}
                onMouseEnter={() => setHoveredSphereId(sphere.id)}
                onMouseLeave={() => setHoveredSphereId(null)}
                className={`relative p-5 border rounded-2xl cursor-pointer transition-all flex flex-col justify-start min-h-[140px] break-words ${
                  data.projectSphereId === sphere.id 
                    ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500 shadow-sm' 
                    : 'border-gray-200 bg-white hover:border-cyan-300 hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-gray-100 mb-3 shrink-0">
                  {(sphere as any).icon || '🔹'}
                </div>
                <div className="pr-4 flex-1 flex flex-col">
                  <h3 className={`font-semibold mb-1 leading-snug text-wrap ${data.projectSphereId === sphere.id ? 'text-cyan-900' : 'text-gray-900'}`}>
                    {sphere.name}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed mt-1">{(sphere as any).description}</p>
                </div>
                
                {data.projectSphereId === sphere.id && (
                  <div className="absolute top-5 right-4 text-cyan-500">
                    <Check className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {showWarning && (
            <div className="mt-4 bg-amber-50 rounded-2xl p-5 border border-amber-200 flex items-start gap-4 animate-in fade-in slide-in-from-top-1 duration-250">
              <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 leading-relaxed font-semibold">
                Обратите внимание: проекты в этой сфере должны иметь выраженную культурную или творческую составляющую. Например, не просто уборка территории, а создание арт-объекта; не просто спортивное мероприятие, а культурно-спортивный фестиваль. Убедитесь, что ваш проект соответствует требованиям фонда.
              </p>
            </div>
          )}
          
          {data.projectSphereId === 'universal' && (
            <div className="mt-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Укажите вашу сферу <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={data.projectSphereName || ''}
                onChange={(e) => setData({ ...data, projectSphereName: e.target.value })}
                placeholder="Например: Психологическая поддержка и адаптация"
                className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm"
              />
            </div>
          )}

          {data.projectSphereId && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Номинация конкурса (скопируйте из Положения) <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={data.nomination || ''}
                onChange={(e) => setData({ ...data, nomination: e.target.value })}
                placeholder="Впишите название номинации "
                className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border border-gray-300 shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Block 2: Title */}
        <div className="pt-8 border-t border-gray-100">
          <label className="label-sleek mb-2 block text-lg font-medium">Название проекта <span className="text-red-500">*</span></label>
          <input
            type="text"
            maxLength={100}
            value={data.projectTitle || ''}
            onChange={(e) => setData({ ...data, projectTitle: e.target.value })}
            placeholder="Например: Арт-мастерская: бесплатные курсы по керамике"
            className="w-full sleek-input rounded-2xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs font-medium ${isTitleGood ? 'text-green-600' : isTitleTooShort || isTitleTooLong ? 'text-red-500' : 'text-gray-500'}`}>
              {titleLength === 0 && 'Обязательное поле'}
              {isTitleTooShort && 'Слишком короткое. Добавьте больше конкретики.'}
              {isTitleTooLong && 'Слишком длинное. Постарайтесь уложиться в 80 символов.'}
              {isTitleGood && 'Хорошо! Отличная длина названия.'}
            </span>
            <span className="text-xs text-gray-400">{titleLength}/100</span>
          </div>

          {(['fpg', 'pfki', 'rosmol'].includes(data.selectedFund)) && activeExamples.length > 0 && (
            <div className="mt-3 relative">
              <button
                type="button"
                onClick={() => setIsExamplesOpen(!isExamplesOpen)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-600 hover:text-cyan-800 transition-colors border-b border-dashed border-cyan-300 hover:border-cyan-800 pb-0.5"
              >
                <Lightbulb size={16} className="text-cyan-500" />
                Посмотреть примеры названий
                <ChevronDown size={14} className={`transform transition-transform ${isExamplesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExamplesOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setIsExamplesOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-full md:w-[400px] bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-150 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="bg-gray-50/80 px-4 py-3 flex items-center justify-between border-b border-gray-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Примеры названий</span>
                      <button 
                        type="button"
                        onClick={() => setIsExamplesOpen(false)}
                        className="text-gray-400 hover:text-gray-700 transition-colors p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="p-2 flex flex-col">
                      {activeExamples.map((example: string, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setData({ ...data, projectTitle: example });
                            setIsExamplesOpen(false);
                          }}
                          className="text-left text-sm text-gray-700 hover:text-cyan-800 hover:bg-cyan-50 rounded-xl px-3 py-2.5 transition-colors"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Block 3: Short Description */}
        <div className="pt-8 border-t border-gray-100">
          <label className="label-sleek mb-2 block text-lg font-medium">Краткая суть проекта</label>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Упомяните: ЧТО делаете, для КОГО, ГДЕ и КАКОЙ главный результат. Пример: «Бесплатный курс по веб-дизайну для сельской молодёжи с итоговым трудоустройством 30% выпускников».
          </p>
          <textarea
            maxLength={500}
            rows={3}
            value={data.shortDescription || ''}
            onChange={(e) => setData({ ...data, shortDescription: e.target.value })}
            placeholder="Краткое описание проекта..."
            className="w-full sleek-input rounded-2xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm resize-none"
          />
           <div className="mt-2 flex justify-end">
            <span className="text-xs text-gray-400">{shortDescLength}/500</span>
          </div>
        </div>

        {/* Block 4: Geography */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-100">
          <div className="md:col-span-2">
             <label className="label-sleek mb-4 block text-lg font-medium">География проекта</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Регион (субъект РФ) <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={data.projectRegion || ''}
              onChange={(e) => setData({ ...data, projectRegion: e.target.value })}
              placeholder="Например: Новосибирская область"
              className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Город / населённый пункт <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={data.projectCity || ''}
              onChange={(e) => setData({ ...data, projectCity: e.target.value })}
              placeholder="г. Новосибирск"
              className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Масштаб реализации <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {SCALES.map(scale => (
                <div
                  key={scale.id}
                  onClick={() => setData({ ...data, projectScale: scale.id })}
                  className={`px-4 py-2 rounded-full border cursor-pointer transition-colors text-sm ${
                    data.projectScale === scale.id 
                      ? 'bg-cyan-500 text-white border-cyan-500 shadow-md' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium mr-1">{scale.label}</span>
                  <span className={data.projectScale === scale.id ? 'text-cyan-100' : 'text-gray-400'}>({scale.hint})</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 flex items-center">
              <HelpCircle className="w-3.5 h-3.5 mr-1" />
              Этот параметр повлияет на ожидаемый охват и бюджет проекта.
            </p>
          </div>
        </div>

        {/* Block 5: Creative Concept (PFKI only) */}
        {isPFKI && (
          <div className="pt-8 border-t border-cyan-100">
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-sm">
               <div className="flex items-center gap-2 mb-3">
                 <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[10px] uppercase font-bold tracking-wider rounded-lg">Требование ПФКИ</span>
                 <label className="label-sleek text-lg font-medium text-indigo-900 m-0">В чём культурная ценность и уникальность вашего проекта? <span className="text-red-500">*</span></label>
               </div>
               
               <p className="text-sm text-indigo-700/80 mb-4 leading-relaxed">
                 Опишите, какую новую культурную практику, смысл или продукт вы создаёте. Почему это важно для вашего региона? Какие творческие методы вы используете? Эксперты ждут нестандартного подхода, а не просто перечень мероприятий.
               </p>
               <textarea
                  maxLength={600}
                  rows={4}
                  value={data.creativeConcept || ''}
                  onChange={(e) => setData({ ...data, creativeConcept: e.target.value })}
                  placeholder="Опишите уникальность и значимость..."
                  className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-indigo-500 focus:border-indigo-500 block border-indigo-200 shadow-sm resize-none bg-white/80 backdrop-blur-sm"
                />
                 <div className="mt-2 flex justify-between items-center">
                  <span className={`text-xs ${conceptLength < 50 ? 'text-red-500' : 'text-green-600 font-medium'}`}>
                    {conceptLength < 50 ? 'Минимум 50 символов' : 'Достаточный объем'}
                  </span>
                  <span className="text-xs text-indigo-400">{conceptLength}/600</span>
                </div>
            </div>
          </div>
        )}

        {/* Block 6: Checklist */}
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
