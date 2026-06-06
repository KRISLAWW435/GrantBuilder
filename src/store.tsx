import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ProjectData, INITIAL_DATA, StepState } from './types.ts';
import { DraftStorage } from './utils/indexedDb.ts';

interface AppContextType {
  data: ProjectData;
  setData: React.Dispatch<React.SetStateAction<ProjectData>>;
  step: StepState;
  setStep: React.Dispatch<React.SetStateAction<StepState>>;
  clearForm: () => void;
  currentDraftId: string | null;
  loadDraft: (id: string) => Promise<void>;
  isInitializing: boolean;
  saveCurrentDraft: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ProjectData>(INITIAL_DATA);
  const [step, setStep] = useState<StepState>(0);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const dataRef = useRef(data);
  const stepRef = useRef(step);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // Initial load: checking paths and URL params
  useEffect(() => {
    const init = async () => {
      const hash = window.location.hash || '';
      
      let draftId = null;
      if (hash.includes('?draft=')) {
        draftId = hash.split('?draft=')[1];
      }

      if (hash === '#drafts' || hash === '#/drafts') {
        setStep('drafts');
        setData(INITIAL_DATA);
        setCurrentDraftId(null);
      } else if (hash.startsWith('#tools')) {
        setStep('tools');
      } else if (draftId) {
        await loadDraftData(draftId);
      } else {
        // Look for older format or just start fresh
        const oldId = localStorage.getItem('current_draft_id');
        if (oldId) {
          const loaded = await loadDraftData(oldId);
          if (!loaded) {
            setStep(0); // If it failed, start from scratch
          }
        } else {
          setStep(0);
        }
      }
      setIsInitializing(false);
    };
    init();
  }, []);

  const loadDraftData = async (id: string): Promise<boolean> => {
    const draft = await DraftStorage.getById(id);
    if (draft) {
      setData(draft.stepsData);
      setStep(draft.currentStep as StepState);
      setCurrentDraftId(id);
      localStorage.setItem('current_draft_id', id);
      
      // Update URL without refresh
      window.history.replaceState({}, '', `#constructor?draft=${id}`);
      return true;
    }
    return false;
  };

  const loadDraft = async (id: string) => {
    await loadDraftData(id);
  };

  const saveCurrentDraft = useCallback(async () => {
    if (stepRef.current === 0 || stepRef.current === 'drafts' || stepRef.current === 'tools') return; 

    let id = currentDraftId;
    if (!id) {
      id = "draft_" + Date.now();
      setCurrentDraftId(id);
      localStorage.setItem('current_draft_id', id);
      
      window.history.replaceState({}, '', `#constructor?draft=${id}`);
    }

    const currentData = dataRef.current;
    
    await DraftStorage.save({
      id,
      name: currentData.projectTitle?.trim() || "",
      fund: currentData.selectedFund,
      sphere: currentData.projectSphereName,
      shortDescription: currentData.shortDescription,
      currentStep: typeof stepRef.current === 'number' ? stepRef.current : 1,
      stepsData: currentData,
      lastModified: Date.now()
    });
  }, [currentDraftId]);

  // Sync route and simple state mapping when `step` changes
  useEffect(() => {
    if (!isInitializing) {
      if (step === 'drafts') {
        window.history.pushState({}, '', '#drafts');
        setCurrentDraftId(null);
        localStorage.removeItem('current_draft_id');
      } else if (step === 'tools') {
        window.history.pushState({}, '', '#tools');
      } else if (step === 0) {
        window.history.pushState({}, '', '#');
        setCurrentDraftId(null);
        localStorage.removeItem('current_draft_id');
      } else {
        // Constructor steps
        if (currentDraftId) {
          window.history.replaceState({}, '', `#constructor?draft=${currentDraftId}`);
        } else {
          window.history.pushState({}, '', '#constructor');
        }
      }
    }
  }, [step, currentDraftId, isInitializing]);

  // Auto-save on data or step changes
  useEffect(() => {
    if (isInitializing) return;
    
    // Save immediately on any data change if we are in constructor steps
    if (step !== 0 && step !== 'drafts' && step !== 'tools') {
      saveCurrentDraft();
    }
  }, [data, step, saveCurrentDraft, isInitializing]);

  // Auto-save interval (5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      saveCurrentDraft();
    }, 5000);
    return () => clearInterval(timer);
  }, [saveCurrentDraft]);

  const clearForm = () => {
    setData(INITIAL_DATA);
    setStep(1); // Usually goes to Step 1 after creating new
    setCurrentDraftId(null);
    localStorage.removeItem('current_draft_id');
  };

  return (
    <AppContext.Provider value={{ 
      data, setData, 
      step, setStep, 
      clearForm,
      currentDraftId,
      loadDraft,
      isInitializing,
      saveCurrentDraft
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
