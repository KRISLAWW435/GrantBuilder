import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Menu, X, BookOpen, ExternalLink, ChevronDown, Rocket, Image as ImageIcon, Video, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NEURAL_NETWORKS } from '../../config/neuralNetworks';

interface Section {
  id: string;
  title: string;
  content: string;
}

interface StartGuide {
  text: string;
  networkIds: string[];
}

interface Chapter {
  id: string;
  title: string;
  sections: Section[];
  startGuide?: StartGuide;
}

interface MasterclassData {
  chapters: Chapter[];
}

const StartGuideBlock = ({ data }: { data: StartGuide }) => {
  const [isOpen, setIsOpen] = useState(false);
  const networks = data.networkIds
    .map(id => NEURAL_NETWORKS.find(n => n.id === id))
    .filter(Boolean);

  if (networks.length === 0) return null;

  return (
    <div className="mb-12 bg-gray-50 border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <Rocket size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Стартовый набор: как получить доступ</h3>
      </div>
      <p className="text-gray-700 text-sm md:text-base mb-6">{data.text}</p>
      
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs md:text-sm text-gray-700 flex gap-3 shadow-xs">
        <span className="text-lg leading-none shrink-0">📧</span>
        <div>
          <strong className="text-amber-900 font-bold block mb-1">Полезный совет по регистрации:</strong>
          Почти все нейросети требуют пройти регистрацию для работы. Если вы не хотите засорять свою основную почту, то можно воспользоваться временным почтовым ящиком, например, на сайте <a href="https://emailtick.com/" target="_blank" rel="noopener noreferrer" className="text-amber-800 underline font-bold hover:text-amber-900 inline-flex items-center gap-0.5">emailtick.com <ExternalLink size={12} /></a>. Все коды подтверждения и сообщения будут приходить прямо на созданную временную почту. <em>(Примечание: некоторые строгие ИИ-сервисы могут блокировать регистрацию со сторонних доменов временных почт)</em>.
        </div>
      </div>
      
      <div className="bg-white border md:rounded-xl rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-4 md:px-6 md:py-4 flex items-center justify-between bg-blue-50/50 hover:bg-blue-50 transition-colors text-left"
        >
          <span className="font-bold text-blue-900">Список сервисов и условия использования</span>
          <ChevronDown
            size={20}
            className={`text-blue-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-100">
                {networks.map(n => n && (
                  <div key={n.id} className="border border-gray-200 rounded-xl p-4 flex flex-col items-start bg-gray-50/50 hover:bg-white hover:border-blue-200 transition-colors hover:shadow-sm">
                    <div className="flex gap-2 w-full mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
                        {n.type === 'text' ? <Type size={16} /> : n.type === 'image' ? <ImageIcon size={16} /> : <Video size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{n.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                           <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${
                              n.needsVpn ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {n.needsVpn ? 'VPN' : 'Без VPN'}
                            </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between w-full self-stretch">
                      <div>
                        {n.limits && (
                          <p className="text-xs text-gray-600 mb-3">{n.limits}</p>
                        )}
                      </div>
                      {n.howToUse && (
                        <div className="mb-4 bg-cyan-50/50 border border-cyan-100/30 p-2.5 rounded-lg text-[11px] text-gray-600 leading-relaxed">
                          <strong className="text-cyan-900 block font-bold mb-0.5">💡 Инструкция (куда нажимать):</strong>
                          {n.howToUse}
                        </div>
                      )}
                    </div>
                    <a
                      href={n.registrationUrl || n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center px-3 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-bold text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center justify-center gap-1.5"
                    >
                      Регистрация <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Add safelist for dynamic HTML content loaded from JSON
const twSafelist = "list-disc list-inside space-y-2 mt-4 ml-4 font-bold text-sm text-gray-700 bg-gray-50 rounded-xl space-y-4 p-4 p-6 list-none border border-blue-100 bg-blue-50/50 text-blue-900 border-purple-100 bg-purple-50/50 text-purple-900 border-green-100 bg-green-50/50 text-green-900 border-orange-100 bg-orange-50/50 text-orange-900 grid grid-cols-1 md:grid-cols-2 gap-4 border-l-4 border-cyan-500 rounded-r-xl bg-yellow-50 text-yellow-800 rounded-t-xl text-red-700 text-red-900 bg-green-50 bg-red-50 border-red-200 border-green-200 rounded-b-xl border-t-0 my-2 py-2 pl-4 cursor-pointer text-blue-600 mt-3 list-decimal mb-1 border-gray-300 italic text-gray-900 font-medium mb-2 w-full mt-1 rounded focus:ring-blue-500 items-start gap-3 flex flex-col sm:flex-row";

export const Masterclass: React.FC<{ onNavigateToLibrary?: (type: 'text' | 'image' | 'video', section: string) => void }> = ({ onNavigateToLibrary }) => {
  const [data, setData] = useState<MasterclassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load progress from localStorage
    try {
      const savedProgress = localStorage.getItem('masterclassProgress');
      if (savedProgress) {
        setCompletedChapters(JSON.parse(savedProgress));
      }
    } catch (e) {
      console.error('Failed to load progress', e);
    }

    // Handle hash navigation
    const checkHash = (chapters: Chapter[]) => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const index = chapters.findIndex(c => c.id === hash);
        if (index !== -1) {
          setCurrentChapterIndex(index);
        }
      }
    };

    const loadData = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || '';
        const fetchUrl = baseUrl.endsWith('/') ? `${baseUrl}data/masterclass-content.json` : `${baseUrl}/data/masterclass-content.json`;
        
        // Ensure relative fallback if needed
        const urlToFetch = fetchUrl.startsWith('/') && !fetchUrl.startsWith(window.location.origin) ? `.${fetchUrl}` : fetchUrl;

        const response = await fetch(urlToFetch);
        
        if (!response.ok) {
          throw new Error('Failed to load masterclass content');
        }
        
        const jsonData = await response.json();
        setData(jsonData);
        checkHash(jsonData.chapters);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить материалы мастер-класса. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const handleHashChange = () => {
      if (data) checkHash(data.chapters);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const saveProgress = (chapterId: string) => {
    if (!completedChapters.includes(chapterId)) {
      const newCompleted = [...completedChapters, chapterId];
      setCompletedChapters(newCompleted);
      localStorage.setItem('masterclassProgress', JSON.stringify(newCompleted));
    }
  };

  const goToChapter = (index: number) => {
    if (!data) return;
    
    // Save progress for current before leaving if we are moving forward
    saveProgress(data.chapters[currentChapterIndex].id);
    
    setCurrentChapterIndex(index);
    window.location.hash = data.chapters[index].id;
    setIsMobileMenuOpen(false);
    
    // Scroll to top of content
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextChapter = () => {
    if (data && currentChapterIndex < data.chapters.length - 1) {
      goToChapter(currentChapterIndex + 1);
    }
  };

  const prevChapter = () => {
    if (currentChapterIndex > 0) {
      goToChapter(currentChapterIndex - 1);
    }
  };

  const markCurrentAsCompleted = () => {
    if (data) {
      saveProgress(data.chapters[currentChapterIndex].id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
        {error}
      </div>
    );
  }

  const currentChapter = data.chapters[currentChapterIndex];
  const progressPercentage = Math.round((completedChapters.length / data.chapters.length) * 100);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" ref={contentRef}>
      
      {/* Progress Bar Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 md:px-8 py-4 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
            <BookOpen size={16} /> Прогресс обучения
          </h2>
          <span className="text-sm font-bold text-cyan-700">{progressPercentage}%</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 min-h-[600px]">
        {/* Mobile TOC Toggle */}
        <div className="md:hidden border-b border-gray-200 p-4 bg-white z-20 sticky top-0">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-between w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700"
          >
            <span className="truncate pr-2">Оглавление: {currentChapter.title}</span>
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Sidebar TOC */}
        <AnimatePresence>
          {(isMobileMenuOpen || typeof window === 'undefined' || window.innerWidth >= 768) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`md:w-72 lg:w-80 shrink-0 bg-gray-50 border-r border-gray-200 md:block ${isMobileMenuOpen ? 'block border-b' : 'hidden'}`}
            >
              <div className="p-4 md:p-6 sticky top-0 overflow-y-auto max-h-[calc(100vh-200px)]">
                <h3 className="font-extrabold text-gray-900 mb-4 hidden md:block">Содержание</h3>
                <nav className="space-y-1">
                  {data.chapters.map((chapter, index) => {
                    const isCompleted = completedChapters.includes(chapter.id);
                    const isActive = currentChapterIndex === index;
                    return (
                      <button
                        key={chapter.id}
                        onClick={() => goToChapter(index)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-start gap-3 ${
                          isActive 
                            ? 'bg-white shadow-sm border border-cyan-100 ring-1 ring-cyan-500 text-cyan-800' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle size={18} className="text-green-500" />
                          ) : (
                            <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${isActive ? 'border-cyan-500 text-cyan-600 bg-cyan-50' : 'border-gray-300'}`}>
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-sm ${isActive ? 'font-extrabold' : ''}`}>{chapter.title}</div>
                          {isActive && chapter.sections.length > 0 && (
                            <ul className="mt-2 space-y-1.5 pl-1 hidden md:block">
                              {chapter.sections.map(section => (
                                <li key={section.id} className="text-xs text-gray-500 hover:text-cyan-600">
                                  <a href={`#${section.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' }); }}>
                                    {section.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 px-4 py-6 md:p-10 lg:p-12 overflow-y-auto w-full">
          <motion.div
            key={currentChapter.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <span className="text-cyan-600 font-bold text-sm mb-2 block uppercase tracking-wider">
              Глава {currentChapterIndex + 1}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">
              {currentChapter.title}
            </h1>

            {currentChapter.startGuide && (
              <StartGuideBlock data={currentChapter.startGuide} />
            )}

            <div className="space-y-12">
              {currentChapter.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{section.title}</h2>
                  <div 
                    className="max-w-none text-gray-700 leading-relaxed text-sm md:text-base
                      [&_h4]:font-bold [&_h4]:text-gray-900 [&_h4]:mt-4 [&_h4]:mb-2
                      [&_a]:text-cyan-600 hover:[&_a]:text-cyan-700
                      [&_p]:mb-4 last:[&_p]:mb-0
                      [&_ul]:my-4 [&_ul]:space-y-1 [&_ul.list-disc]:ml-4
                      [&_ol]:my-4 [&_ol]:space-y-1 [&_ol.list-decimal]:ml-4
                      [&_li]:my-1
                      [&_strong]:font-bold [&_strong]:text-gray-900
                      [&_em]:italic
                      [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
                      [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:my-6
                      [&_.bg-gray-50]:bg-gray-50 [&_.p-4]:p-4 [&_.rounded-xl]:rounded-xl [&_.mt-4]:mt-4 [&_.mb-4]:mb-4"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </section>
              ))}
            </div>

            {/* Navigation Footer */}
            <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 pb-8">
              <button
                onClick={prevChapter}
                disabled={currentChapterIndex === 0}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-colors w-full sm:w-auto justify-center ${
                  currentChapterIndex === 0 
                  ? 'opacity-0 pointer-events-none' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChevronLeft size={20} />
                Назад
              </button>
              
              <div className="flex gap-3 w-full sm:w-auto flex-col sm:flex-row">
                {!completedChapters.includes(currentChapter.id) && (
                  <button
                    onClick={markCurrentAsCompleted}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-colors bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 w-full sm:w-auto"
                  >
                    <CheckCircle size={20} />
                    Отметить прочитанной
                  </button>
                )}
                
                {currentChapterIndex < data.chapters.length - 1 ? (
                  <button
                    onClick={nextChapter}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-colors bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:shadow-lg w-full sm:w-auto"
                  >
                    Следующая глава
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                        markCurrentAsCompleted();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-colors bg-gradient-to-r from-[#00F0FF] to-[#7000FF] text-white shadow-md hover:shadow-lg w-full sm:w-auto"
                  >
                    <CheckCircle size={20} />
                    Завершить курс
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

