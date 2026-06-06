import React, { useState, useEffect } from 'react';
import { StepLayout } from '../components/StepLayout.tsx';
import { useAppContext } from '../store.tsx';
import { HelpCircle, ExternalLink, Check } from 'lucide-react';
import { SPHERES } from '../config/projectData.ts';
import { calculateProjectScores } from '../utils/scoreCalculator.ts';

const FUNDS_INFO = [
  {
    id: 'fpg',
    name: 'Фонд президентских грантов',
    description: 'Самый крупный конкурс для НКО. Приоритет — social-проекты с измеримым эффектом.',
    url: 'https://президентскиегранты.рф',
    doc: 'https://президентскиегранты.рф/public/document/fund_documents',
    allowedApplicantTypes: ["nko"]
  },
  {
    id: 'pfki',
    name: 'Президентский фонд культурных инициатив',
    description: 'Поддержка проектов в сфере культуры, искусства, креативных индустрий. Важна творческая уникальность.',
    url: 'https://фондкультурныхинициатив.рф',
    doc: 'https://фондкультурныхинициатив.рф/public/documents',
    allowedApplicantTypes: ["nko", "business"]
  },
  {
    id: 'rosmol',
    name: 'Росмолодёжь.Гранты',
    description: 'Гранты для молодёжных проектов. Заявители — физлица 14–35 лет, вузы, НКО.',
    url: 'https://grants.myrosmol.ru/',
    doc: 'https://fadm.gov.ru/directions/grant/',
    allowedApplicantTypes: ["individual", "nko"]
  },
  {
    id: 'fsi',
    name: 'Фонд содействия инновациям',
    description: 'Поддержка технологических и инновационных проектов на разных стадиях.',
    url: 'https://fasie.ru/',
    doc: 'https://fasie.ru/programs/',
    allowedApplicantTypes: ["business"]
  },
];

const OTHER_FUND_ID = 'other';

const CHECKLIST_ITEMS = [
  {
    text: 'Я ознакомился(ась) с Положением о конкурсе и требованиями к заявителю.',
    hint: 'Убедитесь, что ваша организация (или вы лично) соответствует всем условиям, указанным в официальном документе.'
  },
  {
    text: 'Мой правовой статус допускается к участию.',
    hint: 'Проверьте раздел «Требования к заявителям» в Положении. Например, физические лица часто ограничены возрастом, а НКО — сроком регистрации.'
  },
  {
    text: 'Я убедился(ась), что мой проект соответствует целям и тематике выбранного конкурса.',
    hint: 'Рекомендуется детально ознакомиться с положением о конкурсе на официальных сайтах фондов: ФПГ (президентскиегранты.рф), ПФКИ (фондкультурныхинициатив.рф), Росмолодёжь (grants.myrosmol.ru).'
  }
];

const RESET_STEPS_3_TO_9 = {
  projectSphereId: '',
  projectSphereName: '',
  projectTitle: '',
  shortDescription: '',
  projectRegion: '',
  projectCity: '',
  projectScale: '',
  creativeConcept: '',
  targetAudience: '',
  targetGroup: '',
  customTargetGroup: '',
  customMotivation: '',
  ageFrom: '',
  ageTo: '',
  targetNeeds: [],
  targetUtp: '',
  directReach: '',
  indirectReach: '',
  reachJustification: '',
  targetMotivation: '',
  participantsCount: '',
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
  budgetItems: [],
  totalBudget: '',
  cofinancing: '',
  partners: '',
  step6BudgetItems: [],
  step6HasPartners: false,
  step6Partners: [],
  step6Checklist: [false, false, false],
  leaderCompetence: '',
  teamMembers: [],
  projectTeam: '',
  step7Leader: { name: '', experience: '' },
  step7Members: [],
  step7Checklist: [false, false, false]
};

const ORG_TYPES = [
  'Физическое лицо',
  'НКО (некоммерческая организация)',
  'ИП / Коммерческая организация'
];

