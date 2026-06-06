import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { cn } from './Header';

interface Props {
  tip: string;
}

export const AITeacherTip: React.FC<Props> = ({ tip }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-10 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/50 transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <Lightbulb size={24} />
          </div>
          <div>
            <span className="block text-sm font-bold text-purple-900">Совет ИИ-наставника</span>
            {!isOpen && <span className="block text-xs text-purple-600 font-medium truncate max-w-xs md:max-w-md hidden sm:block">Нажмите, чтобы прочитать рекомендацию...</span>}
          </div>
        </div>
        <ChevronDown size={20} className={cn("text-purple-400 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 text-sm md:text-base text-gray-700 italic font-medium leading-relaxed pl-[68px]">
              «{tip}»
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
