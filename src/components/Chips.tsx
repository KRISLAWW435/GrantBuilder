import React from 'react';
import { PlusCircle } from 'lucide-react';

interface ChipsProps {
  options: string[];
  onSelect: (value: string) => void;
}

export const Chips: React.FC<ChipsProps> = ({ options, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {options.map((opt, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(opt)}
          type="button"
          className="text-left p-5 bg-white border border-gray-200 rounded-2xl hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 group flex flex-col justify-between min-h-[120px]"
        >
          <span className="text-sm text-gray-700 leading-relaxed font-medium mb-4 group-hover:text-cyan-900">{opt}</span>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 opacity-60 group-hover:opacity-100 transition-opacity">
            <PlusCircle size={16} /> Добавить в ответ
          </div>
        </button>
      ))}
    </div>
  );
};
