import React, { useState, useEffect } from 'react';
import { StepLayout } from '../components/StepLayout.tsx';
import { useAppContext } from '../store.tsx';
import { Step6BudgetItem, Step6Partner } from '../types.ts';
import { calculateProjectScores } from '../utils/scoreCalculator.ts';
import { 
  Coins, 
  Plus, 
  Trash2, 
  Info, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle, 
  Handshake, 
  HelpCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const BUDGET_CATEGORIES = [
  'Оплата труда (с налогами)',
  'Оборудование и техника',
  'Расходные материалы',
  'Аренда помещения',
  'Транспортные расходы',
  'Информационное сопровождение',
  'Прочие расходы',
  'Другое'
];

const PARTNER_SUPPORT_TYPES = [
  'Информационная (репосты, публикации)',
  'Предоставление площадки / помещения',
  'Оборудование / техника в пользование',
  'Консультации экспертов',
  'Волонтёрская помощь',
  'Другое'
];

const TaxHelpTooltip: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mt-3">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
      >
        <HelpCircle size={14} /> Как рассчитать сумму с налогами?
      </button>
      {isOpen && (
        <div className="mt-2 p-4 bg-white border border-indigo-100 rounded-xl text-xs text-indigo-950 leading-relaxed shadow-sm animate-in fade-in slide-in-from-top-1">
          <div className="space-y-3">
            <div>
              <strong className="block mb-1">Если вы привлекаете физлицо по договору ГПХ (самый частый случай):</strong>
              Исполнитель получит на руки сумму, которую вы с ним обговорили. Чтобы рассчитать итоговую статью бюджета, прибавьте к оговорённой сумме налоги и взносы.<br/>
              <span className="text-gray-500 italic">*Пример: если вы договорились с исполнителем на 30 000 руб. на руки, то итоговая статья бюджета должна составить примерно 45 000 руб. (начисленная сумма 34 500 + страховые взносы 10 400).*</span>
            </div>
            <div>
              <strong className="block mb-1">Если исполнитель — самозанятый или ИП:</strong>
              Проверьте, какие налоги он платит сам. Обычно вы просто переводите ему сумму по договору без дополнительных взносов, а он отчитывается сам. Уточните у исполнителя.
            </div>
            <div>
              <strong className="block mb-1">Если это штатный сотрудник организации (для НКО):</strong>
              К сумме зарплаты до вычета НДФЛ прибавьте 30,2% страховых взносов. На руки сотрудник получит зарплату минус 13%.
            </div>
            <div className="pt-2 border-t border-indigo-50 text-[11px] text-gray-500 italic">
              <strong>Важно:</strong> Проконсультируйтесь с бухгалтером вашей организации или исполнителя, чтобы уточнить точные ставки для вашего случая. Фонды проверяют реалистичность бюджета, поэтому цифры должны быть обоснованы.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Step6: React.FC = () => {
  const { data, setData } = useAppContext();

  const budgetItems = data.step6BudgetItems || [];
  const partners = data.step6Partners || [];
  const hasPartners = data.step6HasPartners || false;
  const checklist = data.step6Checklist?.length === 5 ? data.step6Checklist : [false, false, false, false, false];

  // Initialize with one empty row if completely empty
  useEffect(() => {
    if (budgetItems.length === 0) {
      setData(prev => ({
        ...prev,
        step6BudgetItems: [
          { category: '', detail: '', requested: 0, coFinance: 0 }
        ]
      }));
    }
  }, []);

  const handleAddBudgetItem = () => {
    setData(prev => ({
      ...prev,
      step6BudgetItems: [
        ...(prev.step6BudgetItems || []),
        { category: '', detail: '', requested: 0, coFinance: 0 }
      ]
    }));
  };

  const handleUpdateBudgetItem = (index: number, field: keyof Step6BudgetItem, value: any) => {
    setData(prev => {
      const copy = [...(prev.step6BudgetItems || [])];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
      }
      return { ...prev, step6BudgetItems: copy };
    });
  };

  const handleRemoveBudgetItem = (index: number) => {
    setData(prev => {
      const copy = [...(prev.step6BudgetItems || [])];
      copy.splice(index, 1);
      return { ...prev, step6BudgetItems: copy };
    });
  };

  const handlePartnerToggle = (val: boolean) => {
    setData(prev => {
      const nextPartners = val && prev.step6Partners.length === 0 
        ? [{ name: '', supportType: PARTNER_SUPPORT_TYPES[0], description: '' }] 
        : prev.step6Partners;
      return {
        ...prev,
        step6HasPartners: val,
        step6Partners: nextPartners
      };
    });
  };

  const handleAddPartner = () => {
    setData(prev => ({
      ...prev,
      step6Partners: [
        ...(prev.step6Partners || []),
        { name: '', supportType: PARTNER_SUPPORT_TYPES[0], description: '' }
      ]
    }));
  };

  const handleUpdatePartner = (index: number, field: keyof Step6Partner, value: any) => {
    setData(prev => {
      const copy = [...(prev.step6Partners || [])];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
      }
      return { ...prev, step6Partners: copy };
    });
  };

  const handleRemovePartner = (index: number) => {
    setData(prev => {
      const copy = [...(prev.step6Partners || [])];
      copy.splice(index, 1);
      return { ...prev, step6Partners: copy };
    });
  };

  const handleCheck = (index: number) => {
    const nextChecklist = [...checklist];
    nextChecklist[index] = !nextChecklist[index];
    setData(prev => ({
      ...prev,
      step6Checklist: nextChecklist
    }));
  };

  // Backwards compatibility sync logic (sets totalBudget, cofinancing, partners strings in store)
  useEffect(() => {
    const items = data.step6BudgetItems || [];
    let sumGrant = 0;
    let sumCo = 0;
    items.forEach(item => {
      sumGrant += (Number(item.requested) || 0);
      sumCo += (Number(item.coFinance) || 0);
    });

    const partnerSum = data.step6HasPartners ? (data.step6Partners || []).reduce((sum, p) => sum + (Number(p.estimatedValue) || 0), 0) : 0;
    const totalCo = sumCo + partnerSum;

    const sumCost = sumGrant + sumCo; // following the same monetary logic
    const pct = sumCost > 0 ? (totalCo / sumCost) * 100 : 0;

    const formattedGrant = `${sumGrant.toLocaleString('ru-RU')} руб.`;
    const formattedCo = totalCo > 0 
      ? `${totalCo.toLocaleString('ru-RU')} руб. (${Math.round(pct)}%)`
      : '0 руб. (0%)';

    let partnersText = 'Нет сторонних партнеров (неденежной поддержки).';
    if (data.step6HasPartners && (data.step6Partners || []).length > 0) {
      partnersText = (data.step6Partners || [])
        .filter(p => p.name.trim())
        .map(p => `- **${p.name.trim()}** (${p.supportType === 'Другое' && p.customSupportType ? p.customSupportType : p.supportType})${p.description?.trim() ? `: ${p.description.trim()}` : ''}`)
        .join('\n');
    }

    if (
      data.totalBudget !== formattedGrant ||
      data.cofinancing !== formattedCo ||
      data.partners !== partnersText
    ) {
      setData(prev => ({
        ...prev,
        totalBudget: formattedGrant,
        cofinancing: formattedCo,
        partners: partnersText
      }));
    }
  }, [data.step6BudgetItems, data.step6HasPartners, data.step6Partners]);

  // Demo Example Loader
  const handleLoadDemoExample = () => {
    setData(prev => ({
      ...prev,
      step6BudgetItems: [
        {
          category: 'Оплата труда (с налогами)',
          detail: 'Руководитель проекта, 0.5 ставки, 4 месяца (регулярная работа)',
          requested: 104160,
          coFinance: 0
        },
        {
          category: 'Оплата труда (с налогами)',
          detail: 'Приглашённый спикер, 8 занятий по 2 часа (договор ГПХ)',
          requested: 39060,
          coFinance: 0
        },
        {
          category: 'Расходные материалы',
          detail: 'Бумага, маркеры, флипчарты, блокноты для 60 участников',
          requested: 15000,
          coFinance: 0
        },
        {
          category: 'Аренда помещения',
          detail: 'Актовый зал на 4 часа по субботам, 8 занятий',
          requested: 0,
          coFinance: 32000
        },
        {
          category: 'Оборудование и техника',
          detail: 'Проектор (имеется у организации)',
          requested: 0,
          coFinance: 20000
        },
        {
          category: 'Информационное сопровождение',
          detail: 'Таргетированная реклама ВКонтакте для набора участников',
          requested: 10000,
          coFinance: 0
        }
      ],
      step6HasPartners: true,
      step6Partners: [
        {
          name: 'ДК «Современник»',
          supportType: 'Предоставление площадки / помещения',
          description: 'Бесплатно предоставляет актовый зал по субботам с 10:00 до 14:00',
          estimatedValue: 32000
        }
      ],
      step6Checklist: [true, true, true, true, true]
    }));
  };

  // Calculations
  let totalRequested = 0;
  let totalMonetaryCoFinance = 0;
  budgetItems.forEach(item => {
    totalRequested += Number(item.requested) || 0;
    totalMonetaryCoFinance += Number(item.coFinance) || 0;
  });

  const partnerCoFinance = hasPartners ? partners.reduce((sum, p) => sum + (Number(p.estimatedValue) || 0), 0) : 0;
  const totalCoFinance = totalMonetaryCoFinance + partnerCoFinance;
  const totalCost = totalRequested + totalMonetaryCoFinance;
  const percentCoFinance = totalCost > 0 ? (totalCoFinance / totalCost) * 100 : 0;

  // Local scores tracker (matches FinalStep formula exactly)
  const { step6: localScore } = calculateProjectScores(data);

  // Validate to proceed:
  // - At least one budget item has non-zero sum
  // - There are no rows where both fields are 0 (must have nonzero amount in at least one field)
  // - All rows with "Другое" category must have customCategory
  // - All partners with "Другое" supportType must have customSupportType
  // - All 5 checkboxes of checklist are true
  const hasAtLeastOneValidSum = budgetItems.some(item => (Number(item.requested) > 0 || Number(item.coFinance) > 0));
  const noEmptyAmountRows = budgetItems.length > 0 && budgetItems.every(item => (Number(item.requested) > 0 || Number(item.coFinance) > 0));
  const allCustomCategoriesFilled = budgetItems.every(item => item.category !== 'Другое' || Boolean(item.customCategory?.trim()));
  
  const allPartnersValid = !hasPartners || partners.length === 0 || partners.every(p => 
    Number(p.estimatedValue || 0) > 0 && 
    (p.supportType !== 'Другое' || Boolean(p.customSupportType?.trim()))
  );

  const checklistApproved = checklist.every(Boolean);

  const canProceed = hasAtLeastOneValidSum && noEmptyAmountRows && allCustomCategoriesFilled && allPartnersValid && checklistApproved;

  return (
    <StepLayout
      title="На что пойдут средства? Бюджет и поддержка"
      subtitle="Составьте смету, покажите свой вклад и неденежную помощь."
      mentorContent="Бюджет — это ваша репутация. Распишите всё максимально конкретно: не «канцтовары», а «бумага А4, ручки, маркеры на 20 участников». Покажите, что вы понимаете рыночные цены и не завышаете запросы. Обязательно укажите собственный вклад (софинансирование) — это может быть не только деньги, но и техника, помещение, работа волонтёров. Чем больше вы вкладываете сами, тем выше доверие эксперта. Для большинства фондов желательно софинансирование от 25%."
      canProceed={canProceed}
      progressScore={localScore}
      progressMax={8}
    >
      <div className="space-y-10">

        {/* Dynamic header row with advice & demo options */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] items-start gap-4 bg-slate-50 p-4 shrink-0 rounded-[24px] border border-gray-100">
          <div className="text-xs text-gray-700 space-y-2 bg-white/60 p-3 rounded-xl border border-slate-200/60 leading-relaxed shadow-sm">
            <p className="font-semibold text-gray-900 mb-1">Пример расчёта статьи «Оплата труда»:</p>
            <p>
              <strong className="font-medium text-gray-800">Руководитель проекта:</strong> 0,5 ставки, 4 месяца. Начисленная зарплата: 80 000 руб., страховые взносы 30,2%: 24 160 руб. Итого для бюджета: <strong className="text-indigo-700 font-semibold">104 160 руб.</strong> (сотрудник получает на руки 69 600 руб.)
            </p>
            <p>
              <strong className="font-medium text-gray-800">Приглашённый спикер:</strong> 8 занятий по 2 часа. Вознаграждение: 30 000 руб., страховые взносы 30,2%: 9 060 руб. Итого для бюджета: <strong className="text-indigo-700 font-semibold">39 060 руб.</strong> (спикер получает на руки 26 100 руб.)
            </p>
          </div>
          
          <button
            onClick={handleLoadDemoExample}
            className="flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 mt-1 rounded-xl border border-teal-200 transition-all shadow-sm w-full xl:w-auto h-fit justify-center self-start"
          >
            <Sparkles size={14} className="text-teal-600" />
            Заполнить примером
          </button>
        </div>

        {/* BLOCK 1: BUDGET TABLE */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Coins className="text-cyan-500" size={20} />
              1. Таблица бюджета проекта
            </h3>
            <span className="text-xs text-red-500 font-medium">* Все строки и детализация обязательны</span>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden bg-white border border-gray-200 rounded-[24px] shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                  <th className="py-4 px-4 w-[34%]">Статья расходов</th>
                  <th className="py-4 px-4 w-[36%]">Детализация (что именно покупается)</th>
                  <th className="py-4 px-4 w-[13%] text-right">У фонда, руб.</th>
                  <th className="py-4 px-4 w-[13%] text-right">Софинанс., руб.</th>
                  <th className="py-4 px-3 text-center w-[4%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {budgetItems.map((item, idx) => {
                  const isRowEmpty = Number(item.requested) === 0 && Number(item.coFinance) === 0;

                  return (
                    <React.Fragment key={idx}>
                      <tr className={`group hover:bg-slate-50/50 transition-colors ${isRowEmpty ? 'bg-red-50/30' : ''}`}>
                        {/* Dropdown column */}
                        <td className="py-4 px-4 align-top">
                          <select
                            value={item.category}
                            onChange={(e) => {
                              handleUpdateBudgetItem(idx, 'category', e.target.value);
                              if (e.target.value !== 'Другое') {
                                handleUpdateBudgetItem(idx, 'customCategory', '');
                              }
                            }}
                            className="w-full sleek-input rounded-xl p-2.5 text-sm focus:ring-cyan-500 focus:border-cyan-500 border-gray-300 bg-white"
                            required
                          >
                            <option value="">Выберите статью...</option>
                            {BUDGET_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          {item.category === 'Другое' && (
                            <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                              <textarea
                                value={item.customCategory || ''}
                                onChange={(e) => handleUpdateBudgetItem(idx, 'customCategory', e.target.value)}
                                placeholder="Например, банковские комиссии"
                                className="w-full sleek-input rounded-xl p-2.5 text-sm border-amber-300 focus:ring-amber-500 focus:border-amber-500 bg-white resize-y"
                                rows={2}
                                required
                              />
                            </div>
                          )}
                        </td>

                        {/* Detail text input */}
                        <td className="py-4 px-4 align-top">
                          <textarea
                            value={item.detail}
                            onChange={(e) => handleUpdateBudgetItem(idx, 'detail', e.target.value)}
                            placeholder="Например: Руководитель проекта, 0.5 ставки, 4 месяца..."
                            className="w-full sleek-input rounded-xl p-2.5 text-sm focus:ring-cyan-500 focus:border-cyan-500 border-gray-300 bg-white min-h-[80px] resize-y"
                            rows={4}
                            required
                          />
                          {item.category === 'Оплата труда (с налогами)' && (
                            <TaxHelpTooltip />
                          )}
                        </td>

                        {/* Requested */}
                        <td className="py-4 px-4 align-top">
                          <input
                            type="number"
                            value={item.requested === 0 ? '' : item.requested}
                            onChange={(e) => handleUpdateBudgetItem(idx, 'requested', Math.max(0, parseInt(e.target.value, 10) || 0))}
                            placeholder="0"
                            className="w-full sleek-input rounded-xl p-2.5 text-sm text-right font-semibold border-gray-300 focus:ring-cyan-500"
                          />
                        </td>

                        {/* CoFinance */}
                        <td className="py-4 px-4 align-top">
                          <input
                            type="number"
                            value={item.coFinance === 0 ? '' : item.coFinance}
                            onChange={(e) => handleUpdateBudgetItem(idx, 'coFinance', Math.max(0, parseInt(e.target.value, 10) || 0))}
                            placeholder="0"
                            className="w-full sleek-input rounded-xl p-2.5 text-sm text-right font-semibold border-gray-300 focus:ring-cyan-500"
                          />
                        </td>

                        {/* Delete row */}
                        <td className="py-4 px-3 text-center align-top">
                          {budgetItems.length > 1 && (
                            <button
                              onClick={() => handleRemoveBudgetItem(idx)}
                              className="mt-1 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Удалить строку"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Vertical Cards */}
          <div className="md:hidden space-y-4">
            {budgetItems.map((item, idx) => {
              const isRowEmpty = Number(item.requested) === 0 && Number(item.coFinance) === 0;

              return (
                <div key={idx} className={`bg-white border p-4 rounded-2xl shadow-xs space-y-3 relative ${isRowEmpty ? 'border-red-200 bg-red-50/10' : 'border-gray-100'}`}>
                  {budgetItems.length > 1 && (
                    <button
                      onClick={() => handleRemoveBudgetItem(idx)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg p-1.5 transition-all"
                      title="Удалить статью"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Статья расходов:</label>
                    <select
                      value={item.category}
                      onChange={(e) => {
                        handleUpdateBudgetItem(idx, 'category', e.target.value);
                        if (e.target.value !== 'Другое') {
                          handleUpdateBudgetItem(idx, 'customCategory', '');
                        }
                      }}
                      className="w-full sleek-input rounded-xl p-2.5 text-sm focus:ring-cyan-500 border-gray-300 bg-white"
                    >
                      <option value="">Выберите статью...</option>
                      {BUDGET_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {item.category === 'Другое' && (
                      <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                        <textarea
                          value={item.customCategory || ''}
                          onChange={(e) => handleUpdateBudgetItem(idx, 'customCategory', e.target.value)}
                          placeholder="Например, банковские комиссии"
                          className="w-full sleek-input rounded-xl p-2.5 text-sm border-amber-300 focus:ring-amber-500 focus:border-amber-500 bg-white resize-y"
                          rows={2}
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Детализация:</label>
                    <textarea
                      value={item.detail}
                      onChange={(e) => handleUpdateBudgetItem(idx, 'detail', e.target.value)}
                      placeholder="Что именно покупается / оплачивается..."
                      className="w-full sleek-input rounded-xl p-2.5 text-sm focus:ring-cyan-500 border-gray-300 bg-white min-h-[80px] resize-y"
                      rows={4}
                    />
                    {item.category === 'Оплата труда (с налогами)' && (
                      <TaxHelpTooltip />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Фонд, руб.:</label>
                      <input
                        type="number"
                        value={item.requested === 0 ? '' : item.requested}
                        onChange={(e) => handleUpdateBudgetItem(idx, 'requested', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        placeholder="0"
                        className="w-full sleek-input rounded-xl p-2.5 text-sm font-semibold border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Софинанс, руб.:</label>
                      <input
                        type="number"
                        value={item.coFinance === 0 ? '' : item.coFinance}
                        onChange={(e) => handleUpdateBudgetItem(idx, 'coFinance', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        placeholder="0"
                        className="w-full sleek-input rounded-xl p-2.5 text-sm font-semibold border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <button
              onClick={handleAddBudgetItem}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 py-3 px-5 rounded-2xl transition shadow-xs"
            >
              <PlusCircle size={15} />
              + Добавить статью расходов
            </button>

            {!noEmptyAmountRows && (
              <span className="text-xs text-red-500 font-medium flex items-center gap-1 justify-center sm:justify-start">
                <AlertCircle size={13} />
                Каждая статья должна иметь сумму {`>`} 0 в одном из полей!
              </span>
            )}
          </div>

          {/* CALCULATOR COLORFUL BOARD */}
          <div className="bg-slate-50 rounded-[28px] p-6 border border-gray-100 shadow-xs space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Общая стоимость</span>
                <p className="text-lg md:text-xl font-black text-gray-900 mt-1">
                  {totalCost.toLocaleString('ru-RU')} <span className="text-xs font-normal text-gray-400">руб.</span>
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-600">Запрос у фонда</span>
                <p className="text-lg md:text-xl font-black text-cyan-500 mt-1">
                  {totalRequested.toLocaleString('ru-RU')} <span className="text-xs font-normal text-gray-400">руб.</span>
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600">Софинансирование</span>
                <p className="text-lg md:text-xl font-black text-teal-600 mt-1">
                  {totalCoFinance.toLocaleString('ru-RU')} <span className="text-xs font-normal text-gray-400">руб.</span>
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-600">Доля вклада</span>
                <p className="text-lg md:text-xl font-black text-violet-600 mt-1">
                  {Math.round(percentCoFinance)}%
                </p>
              </div>
            </div>

            {/* Indicator Notification */}
            {totalCost === 0 ? (
              <div className="flex items-center gap-3 bg-gray-100/70 p-4 rounded-2xl border border-gray-200/50 text-gray-500 text-xs">
                <Info size={16} />
                <span>Заполните числовые поля бюджета (столбцы «У фонда» и «Софинансирование»), чтобы рассчитать долю вклада и увидеть оценку.</span>
              </div>
            ) : percentCoFinance >= 25 ? (
              <div className="flex items-start gap-3 bg-green-50 text-green-800 p-4 rounded-2xl border border-green-100">
                <span className="text-2xl pt-0.5" role="img" aria-label="smiley">😊</span>
                <div className="text-xs space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-green-900 text-sm">
                    Хороший уровень софинансирования (≥25%)!
                  </span>
                  <p className="opacity-90 leading-relaxed font-normal">
                    Ваш вклад и помощь партнёров составляют <strong>{Math.round(percentCoFinance)}%</strong> от общего бюджета. Это доказывает финансовую надёжность проекта и существенно укрепляет доверие грантовых экспертов.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 bg-amber-50 text-amber-800 p-4 rounded-2xl border border-amber-100">
                <span className="text-2xl pt-0.5" role="img" aria-label="warning">😐</span>
                <div className="text-xs space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-amber-900 text-sm">
                    Рекомендуемый уровень софинансирования — от 25%!
                  </span>
                  <p className="opacity-90 leading-relaxed font-normal">
                    Текущая доля составляет <strong>{Math.round(percentCoFinance)}%</strong>. Подумайте, что ещё вы или партнёры можете внести в качестве софинансирования: это может быть оценка волонтёрского труда, предоставленные площади, материально-техническая база или бесплатные консультации.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BLOCK 2: PARTNERS AND NON-MONETARY SUPPORT */}
        <div className="pt-8 border-t border-gray-100 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Handshake className="text-cyan-500" size={20} />
                2. Партнёры (неденежная поддержка)
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Есть ли организации или люди, которые помогают проекту бесплатно?
              </p>
            </div>

            {/* Custom Checkbox as Switch Button */}
            <label className="flex items-center gap-3 bg-slate-50 border border-gray-100 px-4 py-2.5 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition self-start sm:self-auto shrink-0">
               <input
                 type="checkbox"
                 checked={hasPartners}
                 onChange={(e) => handlePartnerToggle(e.target.checked)}
                 className="rounded h-4.5 w-4.5 focus:ring-cyan-500 text-cyan-500 border-gray-300"
               />
               <span className="text-xs font-bold text-gray-800">Да, есть партнёры</span>
            </label>
          </div>

          {hasPartners && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partners.map((partner, pIdx) => (
                  <div key={pIdx} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs relative space-y-4 hover:border-cyan-200 transition-all">
                    {partners.length > 1 && (
                      <button
                        onClick={() => handleRemovePartner(pIdx)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-all"
                        title="Удалить партнёра"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Название организации / ФИО партнёра:</label>
                      <input
                        type="text"
                        value={partner.name || ''}
                        onChange={(e) => handleUpdatePartner(pIdx, 'name', e.target.value)}
                        placeholder="Например: ДК «Современник»"
                        className="w-full sleek-input rounded-xl p-2.5 text-xs focus:ring-cyan-500 border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Тип поддержки:</label>
                      <select
                        value={partner.supportType}
                        onChange={(e) => {
                          handleUpdatePartner(pIdx, 'supportType', e.target.value);
                          if (e.target.value !== 'Другое') {
                            handleUpdatePartner(pIdx, 'customSupportType', '');
                          }
                        }}
                        className="w-full sleek-input rounded-xl p-2.5 text-xs focus:ring-cyan-500 border-gray-300 bg-white"
                        required
                      >
                        {PARTNER_SUPPORT_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {partner.supportType === 'Другое' && (
                        <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                          <input
                            type="text"
                            value={partner.customSupportType || ''}
                            onChange={(e) => handleUpdatePartner(pIdx, 'customSupportType', e.target.value)}
                            placeholder="Укажите тип поддержки"
                            className="w-full sleek-input rounded-xl p-2.5 text-xs border-amber-300 focus:ring-amber-500 focus:border-amber-500 bg-white"
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Оценочная стоимость поддержки (руб.):</label>
                      <input
                        type="number"
                        value={partner.estimatedValue === 0 ? '' : (partner.estimatedValue || '')}
                        onChange={(e) => handleUpdatePartner(pIdx, 'estimatedValue', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        placeholder="Например, 32000"
                        className="w-full sleek-input rounded-xl p-2.5 text-xs focus:ring-cyan-500 border-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Что именно делает (краткое описание, необязательно):</label>
                      <textarea
                        value={partner.description || ''}
                        onChange={(e) => handleUpdatePartner(pIdx, 'description', e.target.value)}
                        placeholder="Например: Бесплатно предоставляет актовый зал по субботам с 10:00 до 14:00."
                        className="w-full sleek-input rounded-xl p-2.5 text-xs focus:ring-cyan-500 border-gray-300 min-h-[80px] resize-y"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddPartner}
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 py-3 px-5 rounded-2xl transition"
              >
                <Plus size={14} />
                + Добавить партнёра
              </button>
            </div>
          )}
        </div>

        {/* BLOCK 3: CHECKLIST VALIDATION */}
        <div className="pt-8 border-t border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CheckCircle className="text-cyan-500" size={20} />
            3. Обязательный чек-лист проверки бюджета
          </h3>
          
          <div className="space-y-3 bg-gray-50/70 p-5 rounded-[24px] border border-gray-100">
            {[
              'Все расходы расписаны подробно (нет непонятных «прочих» статей без уточнений).',
              'Указан мой вклад или вклад партнёров (софинансирование).',
              'Я проверил(а), что зарплаты указаны с учётом налогов (НДФЛ 13%, страховые взносы 30,2% от суммы до вычета).',
              'Каждая задача проекта обеспечена финансированием (проверьте по плану из шага 5).',
              'Партнёры подтвердили поддержку письменно (письма приложены к заявке).'
            ].map((text, idx) => (
              <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded text-cyan-500 focus:ring-cyan-500 border-gray-300 h-5 w-5 mt-0.5 cursor-pointer"
                  checked={checklist[idx] || false}
                  onChange={() => handleCheck(idx)}
                />
                <span className={`text-xs md:text-sm leading-relaxed select-none ${checklist[idx] ? 'text-gray-900 font-semibold' : 'text-gray-600 group-hover:text-gray-800'}`}>
                  {text}
                </span>
              </label>
            ))}
          </div>

          {!checklistApproved && (
            <div className="text-xs text-red-500 font-semibold flex items-center gap-1.5 justify-center sm:justify-start bg-red-50 p-3 rounded-2xl max-w-fit border border-red-100">
              <AlertCircle size={14} />
              Пожалуйста, отметьте все 5 пунктов чек-листа для продолжения!
            </div>
          )}
        </div>

        {/* BLOCK 4: PREVIEW */}
        <div className="pt-8 border-t border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-cyan-500" size={20} />
            4. Предпросмотр для заявки
          </h3>
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4 font-serif text-sm text-gray-800 leading-relaxed max-w-4xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Coins size={120} />
            </div>
            <p>
              <strong>Бюджет проекта:</strong><br />
              Общая стоимость — {totalCost.toLocaleString('ru-RU')} руб., 
              запрашивается у фонда — {totalRequested.toLocaleString('ru-RU')} руб., 
              софинансирование — {totalCoFinance.toLocaleString('ru-RU')} руб. 
              ({percentCoFinance > 0 ? Math.round(percentCoFinance) : 0}%).
            </p>
            <p>
              <strong>Основные статьи расходов:</strong>{' '}
              {budgetItems.filter(i => (Number(i.requested) + Number(i.coFinance)) > 0).map(item => {
                const title = item.category === 'Другое' && item.customCategory ? item.customCategory : item.category;
                const cost = (Number(item.requested) || 0) + (Number(item.coFinance) || 0);
                return `${title.toLowerCase()} — ${cost.toLocaleString('ru-RU')} руб.`;
              }).join('; ')}
              {budgetItems.some(i => (Number(i.requested) + Number(i.coFinance)) > 0) ? '.' : 'Нет данных.'}
            </p>
            {hasPartners && partners.length > 0 && (
              <p>
                <strong>Партнёрская поддержка:</strong><br />
                {partners.map((p, idx) => {
                  const type = p.supportType === 'Другое' && p.customSupportType ? p.customSupportType : p.supportType;
                  const estimated = Number(p.estimatedValue) || 0;
                  return (
                    <span key={idx} className="block">
                      {p.name || 'Без названия'} предоставляет {type.toLowerCase()} 
                      (оценка вклада — {estimated.toLocaleString('ru-RU')} руб.).
                    </span>
                  );
                })}
              </p>
            )}
          </div>
        </div>

      </div>
    </StepLayout>
  );
};
