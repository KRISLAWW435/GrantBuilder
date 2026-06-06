import React from 'react';
import { Header } from './components/Header.tsx';
import { AppProvider, useAppContext } from './store.tsx';
import { Landing } from './views/Landing.tsx';
import { Step1 } from './views/Step1.tsx';
import { Step2 } from './views/Step2.tsx';
import { Step3 } from './views/Step3.tsx';
import { Step4 } from './views/Step4.tsx';
import { Step5 } from './views/Step5.tsx';
import { Step6 } from './views/Step6.tsx';
import { Step7 } from './views/Step7.tsx';
import { FinalStep } from './views/FinalStep.tsx';
import { Drafts } from './views/Drafts.tsx';
import { Tools } from './views/Tools.tsx';

const AppContent: React.FC = () => {
  const { step } = useAppContext();

  return (
    <div className="h-screen w-full bg-[#F8F9FA] text-[#1D1D1F] flex flex-col p-4 md:p-8 font-sans overflow-hidden select-none">
      <Header />
      
      <main className="flex-1 w-full relative z-10 overflow-y-auto overflow-x-hidden pb-8">
        {step === 0 && <Landing />}
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
        {step === 5 && <Step5 />}
        {step === 6 && <Step6 />}
        {step === 7 && <Step7 />}
        {step === 8 && <FinalStep />}
        {step === 'tools' && <Tools />}
        {step === 'drafts' && <Drafts />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
