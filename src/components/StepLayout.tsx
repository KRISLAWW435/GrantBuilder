import React from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../store.tsx';
import { MentorAdvice } from '../components/MentorAdvice.tsx';

interface StepLayoutProps {
  title: string;
  subtitle?: string;
  mentorTitle?: string;
  mentorContent: string;
  children: React.ReactNode;
  canProceed: boolean;
  isLastStep?: boolean;
  progressScore?: number;
  progressMax?: number;
}

export const StepLayout: React.FC<StepLayoutProps> = ({ 
  title, 
  subtitle = "Выберите готовые блоки или впишите свой вариант.",
  mentorTitle = "Совет грантрайтера",
  mentorContent, 
  children, 
  canProceed,
  progressScore,
  progressMax
}) => {
  const { step, setStep, data, setData } = useAppContext();

  const handleNext = () => {
    if (canProceed && typeof step === 'number' && step < 8) {
      setStep((prev) => (typeof prev === 'number' ? prev + 1 : prev) as any);
    }
  };

  const STEP_DATA_RESETS: Record<number, Record<string, any>> = {
    2: {
      projectSphereId: '',
      projectSphereName: '',
      nomination: '',
      projectTitle: '',
      shortDescription: '',
      projectRegion: '',
      projectCity: '',
      projectScale: '',
      creativeConcept: '',
    },
    3: {
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
    },
    4: {
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
    },
    5: {
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
    },
    6: {
      budgetItems: [],
      totalBudget: '',
      cofinancing: '',
      partners: '',
      step6BudgetItems: [],
      step6HasPartners: false,
      step6Partners: [],
      step6Checklist: [false, false, false],
    },
    7: {
      leaderCompetence: '',
      teamMembers: [],
      projectTeam: '',
      step7Leader: { name: '', experience: '' },
      step7Members: [],
      step7Checklist: [false, false, false],
    }
  };

  const handlePrev = () => {
    if (typeof step === 'number' && step > 1) {
      const currentStep = step;
      let combinedResets: Record<string, any> = {};
      for (let s = currentStep; s <= 7; s++) {
        if (STEP_DATA_RESETS[s]) {
          combinedResets = { ...combinedResets, ...STEP_DATA_RESETS[s] };
        }
      }

      setData((prev: any) => ({
        ...prev,
        ...combinedResets
      }));

      setStep((prev) => (typeof prev === 'number' ? prev - 1 : prev) as any);
    }
  };

  const SCALES_MAP: Record<string, string> = {
    local: 'Локальный',
    municipal: 'Муниципальный',
    regional: 'Региональный',
    interregional: 'Межрегиональный',
    online: 'Онлайн / несколько регионов'
  };

  const showMiniCard = (typeof step === 'number' && step > 2) && Boolean(data.projectTitle);

  return (
    <motion.div 
      key={step}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto h-full flex flex-col"
    >
      <div className="sleek-card p-4 md:p-10 rounded-[32px] flex-1 flex flex-col mb-4 bg-white/90">
        <div className="mb-0 md:mb-4">
          <h2 className="text-xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h2>
          <p className="text-gray-500 text-sm">{subtitle}</p>
          
          {progressScore !== undefined && progressMax !== undefined && (
            <div className="mt-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-gray-100 pt-4">
              <span className="text-sm font-medium text-gray-500">Заполнено {progressScore} из {progressMax} обязательных полей</span>
              <div className="w-full sm:w-48 h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${(progressScore / progressMax) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {showMiniCard && (
          <div className="mb-6 p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl flex flex-col gap-2 relative shadow-sm">
            <div className="absolute top-0 right-0 px-3 py-1 bg-gray-200/70 text-gray-600 font-bold text-[10px] uppercase tracking-widest rounded-bl-xl rounded-tr-2xl">
              Карточка проекта
            </div>
            <div className="text-cyan-900 font-extrabold text-lg mb-1">{data.projectTitle}</div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Сфера:</span> {data.projectSphereName || 'Не указана'}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Масштаб:</span> {data.projectScale ? SCALES_MAP[data.projectScale] : 'Не указан'} {data.projectCity ? `(${data.projectCity})` : ''}
            </div>
            <div className="text-sm text-gray-700 pr-10 md:pr-4">
              <span className="font-semibold text-gray-900">Суть:</span> {data.shortDescription || 'Не описана'}
            </div>
          </div>
        )}

        <MentorAdvice title={mentorTitle} content={mentorContent} />
        
        <div className="space-y-8 flex-1 mt-4">
          {children}
        </div>

        <div className="flex items-center justify-between pt-8 mt-12 border-t border-gray-200">
          <button
            onClick={handlePrev}
            className="px-6 md:px-8 py-3 rounded-2xl border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Назад
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="sleek-btn-primary px-8 md:px-12 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-cyan-500/30 flex items-center gap-2"
          >
            {step === 7 ? 'Завершить' : 'Далее'} 
            <span className="text-lg leading-none">&rarr;</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
