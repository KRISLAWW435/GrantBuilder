export type Fund = string;
export type LegalStatus = string;

export interface CalendarStage {
  id: string;
  stage: string;
  timing: string;
  actions: string;
}

export interface TeamMember {
  id: string;
  role: string;
  name: string;
  experience: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  amount: string;
}

export interface Step6BudgetItem {
  category: string;
  customCategory?: string;
  detail: string;
  netAmount?: number;
  requested: number;
  coFinance: number;
}

export interface Step6Partner {
  name: string;
  supportType: string;
  customSupportType?: string;
  description: string;
  estimatedValue?: number;
}

export interface ProjectData {
  // Step 1
  selectedFund: string;
  customFundName: string;
  legalStatus: string;
  applicantAge: string;
  step2Checklist: boolean[];
  
  // Step 2
  projectSphereId: string;
  projectSphereName: string;
  nomination: string;
  projectTitle: string;
  shortDescription: string;
  projectRegion: string;
  projectCity: string;
  projectScale: string;
  creativeConcept: string;
  
  // Step 3
  targetAudience: string;
  targetGroups: string[];
  primaryTargetGroup: string;
  customTargetGroup: string;
  customMotivation: string;
  ageFrom: string;
  ageTo: string;
  targetNeeds: string[];
  needEvidence: string;
  targetUtp: string;
  directReach: string;
  indirectReach: string;
  reachJustification: string;
  recruitmentChannels: string;
  targetMotivation: string;
  participantsCount: string;
  
  // Step 4
  projectProblem: string;
  problemFact: string;
  problemConsequence: string;
  problemSolution: string;
  problemFactors: string[];
  factorConfirmations?: Record<string, string>;
  customProblemFactor: string;
  problemConsequences: string[];
  customProblemConsequence: string;
  problemEvidence: string[];
  problemEvidenceLinks: string;
  problemUrgency: string;
  step4Checklist: boolean[];
  
  // Step 5
  projectFormat: string;
  projectFormats: string[];
  customProjectFormat: string;
  step5Stages: {
    title: string;
    start: string;
    end: string;
    actions: string;
    kpi: string;
    artifact: string;
  }[];
  step5Checklist: boolean[];
  calendarPlan: CalendarStage[];

  // Step 6 (Budget)
  budgetItems: BudgetItem[];
  totalBudget: string;
  cofinancing: string;
  partners: string;
  step6BudgetItems: Step6BudgetItem[];
  step6HasPartners: boolean;
  step6Partners: Step6Partner[];
  step6Checklist: boolean[];
  
  // Step 7 (Team)
  leaderCompetence: string;
  teamMembers: TeamMember[];
  projectTeam: string;
  step7Leader: { name: string; experience: string };
  step7Members: { role: string; customRole: string; name: string; experience: string }[];
  step7Volunteers: { name: string; role: string; experience: string }[];
  step7ExtraFunctions: string;
  step7Checklist: boolean[];
}

export const INITIAL_DATA: ProjectData = {
  selectedFund: '',
  customFundName: '',
  legalStatus: "",
  applicantAge: "",
  step2Checklist: [false, false, false],
  projectSphereId: '',
  projectSphereName: '',
  nomination: '',
  projectTitle: '',
  shortDescription: '',
  projectRegion: '',
  projectCity: '',
  projectScale: '',
  creativeConcept: '',
  targetAudience: '',
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
  projectProblem: '',
  problemFact: '',
  problemConsequence: '',
  problemSolution: '',
  problemFactors: [],
  factorConfirmations: {},
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
  step7Volunteers: [],
  step7ExtraFunctions: '',
  step7Checklist: [false, false, false],
};

export type StepState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 'tools' | 'drafts';
