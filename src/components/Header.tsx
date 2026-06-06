import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../store.tsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FolderOpen, Sparkles } from 'lucide-react';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const Header: React.FC = () => {
  const { step, setStep } = useAppContext();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 mb-2 md:mb-8 shrink-0 relative">
      <div 
        className="flex items-center gap-2 md:gap-3 self-start md:self-auto cursor-pointer"
        onClick={() => setStep(0)}
      >
        <img 
          src="logo.png" 
          alt="GRANT BUILDER Logo" 
          className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl shadow-md shrink-0 object-cover" 
          referrerPolicy="no-referrer"
        />
        <h1 className="text-sm font-extrabold tracking-tight uppercase sm:hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">GRANT BUILDER</h1>
        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase hidden sm:block bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">GRANT BUILDER</h1>
      </div>

      {step !== 0 && step !== 'drafts' && typeof step === 'number' && (
        <div className="flex items-center justify-center w-full md:w-auto md:absolute md:left-1/2 md:-translate-x-1/2">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 bg-white/40 backdrop-blur-md px-3 sm:px-4 md:px-6 py-1.5 sm:py-2.5 rounded-full border border-white/80 shadow-sm overflow-x-auto max-w-full">
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {[1, 2, 3, 4, 5, 6, 7].map((s) => {
                const isCompleted = step > s;
                const isCurrent = step === s;
                
                if (isCurrent) {
                  return (
                    <div key={s} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#7000FF] text-white text-[10px] sm:text-xs flex items-center justify-center font-bold shadow-md shrink-0">
                      {s}
                    </div>
                  );
                } else if (isCompleted) {
                  return (
                    <div key={s} className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-cyan-400 text-white text-[8px] sm:text-[10px] flex items-center justify-center font-bold shrink-0">
                      {s}
                    </div>
                  );
                } else {
                  return (
                    <div key={s} className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gray-200 text-gray-500 text-[8px] sm:text-[10px] flex items-center justify-center font-medium shrink-0">
                      {s}
                    </div>
                  );
                }
              })}
              <div className="w-2 sm:w-2 h-0.5 bg-gray-300 mx-0.5 sm:mx-1 shrink-0"></div>
              <div className={cn(
                "w-4 h-4 sm:w-6 sm:h-6 rounded-full text-[8px] sm:text-[10px] flex items-center justify-center font-medium shrink-0",
                step === 8 ? "bg-gradient-to-r from-[#00F0FF] to-[#7000FF] text-white shadow-md text-[10px] sm:text-xs" : "bg-gray-200 text-gray-500"
              )}>
                🏁
              </div>
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1 md:ml-2 whitespace-nowrap hidden sm:inline-block">
               Шаг {step} из 8
            </span>
          </div>
        </div>
      )}

      <div className="self-end md:self-auto flex items-center gap-2 z-40">
        <div ref={toolsRef} className="relative">
          <button
            onClick={() => setStep('tools')}
            className={cn(
              "flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm",
              step === 'tools'
                ? "bg-purple-100 text-purple-800 border border-purple-200" 
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-purple-700"
            )}
          >
            <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Инструменты</span>
          </button>
        </div>

        <button
          onClick={() => setStep('drafts')}
          className={cn(
            "flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm",
            step === 'drafts' 
              ? "bg-cyan-100 text-cyan-800 border border-cyan-200" 
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-cyan-700"
          )}
        >
          <FolderOpen size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">Мои заявки</span>
        </button>
      </div>
    </header>
  );
};

