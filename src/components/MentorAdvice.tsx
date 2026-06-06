import React from 'react';
import { Lightbulb } from 'lucide-react';

interface MentorAdviceProps {
  title?: string;
  content: string;
}

export const MentorAdvice: React.FC<MentorAdviceProps> = ({ 
  title = "Совет грантрайтера", 
  content 
}) => {
  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200/60 p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 md:gap-5 shadow-sm">
      <div className="w-12 h-12 bg-white rounded-xl text-cyan-500 shadow-sm shrink-0 flex items-center justify-center">
        <Lightbulb size={24} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
        <div className="text-sm font-medium text-gray-600 leading-relaxed flex flex-col gap-3">
          {(content || '').split('\n').map((paragraph, idx) => (
            <span key={idx}>{paragraph}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
