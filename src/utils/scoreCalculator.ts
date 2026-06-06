import { ProjectData } from '../types.ts';

export const calculateProjectScores = (projectData: ProjectData, localChecklists?: { step2: boolean[], step3: boolean[] }) => {
  let requiredScore = 0;
  let totalScore = 0;
  
  // Base step maximums (required)
  // Step 1: 7, Step 2: 13, Step 3: 11, Step 4: 20, Step 5: 20, Step 6: 8, Step 7: 12
  // Total Required: 91
  
  // Step 1: Base (Max Req: 7, Bonus: 0)
  let s1 = 0;
  if (projectData.selectedFund && projectData.selectedFund !== 'other') s1 += 2;
  else if (projectData.selectedFund === 'other' && projectData.customFundName?.trim()) s1 += 2;
  if (projectData.legalStatus) s1 += 1;
  if (projectData.selectedFund && projectData.legalStatus) s1 += 4;
  requiredScore += s1;
  totalScore += s1;
  
  // Step 2: Concept (Max Req: 13, Bonus: 2)
  let s2 = 0;
  if (projectData.projectTitle?.trim() && projectData.projectTitle.length > 5) s2 += 4;
  if (projectData.projectRegion?.trim() || projectData.projectCity?.trim()) s2 += 3;
  if (projectData.projectSphereId) s2 += 3;
  if (projectData.creativeConcept?.trim() && projectData.creativeConcept.length > 30) {
    s2 += 3;
    totalScore += 2; // Bonus
  }
  requiredScore += s2;
  totalScore += s2;

  // Step 3: Audience (Max Req: 11, Bonus: 4)
  let s3 = 0;
  let s3_bonus = 0;
  if (projectData.targetGroups?.length > 0) s3 += 3;
  if (projectData.ageFrom && projectData.ageTo) s3 += 3;
  if (projectData.targetMotivation?.trim()) {
    s3 += 2;
    s3_bonus += 1; // Used to be 3 total score, so 1 bonus
  }
  if (Number(projectData.directReach) > 0) s3 += 3;
  if (projectData.reachJustification?.trim() && projectData.reachJustification.length > 20) s3_bonus += 3; // Fully bonus
  requiredScore += s3;
  totalScore += s3 + s3_bonus;

  // Step 4: Problem (Max Req: 20, Bonus: 0)
  let s4 = 0;
  if (projectData.projectProblem?.trim() && projectData.projectProblem.length > 20) s4 += 5;
  if (projectData.problemFactors && projectData.problemFactors.length > 0) s4 += 5;
  if (projectData.problemSolution?.trim() && projectData.problemSolution.length > 20) s4 += 5;
  if (projectData.problemUrgency?.trim() || (projectData.problemEvidence && projectData.problemEvidence.length > 0)) s4 += 5;
  requiredScore += s4;
  totalScore += s4;

  // Step 5: Calendar Plan (Max Req: 20, Bonus: 0)
  let s5 = 0;
  if (projectData.projectFormats && projectData.projectFormats.length > 0) s5 += 4;
  const stages = projectData.step5Stages || [];
  if (stages.length >= 2) {
    s5 += 10;
    const allDetailed = stages.every(s => s.actions?.trim() && s.kpi?.trim() && s.artifact?.trim());
    if (allDetailed) s5 += 6;
  } else if (stages.length === 1) {
    s5 += 5;
  }
  requiredScore += s5;
  totalScore += s5;

  // Step 6: Budget (Max Req: 8, Bonus: 12)
  let s6 = 0;
  let s6_bonus = 0;
  const bItems = projectData.step6BudgetItems || [];
  if (bItems.length > 0) s6 += 5;
  if (bItems.length >= 3) {
    s6 += 3;
    s6_bonus += 2; // Was 5 total
  }
  
  const coSum = bItems.reduce((sum, item) => sum + (Number(item.coFinance) || 0), 0);
  const reqSum = bItems.reduce((sum, item) => sum + (Number(item.requested) || 0), 0);
  const totalSum = coSum + reqSum;
  const coPercent = totalSum > 0 ? (coSum / totalSum) * 100 : 0;
  if (coSum > 0) s6_bonus += 6;
  if (coPercent >= 20) s6_bonus += 4;

  requiredScore += s6;
  totalScore += s6 + s6_bonus;

  // Step 7: Team (Max Req: 12, Bonus: 3)
  let s7 = 0;
  let s7_bonus = 0;
  const leader = projectData.step7Leader || { name: '', experience: '' };
  const members = projectData.step7Members || [];
  if (leader.name?.trim() && leader.experience?.trim().length > 15) s7 += 5;
  if (members.length > 0) s7 += 5;
  const membersOk = members.length > 0 && members.every(m => m.name?.trim() && m.experience?.trim().length > 15);
  if (membersOk) {
    s7 += 2;
    s7_bonus += 3; // Was 5 total
  }
  requiredScore += s7;
  totalScore += s7 + s7_bonus;
  
  // Note: Step 1 uses data.step2Checklist. We also allow passing local checklists from Step 2 and Step 3 views.
  const checked1 = (projectData.step2Checklist || []).filter(Boolean).length;
  const checked2 = (localChecklists?.step2 || []).filter(Boolean).length;
  const checked3 = (localChecklists?.step3 || []).filter(Boolean).length;
  const checked4 = (projectData.step4Checklist || []).filter(Boolean).length;
  const checked5 = (projectData.step5Checklist || []).filter(Boolean).length;
  const checked6 = (projectData.step6Checklist || []).filter(Boolean).length;
  const checked7 = (projectData.step7Checklist || []).filter(Boolean).length;

  const totalChecks = checked1 + checked2 + checked3 + checked4 + checked5 + checked6 + checked7;
  totalScore += totalChecks; // Checklists give purely bonus points now

  return {
      step1: s1, 
      step2: s2, 
      step3: s3,
      step3Total: s3 + s3_bonus,
      step4: s4, 
      step5: s5, 
      step6: s6,
      step6Total: s6 + s6_bonus,
      step7: s7,
      step7Total: s7 + s7_bonus,
      total: totalScore,
      required: requiredScore,
      bonus: totalScore - requiredScore,
      totalChecks,
      maxChecklists: 23,
      maxTotal: 135
  };
};
