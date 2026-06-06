import React, { useState } from 'react';
import { Catalog } from '../components/tools/Catalog';
import { Prompts } from '../components/tools/Prompts';
import { Masterclass } from '../components/tools/Masterclass';

export const Tools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'prompts' | 'masterclass'>('catalog');
  const [promptFilters, setPromptFilters] = useState<{ networkId: string | null; type: 'text' | 'image' | 'video' | 'all' }>({ networkId: null, type: 'all' });

  const tabs = [
    { id: 'catalog', label: '🔍 Каталог нейросетей' },
    { id: 'prompts', label: '📋 Библиотека промтов' },
    { id: 'masterclass', label: '🎓 Мастер-класс' },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Инструменты</h2>
      <p className="text-gray-600 mb-6 max-w-2xl">
        Нейросети — ваши добровольные помощники. Они не заменят эксперта, но помогут преодолеть страх чистого листа, сгенерировать идеи и проверить текст на слабые места. Всегда проверяйте сгенерированный контент перед подачей заявки.
      </p>
      
      <div className="flex bg-white rounded-2xl p-1 mb-6 border border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-50 text-cyan-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        {activeTab === 'catalog' && (
          <Catalog />
        )}
        {activeTab === 'prompts' && <Prompts initialFilters={promptFilters} />}
        {activeTab === 'masterclass' && (
            <Masterclass onNavigateToLibrary={(type, section) => {
                setPromptFilters({ networkId: null, type });
                // Note: Need to pass section to Prompts too if it supports it, 
                // but for now I'll just adjust activeTab.
                setActiveTab('prompts');
            }} />
        )}
      </div>
    </div>
  );
};
