import React from 'react';
import { AITool } from '../data/aiTools';
import { AIToolCard } from './AIToolCard';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  tools: AITool[];
}

export const AIToolCarousel: React.FC<Props> = ({ tools }) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group/carousel -mx-4 md:mx-0 px-4 md:px-0">
      
      {/* Scroll Controls (Desktop only) */}
      <button 
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full items-center justify-center shadow-lg text-gray-600 hover:text-purple-600 hover:border-purple-200 opacity-0 group-hover/carousel:opacity-100 transition-all cursor-pointer"
      >
        <ChevronLeft size={20} />
      </button>

      <button 
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full items-center justify-center shadow-lg text-gray-600 hover:text-purple-600 hover:border-purple-200 opacity-0 group-hover/carousel:opacity-100 transition-all cursor-pointer"
      >
        <ChevronRight size={20} />
      </button>

      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 scrollbar-hide items-start"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tools.map(t => (
          <AIToolCard key={t.id} tool={t} />
        ))}
      </div>
      
    </div>
  );
};
