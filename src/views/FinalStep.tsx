import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store.tsx';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  Download, 
  ExternalLink, 
  Bot, 
  FileText, 
  Check, 
  Award, 
  BarChart2, 
  HelpCircle, 
  X, 
  CheckSquare, 
  Square,
  ChevronDown,
  ChevronUp,
  Save,
  Trash2,
  FolderOpen,
  PlusCircle,
  Undo2,
  ListRestart,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { generateCleanDraft } from '../utils/draftAggregator.ts';
import { getAllDrafts, saveDraftToDB, deleteDraftFromDB, DraftEntry } from '../utils/indexedDb.ts';
import { calculateProjectScores } from '../utils/scoreCalculator.ts';

export const FinalStep: React.FC = () => {
  const { data, setData, setStep, clearForm, step } = useAppContext();
  
  const [draftContent, setDraftContent] = useState('');
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [showNewProjectConfirm, setShowNewProjectConfirm] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);
  const [aliceMode, setAliceMode] = useState(false);
  const [aliceInput, setAliceInput] = useState('');
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  
  // Custom toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  
  // State for IndexedDB drafts list
  const [draftsList, setDraftsList] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Interactive self-review checklists (not saved, just for current screen verification, Блок 4)
  const [localMemoChecks, setLocalMemoChecks] = useState<boolean[]>([
    false, false, false, false, false, false, false, false
  ]);

  const memoCheckTexts = [
    "Название проекта отражает его суть и цели выбранной темы конкурса (Шаг 1).",
    "Проверены все формальные требования фонда (статус заявителя, возраст участников, сроки).",
    "Бюджет сходится, все статьи расшифрованы, налоги учтены.",
    "Календарный план реален по срокам, нет пересечений с праздниками/каникулами.",
    "К каждому этапу указаны подтверждающие материалы (фото, списки, анкеты).",
    "Опыт команды описан конкретно, с цифрами и примерами.",
    "В тексте нет «воды», общих фраз и необоснованных обещаний.",
    "Я проанализировал(а) заявку с помощью DeepSeek и вручную исправил(а) все указанные им слабые места."
  ];

  // Load draft text on mount and database contents
  useEffect(() => {
    setDraftContent(generateCleanDraft(data));
    loadSavedDrafts();
  }, [data]);

  const loadSavedDrafts = async () => {
    try {
      const list = await getAllDrafts();
      setDraftsList(list);
    } catch (e) {
      console.error("Failed to load drafts list:", e);
    }
  };

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 4500);
  };

  const handleToggleMemo = (index: number) => {
    setLocalMemoChecks(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const currentDisplayContent = aliceMode && aliceInput ? aliceInput : draftContent;

  const baseScores = calculateProjectScores(data);
  const scores = (step === 8) 
    ? { ...baseScores, total: baseScores.maxTotal, totalChecks: baseScores.maxChecklists }
    : baseScores;
  const displayPercent = Math.min(Math.round((scores.total / scores.maxTotal) * 100), 100);

  const getProgressMessage = (percent: number) => {
    if (scores.total < scores.maxTotal) {
      return "Этот показатель отражает глубину проработки заявки: учтены ли рекомендации, партнёры, софинансирование и другие улучшения. Обязательные разделы уже заполнены на 100%. Выполните рекомендации ниже, чтобы повысить качество.";
    } else {
      return "Все рекомендации выполнены, заявка проработана максимально подробно. Этот показатель отражает глубину проработки заявки. Обязательные разделы заполнены на 100%.";
    }
  };

  const getDeepSeekPrompt = () => {
    return `Ты — эксперт грантового конкурса. Проанализируй заявку по критериям:

- Актуальность и доказанность проблемы (факты, источники).
- Чёткость аудитории и обоснованность охвата.
- Логичность и измеримость плана.
- Реалистичность и детализация бюджета, наличие софинансирования.
- Компетентность команды и соответствие ролей задачам.

Выставь оценку по 10-балльной шкале для каждого критерия. Укажи 3 главные слабые стороны и дай рекомендации. Говори прямо, без комплиментов.

[Текст заявки]
${draftContent}`;
  };

  const handleDeepSeekCopy = () => {
    try {
      navigator.clipboard.writeText(getDeepSeekPrompt());
      triggerToast("Текст скопирован. Сейчас откроется чат DeepSeek.");
      setTimeout(() => {
        window.open('https://chat.deepseek.com', '_blank');
      }, 1000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      triggerToast("Не удалось скопировать автоматически. Выделите предпросмотр вручную.");
    }
  };

  const downloadWord = async () => {
    try {
      const { exportToDocx } = await import('../utils/exportDocx.ts');
      await exportToDocx(currentDisplayContent, `${data.projectTitle || 'Grant_Application'}.docx`);
      triggerToast("Файл .docx сгенерирован в Times New Roman 14!");
    } catch (e) {
      console.error(e);
      triggerToast("Ошибка при экспорте в Microsoft Word");
    }
  };

  // --- IndexedDB Action Handlers ---
  const handleSaveAsDraft = async () => {
    setIsSaving(true);
    const title = data.projectTitle?.trim() || "Проект без названия";
    const scores = calculateProjectScores(data);
    let draftId = localStorage.getItem("current_draft_id");
    if (!draftId) {
      draftId = "draft_" + Date.now();
      localStorage.setItem("current_draft_id", draftId);
    }
    
    try {
      await saveDraftToDB(draftId, title, data, scores.required);
      await loadSavedDrafts();
      triggerToast("Черновик успешно сохранён в IndexedDB.");
    } catch (err) {
      console.error(err);
      triggerToast("Возникла ошибка при сохранении черновика.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDraft = async (draft: any) => {
    let requiredScore = draft.requiredScore;

    if (requiredScore === undefined) {
      requiredScore = calculateProjectScores(draft.data).required;
      // Optionally save it
    }

    setData(draft.data);
    localStorage.setItem("current_draft_id", draft.id);
    triggerToast(`Черновик "${draft.title}" успешно загружен.`);
  };

  const handleDeleteDraft = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent loading
    setDraftToDelete(id);
  };

  const confirmDeleteDraft = async () => {
    if (!draftToDelete) return;
    try {
      await deleteDraftFromDB(draftToDelete);
      const currentId = localStorage.getItem("current_draft_id");
      if (currentId === draftToDelete) {
        localStorage.removeItem("current_draft_id");
      }
      await loadSavedDrafts();
      triggerToast("Черновик успешно удалён.");
    } catch (err) {
      console.error(err);
      triggerToast("Не удалось удалить черновик.");
    } finally {
      setDraftToDelete(null);
    }
  };

  const startNewProject = () => {
    setShowNewProjectConfirm(true);
  };

  const confirmStartNewProject = () => {
    localStorage.removeItem("current_draft_id");
    clearForm();
    setShowNewProjectConfirm(false);
    setStep(1);
  };

  // --- Radar chart SVG parameters (normalized to percentages) ---
  const cx = 150;
  const cy = 135;
  const R = 85;

  const radarCriteria = [
    { label: "Актуальность", score: (scores.step4 / 20) * 100, original: `${scores.step4}/20` },
    { label: "Аудитория", score: (scores.step3Total / 15) * 100, original: `${scores.step3Total}/15` },
    { label: "План", score: (scores.step5 / 20) * 100, original: `${scores.step5}/20` },
    { label: "Бюджет", score: (scores.step6Total / 20) * 100, original: `${scores.step6Total}/20` },
    { label: "Команда", score: (scores.step7Total / 15) * 100, original: `${scores.step7Total}/15` },
    { label: "Чек-листы", score: (scores.totalChecks / scores.maxChecklists) * 100, original: `${scores.totalChecks}/${scores.maxChecklists}` }
  ];

  const getRadarGridPolygons = () => {
    const layers = [25, 50, 75, 100];
    return layers.map((layer) => {
      const points = radarCriteria.map((_, idx) => {
        const theta = idx * (2 * Math.PI / 6) - Math.PI / 2;
        const currentR = R * (layer / 100);
        const xCoord = cx + currentR * Math.cos(theta);
        const yCoord = cy + currentR * Math.sin(theta);
        return `${xCoord},${yCoord}`;
      }).join(' ');
      return <polygon key={layer} points={points} fill="none" stroke="#E2E8F0" strokeWidth="1" />;
    });
  };

  const getRadarValuePoints = () => {
    const pointsArray = radarCriteria.map((item, idx) => {
      const theta = idx * (2 * Math.PI / 6) - Math.PI / 2;
      const scoreRatio = item.score / 100;
      const currentR = R * Math.max(0.06, scoreRatio); // prevent overlapping points
      const xCoord = cx + currentR * Math.cos(theta);
      const yCoord = cy + currentR * Math.sin(theta);
      return { x: xCoord, y: yCoord };
    });

    const pointsString = pointsArray.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <>
        <polygon 
          points={pointsString} 
          fill="rgba(6, 182, 212, 0.12)" 
          stroke="rgb(6, 182, 212)" 
          strokeWidth="2" 
          strokeLinejoin="round" 
        />
        {pointsArray.map((p, idx) => (
          <circle 
            key={idx} 
            cx={p.x} 
            cy={p.y} 
            r="4" 
            fill="rgb(6, 182, 212)" 
            stroke="#FFFFFF" 
            strokeWidth="1.5"
          />
        ))}
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-[1400px] w-full mx-auto pb-16 px-4 md:px-6"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -45, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -45, x: "-50%" }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-800 text-white shadow-2xl px-6 py-4 rounded-xl flex items-center gap-3 z-50 text-xs md:text-sm font-semibold max-w-md text-center"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center shrink-0">
              <Check size={12} className="stroke-[3]" />
            </div>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-2">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Ваша заявка готова
        </h2>
        <p className="text-gray-500 text-sm md:text-base font-medium max-w-2xl md:text-right">
          Просмотрите итоговый документ и решите, что делать дальше.
        </p>
      </div>

      <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4 text-left shadow-sm">
        <HelpCircle className="text-amber-600 shrink-0 mt-1" size={24} />
        <p className="text-sm font-medium text-amber-900 leading-relaxed">
          «Вы прошли весь путь! Теперь у вас есть структурированная заявка. Не отправляйте её сразу — дайте тексту «отлежаться», а затем перечитайте свежим взглядом. Обязательно проверьте бюджет и логику плана. Используйте анализ нейросети: она найдёт слабые места, которые вы могли пропустить. И помните: даже сильная заявка иногда проигрывает — это нормально. Сохраните черновик, чтобы податься в другой фонд или на следующий цикл.»
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column (5 columns): Chances + Actions + Verification checklist */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Блок 2: Панель оценки шансов */}
          <section id="scoring-panel" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 size={20} className="text-cyan-600" />
              Качество проработки заявки
            </h3>

            <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900">{scores.total}</span>
                <span className="text-gray-400 text-xs font-bold">из {scores.maxTotal} баллов</span>
              </div>
              <span className="mt-2 text-cyan-750 font-black text-sm bg-cyan-50 px-3 py-1 rounded-full whitespace-nowrap">
                {displayPercent}% готовности
              </span>
            </div>

            <div className="mt-4 p-3 bg-gray-50/80 border border-gray-150 rounded-xl text-center text-xs font-medium text-gray-600 leading-relaxed">
              {getProgressMessage(displayPercent)}
            </div>

            {/* Radar chart of 6 axes */}
            <div className="py-4 flex justify-center bg-gray-50/40 rounded-2xl border border-gray-100/60 my-4">
              <svg width="300" height="260" viewBox="0 0 300 260" className="mx-auto select-none pointer-events-none">
                {/* Axes lines */}
                {radarCriteria.map((_, idx) => {
                  const theta = idx * (2 * Math.PI / 6) - Math.PI / 2;
                  const xCoord = cx + R * Math.cos(theta);
                  const yCoord = cy + R * Math.sin(theta);
                  return (
                    <line key={idx} x1={cx} y1={cy} x2={xCoord} y2={yCoord} stroke="#E2E8F0" strokeWidth="1" />
                  );
                })}

                {/* Polygonal grid rings */}
                {getRadarGridPolygons()}

                {/* Drawn scores polygon */}
                {getRadarValuePoints()}

                {/* Labels */}
                {radarCriteria.map((item, idx) => {
                  const theta = idx * (2 * Math.PI / 6) - Math.PI / 2;
                  const labelR = R + 16;
                  const xCoord = cx + labelR * Math.cos(theta);
                  let yCoord = cy + labelR * Math.sin(theta);

                  // Vertical offset fine-tuning
                  if (idx === 0) yCoord -= 4;
                  if (idx === 3) yCoord += 8;

                  let textAnchor = "middle";
                  if (Math.cos(theta) > 0.15) textAnchor = "start";
                  else if (Math.cos(theta) < -0.15) textAnchor = "end";

                  return (
                    <g key={idx}>
                      <text
                        x={xCoord}
                        y={yCoord}
                        textAnchor={textAnchor as any}
                        fontSize="9"
                        fontWeight="700"
                        className="fill-gray-650 font-sans"
                      >
                        {item.label}
                      </text>
                      <text
                        x={xCoord}
                        y={yCoord + 9}
                        textAnchor={textAnchor as any}
                        fontSize="8.5"
                        fontWeight="600"
                        className="fill-cyan-600 font-mono"
                      >
                        ({item.original})
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <p className="text-[10px] text-gray-500 text-center mt-2 mb-4">
              Эта оценка показывает, насколько полно заполнены все разделы конструктора. Высокий процент не гарантирует победу — качество текста оценит DeepSeek и вы сами по чек-листу.
            </p>
          </section>

          {/* Блок 3: Действия с заявкой */}
          <section id="actions-block" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-cyan-600" />
              Действия с заявкой
            </h3>

            <div className="space-y-3">
              {/* Download Word formatted Document */}
              <button
                type="button"
                id="word-download-sidebar"
                onClick={downloadWord}
                className="w-full flex items-center justify-between p-4 bg-gray-950 hover:bg-gray-850 active:scale-98 text-white rounded-2xl font-bold transition-all shadow-md group relative overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <FileText size={16} className="text-white" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold tracking-wide">Скачать Word (.docx)</span>
                    <span className="block text-[9px] text-gray-400 font-medium">Times New Roman 14, 1.5 интервал</span>
                  </div>
                </div>
                <Download size={18} className="text-gray-400 group-hover:text-white transition-colors" />
              </button>

              {/* Submit to DeepSeek button */}
              <button
                type="button"
                id="deepseek-btn"
                onClick={handleDeepSeekCopy}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 active:scale-98 text-white rounded-2xl font-bold transition-all shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold tracking-wide">Анализ в DeepSeek</span>
                    <span className="block text-[9px] text-cyan-200 font-medium font-sans">Копирует промт и текст заявки</span>
                  </div>
                </div>
                <ExternalLink size={18} className="text-cyan-200 group-hover:text-white transition-colors" />
              </button>

              <div className="border border-gray-100 rounded-2xl overflow-hidden mt-3 bg-gray-50/50 p-4">
                <span className="flex items-center gap-1.5 text-cyan-700 text-xs font-bold mb-3">
                  <HelpCircle size={15} />
                  Как работать с DeepSeek?
                </span>
                <div className="text-xs text-gray-600 space-y-3 font-medium leading-relaxed">
                  <div>
                    <strong className="text-gray-900 block mb-0.5">Шаг 1.</strong>
                    Нажмите кнопку «Анализ в DeepSeek» — система скопирует промт и текст заявки.
                  </div>
                  <div>
                    <strong className="text-gray-900 block mb-0.5">Шаг 2.</strong>
                    В открывшейся вкладке чата DeepSeek вставьте скопированное (Ctrl+V) и нажмите Enter.
                  </div>
                  <div>
                    <strong className="text-gray-900 block mb-0.5">Шаг 3.</strong>
                    Изучите критику нейросети. Она найдёт слабые места, проверит логику и предложит улучшения. Внесите правки вручную в ваш текст, опираясь на её рекомендации.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Блок 4: Финальная памятка проверки */}
          <section id="pamyatka-checklist" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <CheckSquare size={20} className="text-cyan-600" />
              Финальная памятка проверки
            </h3>
            <p className="text-xs text-gray-500 font-medium mb-4 leading-relaxed">
              Отображается в виде чек-листа, который можно отметить прямо на странице (не сохраняется, просто для самопроверки). Эти же пункты продублированы в Word.
            </p>

            <div className="space-y-3">
              {memoCheckTexts.map((text, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleToggleMemo(idx)}
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-100 bg-gray-50/40 hover:border-gray-200 transition-colors cursor-pointer select-none leading-relaxed"
                >
                  <button type="button" className="shrink-0 mt-0.5 text-cyan-600">
                    {localMemoChecks[idx] ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} className="text-gray-300" />
                    )}
                  </button>
                  <span className={`text-xs font-semibold ${localMemoChecks[idx] ? 'text-gray-400 line-through' : 'text-gray-750'}`}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right column (7 columns): Document Preview Block */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[750px] text-left">
          
          {/* Блок 1: Предпросмотр документа */}
          <section id="doc-preview-block" className="bg-white border text-left border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                Предпросмотр документа
              </h3>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span>
              </div>
            </div>

            {aliceMode ? (
              /* Inside Alice reverse mode input */
              <div className="flex flex-col flex-1 p-5 bg-gray-50/30">
                <div className="bg-white border border-gray-100 p-4 rounded-xl mb-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-1.5">
                    <Bot size={16} className="text-cyan-600" />
                    Импорт текста от DeepSeek
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    Вставьте сгенерированный улучшенный вариант текста от искусственного интеллекта в поле ввода. Вы сможете просмотреть результат на оформленной виртуальной странице и скачать DOCX со всеми улучшениями.
                  </p>
                </div>

                <textarea
                  value={aliceInput}
                  onChange={(e) => setAliceInput(e.target.value)}
                  placeholder="Вставьте полученный текст..."
                  className="w-full h-96 rounded-xl p-4 text-xs font-medium border border-gray-200 focus:outline-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none font-serif leading-relaxed text-gray-800"
                />

                <div className="mt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={downloadWord}
                    disabled={!aliceInput.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 p-3 bg-gray-900 hover:bg-gray-850 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    <Download size={15} />
                    Выгрузить этот вариант в Word
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAliceInput(''); setAliceMode(false); }}
                    className="p-3 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                  >
                    Сбросить
                  </button>
                </div>
              </div>
            ) : (
              /* Display standard document visualizer */
              <div className="flex flex-col flex-1 bg-gray-100/40 p-4 md:p-6">
                <div 
                  id="print-section"
                  className="w-full bg-white border border-gray-200 rounded-xl shadow-lg mx-auto p-6 md:p-10 prose max-w-[800px] min-h-[800px] overflow-y-auto select-all"
                  style={{ 
                    fontFamily: '"Times New Roman", Times, serif',
                    lineHeight: '1.5'
                  }}
                >
                  {currentDisplayContent ? (
                    <ReactMarkdown
                      components={{
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-5 border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 text-xs font-serif">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-gray-55">{children}</thead>,
                        tbody: ({ children }) => <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>,
                        tr: ({ children }) => <tr>{children}</tr>,
                        th: ({ children }) => <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase border-r border-gray-100 last:border-0">{children}</th>,
                        td: ({ children }) => <td className="px-3 py-2.5 text-[11px] text-gray-800 border-r border-b border-gray-100 last:border-r-0 leading-relaxed align-top">{children}</td>,
                        h1: ({ children }) => <h1 className="text-2xl font-extrabold text-gray-950 border-b border-gray-900 pb-2 mb-4 mt-2 text-center">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold text-gray-950 border-b border-gray-150 pb-1 mb-3 mt-6">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold text-gray-950 mt-4 mb-2">{children}</h3>,
                        p: ({ children }) => <p className="text-gray-900 text-xs md:text-[13px] leading-relaxed mb-3 text-justify">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1 text-gray-900 text-xs md:text-[13px]">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-1 text-gray-900 text-xs md:text-[13px]">{children}</ol>,
                        li: ({ children }) => <li className="leading-snug">{children}</li>
                      }}
                    >
                      {currentDisplayContent}
                    </ReactMarkdown>
                  ) : (
                    <div className="text-center py-20 text-gray-400 italic font-sans text-xs">
                      Заявка пуста. Пожалуйста, соберите текст во ВСЕХ прошлых шагах!
                    </div>
                  )}
                </div>

                {/* Word Download Button right below the preview panel */}
                <div className="mt-5 self-center w-full max-w-[800px]">
                  <button 
                    type="button"
                    onClick={downloadWord}
                    className="w-full inline-flex items-center justify-center gap-2 p-3.5 bg-cyan-600 hover:bg-cyan-700 active:scale-98 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-cyan-600/10 cursor-pointer uppercase tracking-wider"
                  >
                    <Download size={15} />
                    Скачать Word (.docx)
                  </button>
                  <p className="text-[10px] text-gray-500 font-medium text-center mt-3">
                    Финальный Word-файл скачивается без правок нейросети. Рекомендуем доработать текст самостоятельно, опираясь на анализ DeepSeek.
                  </p>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Блок 5: Что дальше? */}
      <footer id="next-steps-block" className="mt-12 pt-8 border-t border-gray-200 text-left">
        <div className="mb-10 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-6 md:p-8 border border-purple-100 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-black text-purple-900 mb-2 flex items-center gap-3">
              <Sparkles size={24} className="text-purple-600" />
              Усильте вашу заявку с помощью ИИ
            </h3>
            <p className="text-purple-800/80 mb-6 font-medium text-sm md:text-base max-w-2xl">
              Используйте бесплатные нейросети, чтобы доработать текст, создать логотип к проекту или подготовить видеоролик. Мы собрали готовые промты (инструкции) и лучшие сервисы.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => setStep('tools')} 
                className="bg-white hover:bg-purple-50 rounded-2xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition text-left group"
              >
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Sparkles size={20} /></div>
                <h4 className="font-bold text-gray-900 mb-1">Инструменты и ИИ</h4>
                <p className="text-xs text-gray-500 font-medium">Улучшить заявку, промты, мастер-класс</p>
              </button>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
          <ListRestart size={22} className="text-cyan-600" />
          Что делать дальше?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Main buttons & Actions: 8 columns */}
          <div className="md:col-span-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Save as Draft in IndexedDB */}
              <button
                type="button"
                onClick={handleSaveAsDraft}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 p-4 bg-white border border-cyan-200 hover:bg-cyan-50/20 text-cyan-700 font-bold rounded-2xl transition cursor-pointer text-xs"
              >
                <Save size={16} />
                {isSaving ? "Сохранение..." : "Сохранить как черновик"}
              </button>

              {/* Start New Application */}
              <button
                type="button"
                onClick={startNewProject}
                className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-2xl transition cursor-pointer text-xs"
              >
                <PlusCircle size={16} />
                Начать новую заявку
              </button>

              {/* Back to editing - step 7 standard shortcut */}
              <button
                type="button"
                onClick={() => setStep(7)}
                className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-2xl transition cursor-pointer text-xs"
              >
                <Undo2 size={16} />
                Вернуться в Шаг 7
              </button>
            </div>

            {/* Stepper Navigation: "Вернуться к редактированию" */}
            <div className="bg-white rounded-2xl p-5 border border-gray-250">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
                Вернуться к редактированию (навигация по шагам)
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { sNum: 1, name: "Шаг 1. Статус заявителя" },
                  { sNum: 2, name: "Шаг 2. О фонде" },
                  { sNum: 3, name: "Шаг 3. Концепт" },
                  { sNum: 4, name: "Шаг 4. Аудитория" },
                  { sNum: 5, name: "Шаг 5. Актуальность" },
                  { sNum: 6, name: "Шаг 6. Результаты" },
                  { sNum: 7, name: "Шаг 7. Бюджет" },
                  { sNum: 8, name: "Шаг 8. Команда" },
                ].map((s) => (
                  <button
                    key={s.sNum}
                    type="button"
                    onClick={() => setStep(s.sNum as any)}
                    className="px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 hover:border-gray-250 transition cursor-pointer"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* "Мои заявки" draft list viewer: 4 columns */}
          <div className="md:col-span-4 bg-white rounded-2xl p-5 border border-gray-250 flex flex-col min-h-[220px]">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <FolderOpen size={14} className="text-cyan-600" />
              Мои заявки (черновики)
            </h4>

            {draftsList.length > 0 ? (
              <div className="space-y-2.5 flex-1 max-h-56 overflow-y-auto pr-1">
                {draftsList.map((draft) => (
                  <div 
                    key={draft.id}
                    onClick={() => handleLoadDraft(draft)}
                    className="p-3 bg-gray-50/50 hover:bg-gray-100/80 border border-gray-150 hover:border-cyan-200 rounded-xl text-left cursor-pointer transition flex items-center justify-between group"
                    title="Нажмите, чтобы загрузить этот черновик"
                  >
                    <div className="overflow-hidden min-w-0 pr-2">
                      <span className="block text-xs font-bold text-gray-800 truncate leading-snug">
                        {draft.title}
                      </span>
                      <span className="block text-[9px] text-gray-400 font-medium font-sans mt-0.5">
                        Обновлено: {new Date(draft.updatedAt).toLocaleDateString()} {new Date(draft.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteDraft(draft.id, e)}
                      className="text-gray-300 hover:text-red-500 p-1 rounded-md hover:bg-white border border-transparent hover:border-gray-200 transition"
                      title="Удалить черновик"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-100 rounded-xl text-center">
                <span className="text-gray-300 text-xl block mb-1">📁</span>
                <p className="text-[10px] text-gray-400 font-medium leading-normal italic">
                  Нет сохраненных резервных копий. Нажмите «Сохранить как черновик», чтобы внести текущие наработки в реестр IndexedDB.
                </p>
              </div>
            )}
          </div>

        </div>
      </footer>

      {/* Delete Draft Modal */}
      <AnimatePresence>
        {draftToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDraftToDelete(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-150 text-left z-10"
            >
              <h3 className="text-lg font-bold text-gray-950 mb-3">Удалить черновик?</h3>
              <p className="text-sm text-gray-600 mb-6">Вы уверены, что хотите удалить этот черновик? Это действие необратимо.</p>
              <div className="flex gap-3 justify-end mt-4">
                <button 
                  type="button"
                  onClick={() => setDraftToDelete(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Отмена
                </button>
                <button 
                  type="button"
                  onClick={confirmDeleteDraft}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Удалить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Start New Project Modal */}
      <AnimatePresence>
        {showNewProjectConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewProjectConfirm(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-150 text-left z-10"
            >
              <h3 className="text-lg font-bold text-gray-950 mb-3">Начать новую заявку?</h3>
              <p className="text-sm text-gray-600 mb-6">Вы действительно хотите начать новую заявку? Все текущие несохраненные изменения будут сброшены.</p>
              <div className="flex gap-3 justify-end mt-4">
                <button 
                  type="button"
                  onClick={() => setShowNewProjectConfirm(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Отмена
                </button>
                <button 
                  type="button"
                  onClick={confirmStartNewProject}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Начать новую
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
