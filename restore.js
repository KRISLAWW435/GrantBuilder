import fs from 'fs';

for (let i = 1; i <= 7; i++) {
  const filePath = `./src/views/Step${i}.tsx`;
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  const prevStep = i + 1;
  fileContent = fileContent.replace(new RegExp(`export const Step${prevStep}`, 'g'), `export const Step${i}`);
  fs.writeFileSync(filePath, fileContent);
}

// Restore App.tsx
let appContent = fs.readFileSync('./src/App.tsx', 'utf-8');
appContent = appContent.replace("import { Step8 } from './views/Step8.tsx';\n", "");
appContent = appContent.replace("        {step === 8 && <Step8 />}\n", "");
appContent = appContent.replace("{step === 9 && <FinalStep />}", "{step === 8 && <FinalStep />}");
fs.writeFileSync('./src/App.tsx', appContent);

// Restore FinalStep.tsx
let finalStepContent = fs.readFileSync('./src/views/FinalStep.tsx', 'utf-8');
finalStepContent = finalStepContent.replace(
  `// Step 1: Base (Max 1)
    if (data.applicantType) scores.step1.score += 1;

    // Step 2: Fund (Max 6)
    if (data.selectedFund && data.selectedFund !== 'other') scores.step2.score += 2;
    else if (data.selectedFund === 'other' && data.customFundName?.trim()) scores.step2.score += 2;
    if (data.step2Checklist && data.step2Checklist.every(Boolean)) scores.step2.score += 4;`,
  `// Step 1: Base (Max 7)
    if (data.selectedFund && data.selectedFund !== 'other') scores.step1.score += 2;
    else if (data.selectedFund === 'other' && data.customFundName?.trim()) scores.step1.score += 2;
    if (data.legalStatus) scores.step1.score += 1;
    if (data.selectedFund && data.legalStatus) scores.step1.score += 4;`
);

finalStepContent = finalStepContent.replace(/scores\.step3\.score/g, "scores.step2.score");
finalStepContent = finalStepContent.replace(/scores\.step4\.score/g, "scores.step3.score");
finalStepContent = finalStepContent.replace(/scores\.step5\.score/g, "scores.step4.score");
finalStepContent = finalStepContent.replace(/scores\.step6\.score/g, "scores.step5.score");
finalStepContent = finalStepContent.replace(/scores\.step7\.score/g, "scores.step6.score");
finalStepContent = finalStepContent.replace(/scores\.step8\.score/g, "scores.step7.score");

finalStepContent = finalStepContent.replace("scores.step8.score;", "/* REVERTED */");

fs.writeFileSync('./src/views/FinalStep.tsx', finalStepContent);

console.log('Restored files');
