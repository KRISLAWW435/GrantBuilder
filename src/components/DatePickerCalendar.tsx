import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerCalendarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  id?: string;
}

const RUSSIAN_MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
  value,
  onChange,
  placeholder = 'Выберите дату',
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse the current state value or fallback to today
  const getInitialCalendarState = () => {
    if (!value) {
      const today = new Date();
      return { month: today.getMonth(), year: today.getFullYear() };
    }

    // Try parsing DD.MM.YYYY
    const dottedMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (dottedMatch) {
      const m = parseInt(dottedMatch[2], 10) - 1;
      const y = parseInt(dottedMatch[3], 10);
      if (m >= 0 && m < 12 && !isNaN(y)) {
        return { month: m, year: y };
      }
    }

    // Try parsing legacy string e.g. "Март 2026"
    const parts = value.split(' ');
    if (parts.length === 2) {
      const idx = RUSSIAN_MONTHS.indexOf(parts[0]);
      const y = parseInt(parts[1], 10);
      if (idx !== -1 && !isNaN(y)) {
        return { month: idx, year: y };
      }
    }

    const today = new Date();
    return { month: today.getMonth(), year: today.getFullYear() };
  };

  const [currentDateState, setCurrentDateState] = useState(getInitialCalendarState);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  // Sync state if value changes externally
  useEffect(() => {
    setCurrentDateState(getInitialCalendarState());
  }, [value]);

  // Click outside to close standard overlay
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const { month, year } = currentDateState;

  // Calendar calculations for day grid
  const getDaysInMonth = (m: number, y: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOffset = (m: number, y: number) => {
    // JS getDay(): 0 = Sunday, 1 = Monday...
    // We want: 0 = Monday, ... 6 = Sunday
    let day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    setCurrentDateState(prev => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentDateState(prev => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleSelectDay = (dayNum: number) => {
    const formattedDay = String(dayNum).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateStr = `${formattedDay}.${formattedMonth}.${year}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectMonth = (mIdx: number) => {
    setCurrentDateState(prev => ({ ...prev, month: mIdx }));
    setViewMode('days');
  };

  const handleSelectYear = (yNum: number) => {
    setCurrentDateState(prev => ({ ...prev, year: yNum }));
    setViewMode('months');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // Generate arrays for grid rendering
  const daysInMonth = getDaysInMonth(month, year);
  const offset = getFirstDayOffset(month, year);
  const totalSlots = offset + daysInMonth;
  const rowsCount = Math.ceil(totalSlots / 7);

  // Year options for fast picker (e.g. 2025 to 2030)
  const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => 2025 + i);

  // Helper to check if a day is the currently selected day
  const isSelectedDay = (dayNum: number) => {
    if (!value) return false;
    const dateStr = `${String(dayNum).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;
    return value === dateStr;
  };

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full sleek-input rounded-xl p-3 text-xs md:text-sm border border-gray-300 shadow-sm bg-white cursor-pointer hover:border-cyan-300 focus-within:border-cyan-500 transition-all select-none"
      >
        <div className="flex items-center gap-2 text-gray-700 min-w-0">
          <CalendarIcon className="w-4 h-4 text-cyan-500 shrink-0" />
          <span className={`truncate font-medium ${value ? 'text-gray-900' : 'text-gray-400'}`}>
            {value || placeholder}
          </span>
        </div>
        
        {value ? (
          <button 
            type="button" 
            onClick={handleClear}
            className="p-0.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition shrink-0"
            title="Очистить дату"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-72 md:w-80 p-4 bg-white border border-gray-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between mb-4">
            {viewMode === 'days' && (
              <button 
                type="button"
                onClick={handlePrevMonth} 
                className="p-1.5 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <div className="flex gap-1.5 text-sm font-bold text-gray-800">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
                className="px-2 py-0.5 hover:bg-cyan-50 text-cyan-900 rounded-md transition"
              >
                {RUSSIAN_MONTHS[month]}
              </button>
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'years' ? 'days' : 'years')}
                className="px-2 py-0.5 hover:bg-cyan-50 text-cyan-900 rounded-md transition"
              >
                {year}
              </button>
            </div>

            {viewMode === 'days' && (
              <button 
                type="button"
                onClick={handleNextMonth} 
                className="p-1.5 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* VIEW 1: Days Grid Grid */}
          {viewMode === 'days' && (
            <div className="space-y-1">
              {/* Day names of the week */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1.5 border-b border-gray-100 mb-1.5">
                {WEEKDAYS.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* Grid block calculations */}
              <div className="grid grid-cols-7 gap-1">
                {/* Offset spaces for pre-days */}
                {Array.from({ length: offset }).map((_, i) => {
                  // Get preceding month days
                  const prevM = month === 0 ? 11 : month - 1;
                  const prevY = month === 0 ? year - 1 : year;
                  const daysInPrev = getDaysInMonth(prevM, prevY);
                  const dayVal = daysInPrev - offset + i + 1;
                  return (
                    <div 
                      key={`offset-${i}`} 
                      className="text-center py-1.5 text-[11px] font-medium text-gray-300 pointer-events-none"
                    >
                      {dayVal}
                    </div>
                  );
                })}

                {/* Actual day items */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const active = isSelectedDay(dayNum);
                  return (
                    <button
                      key={`day-${dayNum}`}
                      type="button"
                      onClick={() => handleSelectDay(dayNum)}
                      className={`text-center py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        active 
                          ? 'bg-cyan-500 text-white font-bold scale-105 shadow-sm shadow-cyan-500/20' 
                          : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-700'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}

                {/* Offset spaces for post-days to complete full calendar UI grid */}
                {Array.from({ length: (rowsCount * 7) - totalSlots }).map((_, i) => (
                  <div 
                    key={`offset-post-${i}`} 
                    className="text-center py-1.5 text-[11px] font-medium text-gray-300 pointer-events-none"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 2: Month Grid Grid */}
          {viewMode === 'months' && (
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {RUSSIAN_MONTHS.map((mName, mIdx) => {
                const isCurrent = month === mIdx;
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => handleSelectMonth(mIdx)}
                    className={`p-2.5 text-xs font-semibold rounded-xl transition ${
                      isCurrent 
                        ? 'bg-cyan-500 text-white shadow-sm' 
                        : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-700'
                    }`}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          )}

          {/* VIEW 3: Year Selector Grid */}
          {viewMode === 'years' && (
            <div className="grid grid-cols-3 gap-2 p-1 max-h-48 overflow-y-auto">
              {YEAR_OPTIONS.map((yNum) => {
                const isCurrent = year === yNum;
                return (
                  <button
                    key={yNum}
                    type="button"
                    onClick={() => handleSelectYear(yNum)}
                    className={`p-2 text-xs font-semibold rounded-xl transition ${
                      isCurrent 
                        ? 'bg-cyan-500 text-white shadow-sm' 
                        : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-700'
                    }`}
                  >
                    {yNum}
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const d = String(today.getDate()).padStart(2, '0');
                const m = String(today.getMonth() + 1).padStart(2, '0');
                const formatted = `${d}.${m}.${today.getFullYear()}`;
                onChange(formatted);
                setIsOpen(false);
              }}
              className="text-cyan-600 hover:text-cyan-800"
            >
              Сегодня
            </button>
            <span>* Выберите число</span>
          </div>
          
        </div>
      )}
    </div>
  );
};

// Simple ChevronDown icon helper to avoid layout break
const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);