export const Step1: React.FC = () => {
  const { data, setData } = useAppContext();
  const [fundResetWarning, setFundResetWarning] = useState<string | null>(null);
  const checklist = data.step2Checklist || [false, false, false];

  const allowedFunds = FUNDS_INFO.filter(f => {
    if (!data.legalStatus) return true; // Show all if not selected
    if (data.legalStatus.includes('НКО')) return f.allowedApplicantTypes.includes('nko');
    if (data.legalStatus.includes('ИП') || data.legalStatus.includes('Коммерческая')) return f.allowedApplicantTypes.includes('business');
    return f.allowedApplicantTypes.includes('individual');
  });

  useEffect(() => {
    if (data.selectedFund && data.selectedFund !== OTHER_FUND_ID && data.legalStatus) {
      const currentFundInfo = FUNDS_INFO.find(f => f.id === data.selectedFund);
      if (currentFundInfo) {
        let isAllowed = false;
        if (data.legalStatus.includes('НКО')) isAllowed = currentFundInfo.allowedApplicantTypes.includes('nko');
        else if (data.legalStatus.includes('ИП') || data.legalStatus.includes('Коммерческая')) isAllowed = currentFundInfo.allowedApplicantTypes.includes('business');
        else isAllowed = currentFundInfo.allowedApplicantTypes.includes('individual');

        if (!isAllowed) {
          // Not allowed anymore, reset.
          setFundResetWarning('Вы изменили форму участия, поэтому список доступных фондов был обновлен. Выберите фонд заново.');
          setData(prev => ({
            ...prev,
            selectedFund: '',
            customFundName: '',
            step2Checklist: [false, false, false],
            ...RESET_STEPS_3_TO_9
          }));
        }
      }
    }
  }, [data.legalStatus]);

  const selectedFundObj = FUNDS_INFO.find(f => f.id === data.selectedFund);
  const isOther = data.selectedFund === OTHER_FUND_ID;

  const handleFundSelect = (id: string) => {
    if (id === data.selectedFund) return;

    if (data.selectedFund && data.projectSphereId) {
      const currentSphere = SPHERES.find(s => s.id === data.projectSphereId);
      if (currentSphere) {
        const isCompatible = (currentSphere as any).allowedFunds?.includes(id);
        if (!isCompatible) {
          setData({
            ...data,
            selectedFund: id,
            customFundName: id === OTHER_FUND_ID ? data.customFundName : '',
            ...RESET_STEPS_3_TO_9
          });
          setFundResetWarning('Вы сменили фонд. Некоторые сферы стали недоступны. Пожалуйста, выберите новую сферу проекта.');
          return;
        }
      }
    }

    setData({
      ...data,
      selectedFund: id,
      customFundName: id === OTHER_FUND_ID ? data.customFundName : '',
      ...RESET_STEPS_3_TO_9
    });
    setFundResetWarning(null);
  };

  const handleCheck = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index] = !newChecklist[index];
    setData({ ...data, step2Checklist: newChecklist });
  };

  const allChecked = checklist.every(Boolean);
  
  const isAgeValid = data.legalStatus === 'Физическое лицо' ? Boolean(data.applicantAge) : true;
  const canProceed = 
    Boolean(data.legalStatus) &&
    isAgeValid &&
    Boolean(data.selectedFund) && 
    (isOther ? Boolean(data.customFundName.trim()) : true) &&
    allChecked;

  const { step1: localScore } = calculateProjectScores(data);
  const progressMax = 7; 

  const mentorContent = "Грантовые фонды строго регламентируют, кто может быть заявителем. Физические лица обычно могут участвовать только в конкурсах Росмолодёжи. НКО имеют доступ к большинству фондов. ИП и коммерческие организации — к фондам культурных инициатив и некоторым другим. Прежде чем начать, скачайте и внимательно прочитайте Положение о конкурсе.";

  return (
    <StepLayout
      title="От чьего имени и куда вы подаёте заявку?"
      subtitle="Выберите статус заявителя, чтобы мы подобрали подходящие фонды."
      mentorContent={mentorContent}
      canProceed={canProceed}
      progressScore={localScore}
      progressMax={progressMax}
    >
      <div className="space-y-10">
        
        {fundResetWarning && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm font-semibold flex-1">
              {fundResetWarning}
            </div>
            <button 
              type="button"
              onClick={() => setFundResetWarning(null)}
              className="ml-auto text-amber-500 hover:text-amber-800 text-xs font-bold shrink-0"
            >
              Закрыть
            </button>
          </div>
        )}

        {/* Block 1: Applicant Type */}
        <div>
          <label className="label-sleek mb-4 block text-lg font-medium">Статус заявителя</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ORG_TYPES.map((type) => (
              <div 
                key={type}
                onClick={() => setData({ ...data, legalStatus: type })}
                className={`relative p-5 border rounded-xl cursor-pointer text-center transition-all ${
                  data.legalStatus === type 
                    ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500 shadow-sm text-cyan-900 font-medium' 
                    : 'border-gray-200 bg-white hover:border-cyan-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="pr-2 text-balance leading-snug">{type}</div>
                {data.legalStatus === type && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-cyan-500">
                    <Check className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {data.legalStatus === 'Физическое лицо' && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ваш возраст на момент подачи заявки (от 14 до 35 лет)</label>
              <input
                type="number"
                value={data.applicantAge || ''}
                onChange={(e) => setData({ ...data, applicantAge: e.target.value })}
                placeholder="Впишите возраст, например: 25"
                className="w-full max-w-sm sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border border-gray-300 shadow-sm transition-shadow outline-none"
              />
              {data.applicantAge && (Number(data.applicantAge) < 14 || Number(data.applicantAge) > 35) && (
                <div className="mt-2 text-sm text-amber-600 font-medium flex items-center bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <HelpCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  Для лиц старше 35 лет (и младше 14) подача в Росмолодёжь невозможна. Рассмотрите участие через НКО или ИП.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Block 2: Fund Selection */}
        {data.legalStatus && (
        <div className="pt-8 border-t border-gray-100 animate-in fade-in">
          <label className="label-sleek mb-4 block text-lg font-medium">Выбор фонда</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allowedFunds.map((fund) => (
              <div 
                key={fund.id}
                onClick={() => handleFundSelect(fund.id)}
                className={`relative p-5 border rounded-2xl cursor-pointer transition-all flex flex-col min-h-[140px] break-words ${
                  data.selectedFund === fund.id 
                    ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500 shadow-sm' 
                    : 'border-gray-200 bg-white hover:border-cyan-300 hover:bg-gray-50'
                }`}
              >
                <div className="pr-4 h-full flex flex-col">
                  <h3 className={`font-semibold mb-2 text-wrap ${data.selectedFund === fund.id ? 'text-cyan-900' : 'text-gray-900'}`}>{fund.name}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mt-auto">{fund.description}</p>
                </div>
                
                {data.selectedFund === fund.id && (
                  <div className="absolute top-5 right-4 text-cyan-500">
                    <Check className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}

            {/* Other Fund Chip */}
            <div 
              onClick={() => handleFundSelect(OTHER_FUND_ID)}
              className={`relative p-5 border rounded-2xl cursor-pointer transition-all flex flex-col justify-center min-h-[140px] break-words ${
                data.selectedFund === OTHER_FUND_ID 
                  ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-cyan-300 hover:bg-gray-50'
              }`}
            >
              <h3 className={`font-semibold pr-4 text-wrap ${data.selectedFund === OTHER_FUND_ID ? 'text-cyan-900' : 'text-gray-900'}`}>Другой фонд</h3>
              {data.selectedFund === OTHER_FUND_ID && (
                <div className="absolute top-5 right-4 text-cyan-500">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
          
          {isOther && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Введите название фонда <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={data.customFundName || ''}
                onChange={(e) => setData({ ...data, customFundName: e.target.value })}
                placeholder="Пример: Благотворительный фонд Потанина"
                className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border border-gray-300 shadow-sm transition-shadow outline-none"
              />
            </div>
          )}

          {selectedFundObj && (
            <div className="mt-4 flex flex-wrap gap-4 animate-in fade-in">
              <a href={selectedFundObj.url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-cyan-600 hover:text-cyan-800 transition-colors bg-cyan-50 hover:bg-cyan-100 px-5 py-2.5 rounded-xl">
                <ExternalLink className="w-4 h-4 mr-2" /> Открыть официальный сайт конкурса
              </a>
            </div>
          )}
        </div>
        )}

        {/* Block 3: Checklist */}
        <div className="pt-8 border-t border-gray-100">
          <label className="label-sleek mb-4 block text-lg font-medium">Чек-лист подтверждения</label>
          <div className="space-y-4">
            {CHECKLIST_ITEMS.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors">
                <div 
                  onClick={() => handleCheck(idx)}
                  className={`mt-0.5 min-w-6 h-6 rounded cursor-pointer border flex items-center justify-center transition-all flex-shrink-0 ${
                    checklist[idx] ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-300 hover:border-cyan-400 bg-white'
                  }`}
                >
                  {checklist[idx] && <Check className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 flex items-start gap-2">
                  <span 
                    onClick={() => handleCheck(idx)}
                    className={`text-sm md:text-base leading-snug cursor-pointer select-none ${checklist[idx] ? 'text-gray-900 font-medium' : 'text-gray-600'}`}
                  >
                    {item.text}
                  </span>
                  
                  <div className="group relative flex-shrink-0 mt-0.5 cursor-help">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-cyan-500 transition-colors" />
                    <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl z-10 pointer-events-none">
                      {item.hint}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900"></div>
                    </div>
                  </div>
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

