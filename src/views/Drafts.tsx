import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderOpen, Plus, Trash2, Clock, Check, X, AlertTriangle, Star } from 'lucide-react';
import { DraftStorage, DraftEntry } from '../utils/indexedDb.ts';
import { useAppContext } from '../store.tsx';

export const Drafts: React.FC = () => {
  const { setStep, clearForm, loadDraft } = useAppContext();
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showClearAll, setShowClearAll] = useState(false);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    fetchDrafts();
  }, []);

  const FUNDS = [
    { id: 'presidential_grants', label: 'Фонд президентских грантов' },
    { id: 'presidential_cultural', label: 'Президентский фонд культурных инициатив' },
    { id: 'rosmolodezh', label: 'Росмолодёжь.Гранты' },
    { id: 'other', label: 'Другой фонд' },
  ];

  const getFundLabel = (fundId: string, customFund?: string) => {
    const fund = FUNDS.find(f => f.id === fundId);
    if (!fund) return customFund || fundId || 'Неизвестный фонд';
    if (fund.id === 'other') return customFund || 'Другой фонд';
    return fund.label;
  };

  const getShortFund = (fundId: string) => {
    const map: Record<string, string> = {
      'presidential_grants': 'ФПГ',
      'presidential_cultural': 'ПФКИ',
      'rosmolodezh': 'РОСМОЛОДЕЖЬ',
      'other': 'ДРУГОЙ'
    };
    return map[fundId] || fundId;
  };

  const filteredDrafts = React.useMemo(() => {
    let result = [...drafts];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => (d.name || '').toLowerCase().includes(q));
    }
    
    if (showFavoritesOnly) {
      result = result.filter(d => d.isFavorite);
    }
    
    result.sort((a, b) => {
      if (sortOrder === 'newest') return b.lastModified - a.lastModified;
      return a.lastModified - b.lastModified;
    });
    
    return result;
  }, [drafts, searchQuery, showFavoritesOnly, sortOrder]);


  const fetchDrafts = async () => {
    setIsLoading(true);
    try {
      const list = await DraftStorage.getAll();
      
      // Migration: fix missing fields
      const updatedList = await Promise.all(list.map(async (draft) => {
        let needsUpdate = false;
        if (draft.requiredScore === undefined) {
          const { calculateProjectScores } = await import('../utils/scoreCalculator.ts');
          const scores = calculateProjectScores(draft.stepsData);
          draft.requiredScore = scores.required;
          needsUpdate = true;
        }
        
        const isValidFund = (f: string) => FUNDS.some(fund => fund.id === f);
        
        if (!draft.fund || !draft.sphere || !isValidFund(draft.fund)) {
          // Attempt to fix from stepsData - assuming step1Data or step2Data structure
          const stepsData = draft.stepsData as any;
          
          if (!draft.fund || !isValidFund(draft.fund)) {
            const rawFund = stepsData.selectedFund || stepsData.step1Data?.fund || draft.fund || "";
            // map label to id
            const foundFund = FUNDS.find(f => f.label === rawFund || f.id === rawFund);
            draft.fund = foundFund ? foundFund.id : 'other';
            if (!foundFund && rawFund && rawFund !== 'other') (draft as any).customFund = rawFund;
            needsUpdate = true;
          }
          if (!draft.sphere) {
            draft.sphere = stepsData.projectSphereName || stepsData.step2Data?.sphere || "";
            needsUpdate = true;
          }
        }
        
        if (needsUpdate) {
          await DraftStorage.save(draft);
        }
        return draft;
      }));
      
      setDrafts(updatedList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (id: string) => {
    const draft = drafts.find(d => d.id === id);
    if (draft) {
      const updatedDraft = { ...draft, isFavorite: !draft.isFavorite };
      setDrafts(prev => prev.map(d => d.id === id ? updatedDraft : d));
      await DraftStorage.save(updatedDraft);
    }
  };

  const handleDelete = async (id: string) => {
    await DraftStorage.delete(id);
    setDeleteId(null);
    fetchDrafts();
  };

  const handleClearAll = async () => {
    for (const draft of drafts) {
      await DraftStorage.delete(draft.id);
    }
    setShowClearAll(false);
    fetchDrafts();
  };

  const handleContinue = async (id: string) => {
    await loadDraft(id);
  };

  const handleNew = () => {
    clearForm();
    // clearForm sets step to 1
  };

  const getFundColor = (fundId: string) => {
    switch (fundId) {
      case 'presidential_grants': return 'bg-red-100 text-red-700';
      case 'presidential_cultural': return 'bg-teal-100 text-teal-700';
      case 'rosmolodezh': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'bg-emerald-500';
    if (percent >= 40) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl w-full mx-auto pb-16 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <FolderOpen className="text-cyan-600" size={32} />
            Мои заявки
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-medium mt-2 max-w-xl">
            Все черновики хранятся только в этом браузере. Чтобы не потерять прогресс, не очищайте данные сайта.
          </p>
        </div>
        
        {drafts.length > 0 && (
          <button
            onClick={handleNew}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <Plus size={18} />
            Новая заявка
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
        </div>
      ) : drafts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-10 md:p-16 border border-gray-200 shadow-sm flex flex-col items-center text-center max-w-2xl mx-auto"
        >
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <FolderOpen size={48} className="text-gray-300" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
            У вас пока нет ни одной заявки
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-medium mb-8 max-w-md leading-relaxed">
            Начните прямо сейчас — это бесплатно, данные сохраняются автоматически. На создание основы проекта уйдет около 15 минут.
          </p>
          <button
            onClick={handleNew}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white text-base font-bold rounded-xl transition shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            <Plus size={20} />
            Создать заявку
          </button>
        </motion.div>
      ) : (
        <>
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text"
                placeholder="Поиск по названию заявки"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition"
              />
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition ${showFavoritesOnly ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              >
                <Star size={18} className={showFavoritesOnly ? 'fill-amber-400 text-amber-400' : 'text-gray-400'} />
                Только избранные
              </button>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white"
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
              </select>
            </div>
            
            {(searchQuery || showFavoritesOnly || sortOrder !== 'newest') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setShowFavoritesOnly(false);
                  setSortOrder('newest');
                }} 
                className="text-xs font-bold text-gray-400 hover:text-red-500 text-sm"
              >
                Сбросить всё
              </button>
            )}
            
            <div className="text-sm text-gray-500">
               Найдено: <strong className="text-gray-900">{filteredDrafts.length}</strong> из <strong className="text-gray-900">{drafts.length}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredDrafts.length === 0 ? (
                <div className="col-span-full py-10 text-center text-gray-500">
                  Ничего не найдено. Попробуйте изменить запрос или сбросить фильтры.
                </div>
              ) : (
                filteredDrafts.map((draft, idx) => {
                  const stepsDone = Math.min(8, Math.max(1, draft.currentStep));
                  const isCompleted = stepsDone === 8;
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      key={draft.id}
                      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all flex flex-col relative group"
                    >
                      <h3 className={`text-lg font-bold mb-3 line-clamp-2 pr-10 ${!draft.name ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                        {draft.name || 'Без названия'}
                      </h3>
                      
                      <button
                        onClick={() => toggleFavorite(draft.id)}
                        className={`absolute top-5 right-5 p-2 rounded-full transition ${draft.isFavorite ? 'text-amber-400' : 'text-gray-300 hover:text-amber-400'}`}
                      >
                        <Star size={20} fill={draft.isFavorite ? "currentColor" : "none"} />
                      </button>
                      
                       <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getFundColor(draft.fund || 'other')} uppercase tracking-wide truncate max-w-full`}>
                          {getShortFund(draft.fund || 'other')}
                        </span>
                        {draft.sphere && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 uppercase tracking-wide truncate max-w-[150px]">
                            {draft.sphere}
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-gray-700">
                            {isCompleted ? 'Завершено (8/8)' : `Пройдено шагов: ${stepsDone}/8`}
                          </span>
                          {isCompleted && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                        </div>
                      </div>

                      {draft.shortDescription && (
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4 flex-1">
                          {draft.shortDescription}
                        </p>
                      )}
                      
                      <div className="mt-auto pt-4 border-t border-gray-100/60">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium mb-4">
                          <Clock size={12} />
                          {formatDate(draft.lastModified)}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleContinue(draft.id)}
                            className="flex-1 bg-gray-900 hover:bg-gray-800 active:scale-95 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                          >
                            Продолжить
                          </button>
                          <button
                            onClick={() => setDeleteId(draft.id)}
                            className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Удалить черновик"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setShowClearAll(true)}
              className="text-xs font-bold text-gray-400 hover:text-red-500 underline decoration-gray-300 hover:decoration-red-300 underline-offset-4 transition cursor-pointer"
            >
              Удалить все черновики
            </button>
          </div>
        </>
      )}

      {/* Delete Item Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setDeleteId(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 text-center"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Удалить заявку?</h3>
              <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
                Вы уверены, что хотите удалить этот черновик? Это действие нельзя отменить.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition cursor-pointer shadow-md shadow-red-600/20"
                >
                  Удалить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear All Modal */}
      <AnimatePresence>
        {showClearAll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setShowClearAll(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 text-center"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Очистить всё?</h3>
              <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
                Вы уверены, что хотите удалить ВСЕ черновики? Восстановить их будет невозможно.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearAll(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition cursor-pointer shadow-md shadow-red-600/20"
                >
                  Удалить всё
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
