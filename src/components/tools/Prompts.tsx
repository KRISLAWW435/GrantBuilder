import React, { useState, useMemo } from 'react';
import { PROMPTS } from '../../config/promptsLibrary';
import { Copy } from 'lucide-react';

interface PromptsProps {
  initialFilters?: { networkId: string | null; type: 'text' | 'image' | 'video' | 'all' };
}

export const Prompts: React.FC<PromptsProps> = ({ initialFilters }) => {
  const [activeType, setActiveType] = useState< 'text' | 'image' | 'video'>(initialFilters?.type && initialFilters.type !== 'all' ? initialFilters.type : 'text');
  const [activeSection, setActiveSection] = useState<string>('all');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const sections = useMemo(() => {
    const s = PROMPTS.filter(p => p.type === activeType).map(p => p.section);
    return ['all', ...Array.from(new Set(s))];
  }, [activeType]);

  const filteredPrompts = useMemo(() => {
    return PROMPTS.filter(p => p.type === activeType && (activeSection === 'all' || p.section === activeSection) && (initialFilters?.networkId && activeSection === 'all' ? p.networkId === initialFilters.networkId : true));
  }, [activeType, activeSection, initialFilters]);

  const replaceVariables = (template: string) => {
    let result = template;
    Object.entries(variableValues).forEach(([key, value]) => {
      result = result.replace(`[${key}]`, value || `[${key}]`);
    });
    return result;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Промт скопирован!');
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-gray-100 p-1 rounded-xl">
        {(['text', 'image', 'video'] as const).map(t => (
          <button key={t} onClick={() => { setActiveType(t); setActiveSection('all'); }} className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold capitalize ${activeType === t ? 'bg-white shadow-sm' : 'text-gray-600'}`}>
            {t === 'text' ? 'Текст' : t === 'image' ? 'Картинки' : 'Видео'}
          </button>
        ))}
      </div>
      <select value={activeSection} onChange={e => setActiveSection(e.target.value)} className="w-full sm:w-64 p-3 rounded-xl border border-gray-200">
        {sections.map(s => <option key={s} value={s}>{s === 'all' ? 'Все разделы' : s}</option>)}
      </select>

      <div className="space-y-4">
        {filteredPrompts.map(p => {
          const processedTemplate = replaceVariables(p.template);
          
          return (
            <div key={p.id} className="border border-gray-200 rounded-xl p-5 space-y-4">
              <h4 className="font-bold text-lg">{p.title}</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">{p.template}</p>
              <p className="text-xs text-gray-500 italic">Этап: {p.usageStage}</p>
              
              <div className="grid gap-2">
                {p.variables.map(v => (
                  <input key={v} placeholder={v} value={variableValues[v] || ''} onChange={e => setVariableValues(prev => ({ ...prev, [v]: e.target.value }))} className="p-2 rounded-lg border border-gray-200 text-sm" />
                ))}
                <button onClick={() => setVariableValues(prev => ({ ...prev, ...p.exampleValues }))} className="text-xs text-blue-600 underline text-left mt-1">
                  Заполнить пример
                </button>
              </div>

              <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-lg text-sm text-cyan-900">{processedTemplate}</div>

              <button onClick={() => copyToClipboard(processedTemplate)} className="flex items-center gap-2 text-sm font-bold bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
                <Copy size={16} /> Копировать
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
