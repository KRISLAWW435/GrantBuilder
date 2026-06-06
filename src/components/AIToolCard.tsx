import React, { useState } from 'react';
import { AITool } from '../data/aiTools';
import { ExternalLink, ShieldOff, ShieldAlert, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './Header';

interface Props {
  tool: AITool;
}

export const AIToolCard: React.FC<Props> = ({ tool }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full shrink-0 w-[280px] sm:w-[320px] snap-center">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-900">{tool.name}</h3>
        {tool.requiresVpn ? (
          <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-[10px] font-bold rounded-lg whitespace-nowrap uppercase tracking-wider">
            <ShieldAlert size={12} /> VPN
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-lg whitespace-nowrap uppercase tracking-wider">
            <ShieldOff size={12} /> Без VPN
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {tool.tags.map((tag, i) => (
          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">
            {tag}
          </span>
        ))}
      </div>
      
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-auto flex items-center justify-between gap-2 w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-700 text-sm font-bold rounded-xl transition cursor-pointer border border-gray-200"
      >
        <span>Подробнее</span>
        <ChevronDown size={18} className={cn("text-gray-500 transition-transform duration-300", isExpanded && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-100 mt-4 space-y-3">
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {tool.description}
              </p>
              
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-100/50">
                <span className="block text-xs font-bold text-purple-400 mb-1 leading-none uppercase tracking-wider">Лимиты</span>
                <p className="text-xs text-purple-900 font-medium leading-relaxed">{tool.limits}</p>
              </div>

              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white text-sm font-bold rounded-xl transition shadow-md shadow-purple-200"
              >
                Перейти к сервису <ExternalLink size={16} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
