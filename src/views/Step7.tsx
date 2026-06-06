import React, { useState, useEffect, useRef } from 'react';
import { StepLayout } from '../components/StepLayout.tsx';
import { useAppContext } from '../store.tsx';
import { calculateProjectScores } from '../utils/scoreCalculator.ts';
import { 
  User, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  Search,
  BookOpen,
  X,
  Copy,
  Check
} from 'lucide-react';

const UNIVERSAL_ROLES = [
  'Бухгалтер / финансовый менеджер',
  'Юрист',
  'Фотограф / видеограф'
];

const getSphereRoles = (sphereId: string): string[] => {
  switch (sphereId) {
    case 'education':
      return ['Методист / разработчик программы', 'Тренер / спикер', 'SMM-менеджер', 'Координатор по работе с участниками'];
    case 'eco':
      return ['Эколог-эксперт', 'Логист (выезды, уборки)', 'PR-менеджер', 'Координатор волонтеров'];
    case 'culture':
      return ['Художественный руководитель', 'Продюсер', 'Дизайнер / художник', 'Технический специалист'];
    case 'it':
      return ['Разработчик', 'Методист по IT-образованию', 'Технический координатор', 'Маркетолог'];
    case 'social':
      return ['Координатор волонтеров', 'Куратор молодежного сообщества', 'PR-менеджер', 'Модератор дискуссий'];
    case 'urban':
      return ['Урбанист-проектировщик', 'Логист', 'Координатор по работе с жителями', 'Дизайнер среды'];
    case 'sport':
      return ['Главный тренер / инструктор', 'Спортивный координатор', 'Логист соревнований', 'SMM-специалист'];
    case 'patriotism':
      return ['Эксперт-краевед', 'Координатор мемориальных программ', 'PR-менеджер', 'Куратор волонтеров'];
    default:
      return ['Координатор проекта', 'SMM-менеджер', 'Специалист по связям с общественностью'];
  }
};

const isKeyProfileRole = (role: string): boolean => {
  const norm = role.toLowerCase();
  if (norm.includes('методист') || norm.includes('тренер') || norm.includes('спикер')) return true;
  if (norm.includes('эколог')) return true;
  if (norm.includes('художественный руководитель') || norm.includes('худрук') || norm.includes('продюсер')) return true;
  if (norm.includes('разработчик') || norm.includes('программист') || norm.includes('аналитик')) return true;
  if (norm.includes('проектировщик') || norm.includes('урбанист')) return true;
  if (norm.includes('краевед') || norm.includes('инструктор')) return true;
  return false;
};

// Custom Group-sorted Searchable Role Selector Component
interface RoleSelectorProps {
  value: string;
  customValue: string;
  sphereId: string;
  onChange: (role: string, custom?: string) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, customValue, sphereId, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const sphereRoles = getSphereRoles(sphereId);
  const allAvailableRoles = [...sphereRoles, ...UNIVERSAL_ROLES];

  const filteredSphereRoles = sphereRoles.filter(role => 
    role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredUniversalRoles = UNIVERSAL_ROLES.filter(role => 
    role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayLabel = value === 'Другое' 
    ? (customValue ? `Другое: ${customValue}` : 'Другое (впишите роль)')
    : (value || 'Выберите роль...');

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setSearchQuery(''); }}
        className="w-full flex items-center justify-between min-h-[44px] px-3.5 py-2.5 text-xs md:text-sm text-left bg-white border border-gray-300 rounded-xl hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium text-gray-800"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-30 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-[280px] flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search bar */}
          <div className="relative p-2 border-b border-gray-100 flex items-center bg-gray-50/50">
            <Search size={14} className="absolute left-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск роли..."
              className="w-full pl-8 pr-3 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:focus:ring-cyan-500 focus:border-cyan-500 font-medium"
            />
          </div>

          {/* List options */}
          <div className="overflow-y-auto flex-1 py-1.5 text-xs text-gray-700">
            {/* Sphere specific group heading */}
            {filteredSphereRoles.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[9px] font-black tracking-wider text-cyan-600 uppercase bg-cyan-50/60">
                  Рекомендованные (по вашей сфере)
                </div>
                {filteredSphereRoles.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      onChange(role, '');
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-cyan-50/50 hover:text-cyan-800 transition font-medium flex items-center justify-between ${value === role ? 'bg-cyan-50/30 text-cyan-700 font-bold' : ''}`}
                  >
                    <span>{role}</span>
                    {isKeyProfileRole(role) && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase tracking-widest scale-90">
                        Профиль ★
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Universal general group heading */}
            {filteredUniversalRoles.length > 0 && (
              <div className="mt-1.5">
                <div className="px-3 py-1 text-[9px] font-black tracking-wider text-amber-600 uppercase bg-amber-50/60">
                  Общие роли проекта
                </div>
                {filteredUniversalRoles.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      onChange(role, '');
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-amber-50/30 hover:text-amber-800 transition font-medium ${value === role ? 'bg-amber-50/20 text-amber-700 font-bold' : ''}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}

            {/* Spacer */}
            {(filteredSphereRoles.length > 0 || filteredUniversalRoles.length > 0) && (
              <div className="border-t border-gray-100 my-1"></div>
            )}

            {/* Other option */}
            <button
              type="button"
              onClick={() => {
                onChange('Другое', '');
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 hover:bg-slate-100 font-black text-rose-600 ${value === 'Другое' ? 'bg-rose-50/50' : ''}`}
            >
              ➕ Вписать свою роль (Другое)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const Step7: React.FC = () => {
  const { data, setData } = useAppContext();
  const [isCopied, setIsCopied] = useState(false);

  // Extract step 7 metrics
  const leader = data.step7Leader || { name: '', experience: '' };
  const members = data.step7Members || [];
  const volunteers = data.step7Volunteers || [];
  const extraFunctions = data.step7ExtraFunctions || '';
  const checklist = data.step7Checklist || [false, false, false];
  const sphereId = data.projectSphereId || 'universal';
  const isIndividual = data.legalStatus === 'individual';

  // Initialize with at least 1 empty team member if array is empty
  useEffect(() => {
    if (members.length === 0) {
      setData(prev => ({
        ...prev,
        step7Members: [
          { role: '', customRole: '', name: '', experience: '' }
        ]
      }));
    }
  }, []);

  // Clear volunteers if legal status changed away from individual
  useEffect(() => {
    if (!isIndividual && volunteers.length > 0) {
      setData(prev => ({
        ...prev,
        step7Volunteers: []
      }));
    }
  }, [isIndividual, volunteers.length, setData]);

  // Backwards compatibility sync logic (keeps leaderCompetence, teamMembers, and projectTeam properties perfectly updated)
  useEffect(() => {
    const leaderSyncName = leader.name.trim();
    const leaderSyncExp = leader.experience.trim();

    // Standard TeamMember array mapping
    const teamMembersSync = members
      .filter(m => m.name.trim())
      .map((m, idx) => ({
        id: `m-${idx}`,
        role: m.role === 'Другое' ? m.customRole.trim() : m.role,
        name: m.name.trim(),
        experience: m.experience.trim()
      }));

    // Beautiful descriptive text blocks for project summaries
    let projectTeamSummaryText = `Руководитель проекта: **${leaderSyncName || 'Не указано'}**\nОпыт и компетенции: ${leaderSyncExp || 'Не заполнено'}\n\n`;
    if (teamMembersSync.length > 0) {
      projectTeamSummaryText += `**Ключевые члены команды:**\n` + teamMembersSync
        .map(m => `- **${m.name}** (${m.role}): ${m.experience}`)
        .join('\n');
    } else {
      projectTeamSummaryText += '*Остальные члены команды не добавлены.*';
    }

    if (extraFunctions.trim()) {
      projectTeamSummaryText += `\n\n**Дополнительные функции:**\n${extraFunctions.trim()}`;
    }

    if (isIndividual && volunteers.length > 0) {
      projectTeamSummaryText += `\n\n**Волонтёры/консультанты:**\n` + volunteers
        .filter(v => v.name.trim())
        .map(v => `- **${v.name}** (${v.role}): ${v.experience}`)
        .join('\n');
    }

    if (
      data.leaderCompetence !== leaderSyncExp ||
      JSON.stringify(data.teamMembers || []) !== JSON.stringify(teamMembersSync) ||
      data.projectTeam !== projectTeamSummaryText
    ) {
      setData(prev => ({
        ...prev,
        leaderCompetence: leaderSyncExp,
        teamMembers: teamMembersSync,
        projectTeam: projectTeamSummaryText
      }));
    }
  }, [leader, members]);

  // Core Actions
  const handleUpdateLeader = (field: 'name' | 'experience', value: string) => {
    setData(prev => ({
      ...prev,
      step7Leader: {
        ...(prev.step7Leader || { name: '', experience: '' }),
        [field]: value
      }
    }));
  };

  const handleAddMember = () => {
    setData(prev => ({
      ...prev,
      step7Members: [
        ...(prev.step7Members || []),
        { role: '', customRole: '', name: '', experience: '' }
      ]
    }));
  };

  const handleUpdateMember = (index: number, field: 'role' | 'customRole' | 'name' | 'experience', value: string) => {
    setData(prev => {
      const copy = [...(prev.step7Members || [])];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
        // Reset custom role value if standard role is selected
        if (field === 'role' && value !== 'Другое') {
          copy[index].customRole = '';
        }
      }
      return { ...prev, step7Members: copy };
    });
  };

  const handleRemoveMember = (index: number) => {
    setData(prev => {
      const copy = [...(prev.step7Members || [])];
      copy.splice(index, 1);
      return { ...prev, step7Members: copy };
    });
  };

  const handleAddVolunteer = () => {
    setData(prev => ({
      ...prev,
      step7Volunteers: [
        ...(prev.step7Volunteers || []),
        { name: '', role: '', experience: '' }
      ]
    }));
  };

  const handleUpdateVolunteer = (index: number, field: 'name' | 'role' | 'experience', value: string) => {
    setData(prev => {
      const copy = [...(prev.step7Volunteers || [])];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
      }
      return { ...prev, step7Volunteers: copy };
    });
  };

  const handleRemoveVolunteer = (index: number) => {
    setData(prev => {
      const copy = [...(prev.step7Volunteers || [])];
      copy.splice(index, 1);
      return { ...prev, step7Volunteers: copy };
    });
  };

  const handleUpdateExtraFunctions = (val: string) => {
    setData(prev => ({ ...prev, step7ExtraFunctions: val }));
  };

  const handleCheck = (index: number) => {
    const copy = [...checklist];
    copy[index] = !copy[index];
    setData(prev => ({
      ...prev,
      step7Checklist: copy
    }));
  };

  // Pre-load perfect demo template for users (An Educational Project with full details)
  const handleLoadDemoExample = () => {
    setData(prev => ({
      ...prev,
      step7Leader: {
        name: 'Иванова Анна Петровна',
        experience: 'Координатор молодёжных проектов в НКО "Вектор" (2 года), организовала профориентационный фестиваль "Шаг в будущее" для 300 старшеклассников, прошла обучение по грантовому менеджменту в ФПГ.'
      },
      step7Members: [
        {
          role: 'Методист / разработчик программы',
          customRole: '',
          name: 'Петров Сергей Викторович',
          experience: 'Кандидат педагогических наук, автор 10+ образовательных программ для подростков, разработчик методики "Дебаты для школьников", опыт работы в проекте "Учимся говорить".'
        },
        {
          role: 'SMM-менеджер',
          customRole: '',
          name: 'Смирнова Дарья Игоревна',
          experience: 'Ведущий специалист по продвижению в соцсетях, 4 года ведёт молодёжные паблики (аудитория 15 000+), настраивала таргетированную рекламу для НКО "Вектор".'
        }
      ],
      step7Volunteers: prev.legalStatus === 'individual' ? [
        {
          name: 'Сидоров Алексей',
          role: 'Помощник координатора',
          experience: 'Студент 3 курса, волонтёр на 5 городских мероприятиях. Будет помогать с регистрацией.'
        }
      ] : [],
      step7ExtraFunctions: 'Бухгалтерию будет вести привлечённый самозанятый специалист по договору ГПХ.',
      step7Checklist: [true, true, true]
    }));
  };

  // Score Calculator
  const hasLeader = leader.name.trim() !== '' && leader.experience.trim().length >= 30;
  const hasValidAtLeastOneMember = members.some(m => 
    m.name.trim() !== '' && 
    m.experience.trim().length >= 30 &&
    (m.role !== 'Другое' || m.customRole?.trim() !== '')
  );

  const hasOnlyRecommendedRolesWithProfile = members.length > 0 && 
    members.every(m => m.role !== 'Другое') && 
    members.some(m => m.name.trim() !== '' && m.experience.trim().length >= 30 && isKeyProfileRole(m.role));

  const allChecklistMarked = checklist.every(Boolean);

  const { step7: currentScore } = calculateProjectScores(data);

  // Real-time Validations
  const leaderValid = leader.name.trim() !== '' && leader.experience.trim().length >= 30;
  
  const membersValid = members.length > 0 && members.every(m => {
    const hasRoleName = m.role && (m.role !== 'Другое' || m.customRole.trim() !== '');
    const hasPersonName = m.name.trim() !== '';
    const hasExperienceLength = m.experience.trim().length >= 30;
    return hasRoleName && hasPersonName && hasExperienceLength;
  });

  const volunteersValid = !isIndividual || volunteers.length === 0 || volunteers.every(v => 
    v.name.trim() !== '' && v.role.trim() !== '' && v.experience.trim().length >= 30
  );

  const canProceed = leaderValid && membersValid && volunteersValid && allChecklistMarked;

  // Build Team Preview (Plain text for copying to clipboard)
  const buildTeamPreviewPlain = () => {
    const lines: string[] = [];
    lines.push('Команда проекта:');
    
    // Leader
    const leaderName = leader.name.trim() || '[ФИО]';
    const leaderExp = leader.experience.trim() || '[ОПЫТ]';
    lines.push(`Руководитель проекта: ${leaderName}. Опыт: ${leaderExp}.`);

    // Members
    members.forEach((m) => {
      const roleStr = m.role === 'Другое' ? m.customRole : m.role;
      const mRole = roleStr.trim() || '[РОЛЬ]';
      const mName = m.name.trim() || '[ФИО]';
      const mExp = m.experience.trim() || '[ОПЫТ]';
      lines.push(`${mRole}: ${mName}. Опыт: ${mExp}.`);
    });

    // Extra functions
    if (extraFunctions.trim()) {
      lines.push(`Дополнительные функции: ${extraFunctions.trim()}`);
    }

    // Volunteers
    if (isIndividual && volunteers.length > 0) {
      const vols = volunteers.map(v => {
        const vName = v.name.trim() || '[ФИО]';
        const vRole = v.role.trim() || '[РОЛЬ]';
        const vExp = v.experience.trim() || '[ОПЫТ]';
        return `- ${vName}, ${vRole}. Опыт: ${vExp}.`;
      });
      lines.push(`Волонтёры/консультанты:\n${vols.join('\n')}`);
    }

    return lines.join('\n\n');
  };

  // Build Team Preview (HTML representation for team-preview class wrapper)
  const buildTeamPreviewHTML = () => {
    let html = '';
    
    // Header
    html += `<p class="font-bold text-gray-900 mb-4 text-base">Команда проекта:</p>`;

    // Leader
    const leaderName = leader.name.trim() || '[ФИО]';
    const leaderExp = leader.experience.trim() || '[ОПЫТ]';
    html += `<p class="text-gray-800 text-sm leading-relaxed mb-4">`;
    html += `<strong class="text-gray-900">Руководитель проекта:</strong> ${leaderName}. `;
    html += `<strong>Опыт:</strong> ${leaderExp}.`;
    html += `</p>`;

    // Members
    members.forEach((m) => {
      const roleStr = m.role === 'Другое' ? m.customRole : m.role;
      const mRole = roleStr.trim() || '[РОЛЬ]';
      const mName = m.name.trim() || '[ФИО]';
      const mExp = m.experience.trim() || '[ОПЫТ]';
      html += `<p class="text-gray-800 text-sm leading-relaxed mb-4">`;
      html += `<strong class="text-gray-900">${mRole}:</strong> ${mName}. `;
      html += `<strong>Опыт:</strong> ${mExp}.`;
      html += `</p>`;
    });

    // Extra functions
    if (extraFunctions.trim()) {
      html += `<p class="mt-6 mb-4 text-gray-800 leading-relaxed text-sm">`;
      html += `<strong class="text-gray-900">Дополнительные функции:</strong> ${extraFunctions.trim()}`;
      html += `</p>`;
    }

    // Volunteers
    if (isIndividual && volunteers.length > 0) {
      html += `<div class="mt-6">`;
      html += `<p class="font-bold text-gray-900 mb-2 text-sm">Волонтёры/консультанты:</p>`;
      html += `<ul class="list-none space-y-2 text-gray-800 pl-4">`;
      volunteers.forEach(v => {
        const vName = v.name.trim() || '[ФИО]';
        const vRole = v.role.trim() || '[РОЛЬ]';
        const vExp = v.experience.trim() || '[ОПЫТ]';
        html += `<li class="text-gray-800 text-sm leading-relaxed">- <strong>${vName}</strong>, ${vRole}. <strong>Опыт:</strong> ${vExp}.</li>`;
      });
      html += `</ul>`;
      html += `</div>`;
    }

    return html;
  };

  const handleCopyPreview = () => {
    try {
      const plainText = buildTeamPreviewPlain();
      navigator.clipboard.writeText(plainText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <StepLayout
      title="Кто сделает проект реальностью? Команда и опыт"
      subtitle="Покажите, что у вас есть люди с нужными знаниями и навыками, а не просто «хорошие знакомые»."
      mentorContent="Эксперты хотят видеть не имена, а роли и компетенции. У каждого члена команды должна быть чёткая функция: руководитель управляет процессами и отчитывается, методист разрабатывает программу, smm-менеджер ведёт соцсети. Опишите опыт, который прямо относится к проекту. Например, не «работал в школе», а «3 года вёл курсы по риторике для подростков, 120 выпускников». Если вы подаётесь как физическое лицо, покажите, что у вас есть поддержка — хотя бы волонтёры или консультанты."
      canProceed={canProceed}
      progressScore={currentScore}
      progressMax={12}
    >
      <div className="space-y-10 pb-8">
        
        {/* Dynamic header row with demo options */}
        <div className="flex flex-wrap items-center justify-end gap-4 bg-slate-50 p-4 shrink-0 rounded-[24px] border border-gray-100">
          <button
            onClick={handleLoadDemoExample}
            className="flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl border border-teal-200 transition-all shadow-sm w-full sm:w-auto justify-center"
          >
            <Sparkles size={14} className="text-teal-600" />
            Заполнить образцовым примером команды
          </button>
        </div>

        {/* BLOCK 1: PROJECT LEADER (MANDATORY) */}
        <div className="p-6 bg-cyan-50/20 border-2 border-cyan-500/25 rounded-[28px] shadow-xs relative">
          <div className="absolute top-4 right-4 bg-cyan-100 text-cyan-800 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border border-cyan-200">
            Обязательно
          </div>
          
          <h3 className="text-base md:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
              <User size={18} />
            </div>
            1. Руководитель проекта
            <span className="text-[10px] text-gray-400 font-semibold">(Вы или назначенный лидер)</span>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ФИО */}
              <div>
                <label className="text-xs text-gray-700 font-bold mb-1.5 block">ФИО руководителя *</label>
                <input
                  type="text"
                  value={leader.name}
                  onChange={(e) => handleUpdateLeader('name', e.target.value)}
                  placeholder="Иванова Анна Петровна"
                  className={`w-full sleek-input rounded-xl p-3 text-sm focus:ring-cyan-500 ${!leader.name.trim() ? 'border-amber-300 bg-amber-50/10' : 'border-gray-300'}`}
                />
              </div>

              {/* Роль в проекте - READ ONLY */}
              <div>
                <label className="text-xs text-gray-400 font-bold mb-1.5 block">Роль в проекте *</label>
                <input
                  type="text"
                  value="Руководитель проекта"
                  disabled
                  className="w-full sleek-input rounded-xl p-3 text-sm bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed font-medium shadow-inner"
                />
              </div>
            </div>

            {/* Опыт и компетенции */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-gray-700 font-bold block">Опыт и ключевые компетенции руководителя *</label>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${leader.experience.length >= 30 ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-600'}`}>
                  {leader.experience.length} / 500 знаков (мин. 30)
                </span>
              </div>
              <textarea
                value={leader.experience}
                onChange={(e) => handleUpdateLeader('experience', e.target.value.slice(0, 500))}
                placeholder='Напишите, какие проекты вы уже реализовывали, какое образование или навыки помогут именно в этом проекте. Избегайте общих хвaлебных фраз.'
                className={`w-full sleek-input rounded-xl p-3.5 text-xs md:text-sm h-[110px] resize-none focus:ring-cyan-500 ${leader.experience.length < 30 ? 'border-amber-300 bg-amber-50/10' : 'border-gray-300'}`}
              />
              <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-extrabold text-cyan-600">Подсказка:</span> «Напишите, какие проекты вы уже реализовывали, какое образование или навыки помогут именно в этом проекте. Пример: "Руководитель волонтёрского центра 'Импульс' с 2022 года, организовала 3 форума с охватом 500+ участников, диплом по специальности 'Менеджмент социально-культурной деятельности'"».
              </p>
            </div>
          </div>
        </div>

        {/* BLOCK 2: KEY TEAM MEMBERS (MINIMUM 1) */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 className="text-base md:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                <Users size={18} />
              </div>
              2. Ключевые члены команды
              <span className="text-xs text-red-500 font-bold">* Обязательно минимум 1</span>
            </h3>

            {/* Micro badge about roles according to sphere selection */}
            <span className="bg-slate-100 text-slate-700 font-medium text-[10px] px-2.5 py-1 rounded-full border border-slate-200">
              Сфера: {data.projectSphereName || getSphereName(sphereId)}
            </span>
          </div>

          <div className="space-y-6">
            {members.map((member, idx) => {
              const cardValid = member.name.trim() !== '' && 
                                member.experience.trim().length >= 30 &&
                                (member.role !== 'Другое' || member.customRole.trim() !== '');

              return (
                <div 
                  key={idx} 
                  className={`relative p-5 md:p-6 bg-white border rounded-[28px] shadow-xs transition-all duration-200 ${cardValid ? 'border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/10 shadow-sm' : 'border-gray-200 hover:border-cyan-300'}`}
                >
                  {/* Delete Button */}
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      title="Удалить члена команды"
                      className="absolute top-4 right-4 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 p-2 rounded-xl transition border border-gray-100 hover:border-rose-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  {/* Member Index Card Tag */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-black rounded-lg uppercase tracking-wider mb-4">
                    Член команды #{idx + 1}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Role selection group dropdown */}
                      <div>
                        <label className="text-xs text-gray-700 font-bold mb-1.5 block">Роль в проекте *</label>
                        <RoleSelector
                          value={member.role}
                          customValue={member.customRole}
                          sphereId={sphereId}
                          onChange={(role, custom) => {
                            handleUpdateMember(idx, 'role', role);
                            if (custom !== undefined) {
                              handleUpdateMember(idx, 'customRole', custom);
                            }
                          }}
                        />

                        {/* Custom role conditional input text */}
                        {member.role === 'Другое' && (
                          <div className="mt-2.5 animate-in slide-in-from-top-1.5 duration-150">
                            <label className="text-[10px] text-rose-600 font-black mb-1 block">Введите название роли *</label>
                            <input
                              type="text"
                              value={member.customRole}
                              onChange={(e) => handleUpdateMember(idx, 'customRole', e.target.value)}
                              placeholder="Например: SMM-специалист"
                              className="w-full sleek-input rounded-xl p-2 px-3 text-xs focus:ring-rose-500 border-rose-300 bg-rose-50/5 font-medium"
                            />
                          </div>
                        )}
                      </div>

                      {/* Name placeholder FIO */}
                      <div>
                        <label className="text-xs text-gray-700 font-bold mb-1.5 block">ФИО специалиста *</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleUpdateMember(idx, 'name', e.target.value)}
                          placeholder="Смирнова Дарья Игоревна"
                          className="w-full sleek-input rounded-xl p-2.5 text-xs md:text-sm font-medium focus:ring-cyan-500 border-gray-300"
                        />
                      </div>
                    </div>

                    {/* Experience textarea */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs text-gray-700 font-bold block">Опыт работы в релевантных проектах *</label>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${member.experience.length >= 30 ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-600'}`}>
                          {member.experience.length} / 500 знаков (мин. 30)
                        </span>
                      </div>
                      <textarea
                        value={member.experience}
                        onChange={(e) => handleUpdateMember(idx, 'experience', e.target.value.slice(0, 500))}
                        placeholder='Покажите, почему этот человек подходит на роль. Например: "Педагог дополнительного образования с 5-летним стажем, вёл курсы ораторского искусства в школе №15..."'
                        className="w-full sleek-input rounded-xl p-3 text-xs md:text-sm h-[75px] resize-none focus:ring-cyan-500 border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddMember}
            className="w-full py-4 border-2 border-dashed border-gray-300 hover:border-cyan-400 text-gray-500 hover:text-cyan-600 rounded-[24px] flex items-center justify-center gap-2 font-bold transition-all bg-white hover:bg-slate-50 shadow-xs"
          >
            <Plus size={16} />
            Добавить члена команды
          </button>
        </div>

        {/* BLOCK: VOLUNTEERS (INDIVIDUAL ONLY) */}
        {isIndividual && (
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                Волонтёры и консультанты (неоплачиваемая поддержка)
              </h3>
              <p className="text-xs text-gray-500">Для заявителей-физлиц это подтверждает вашу способность реализовать проект</p>
            </div>

            <div className="space-y-4">
              {volunteers.map((vol, idx) => (
                <div key={idx} className="relative p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <button
                    type="button"
                    onClick={() => handleRemoveVolunteer(idx)}
                    title="Удалить"
                    className="absolute top-4 right-4 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 p-2 rounded-xl transition border border-gray-100 hover:border-rose-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 mt-2">
                    <div>
                      <label className="text-xs text-gray-700 font-bold mb-1.5 block">ФИО *</label>
                      <input
                        type="text"
                        value={vol.name}
                        onChange={(e) => handleUpdateVolunteer(idx, 'name', e.target.value)}
                        placeholder="Алексей Сидоров"
                        className="w-full sleek-input rounded-xl p-2.5 text-xs font-medium focus:ring-cyan-500 border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-700 font-bold mb-1.5 block">Роль / чем помогает *</label>
                      <input
                        type="text"
                        value={vol.role}
                        onChange={(e) => handleUpdateVolunteer(idx, 'role', e.target.value)}
                        placeholder="Помощник координатора"
                        className="w-full sleek-input rounded-xl p-2.5 text-xs font-medium focus:ring-cyan-500 border-gray-300"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs text-gray-700 font-bold block">Опыт и компетенции *</label>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${vol.experience.length >= 30 ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-600'}`}>
                        {vol.experience.length} / 300 знаков (мин. 30)
                      </span>
                    </div>
                    <textarea
                      value={vol.experience}
                      onChange={(e) => handleUpdateVolunteer(idx, 'experience', e.target.value.slice(0, 300))}
                      placeholder="Опишите конкретный опыт помощника..."
                      className="w-full sleek-input rounded-xl p-3 text-xs h-[75px] resize-none focus:ring-cyan-500 border-gray-300"
                    />
                  </div>
                </div>
              ))}
            </div>

            {volunteers.length < 2 && (
              <button
                type="button"
                onClick={handleAddVolunteer}
                className="w-max px-4 py-2 border-2 border-dashed border-gray-300 hover:border-cyan-400 text-gray-500 hover:text-cyan-600 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all bg-white hover:bg-slate-50"
              >
                <Plus size={14} />
                Добавить волонтёра
              </button>
            )}
          </div>
        )}

        {/* BLOCK: EXTRA FUNCTIONS */}
        <div className="pt-6 border-t border-gray-100">
          <label className="text-sm font-black text-gray-900 block mb-2">Как закрыты остальные функции</label>
          <p className="text-xs text-gray-500 mb-3">Если каких-то функций нет в команде (бухгалтер, юрист, дизайнер, PR), опишите, как вы их закроете (самостоятельно, аутсорсинг, партнёры, волонтёры).</p>
          <div className="relative">
            <textarea
              value={extraFunctions}
              onChange={(e) => handleUpdateExtraFunctions(e.target.value.slice(0, 200))}
              placeholder="Бухгалтер на аутсорсинге, PR-функции берёт на себя лидер..."
              className="w-full sleek-input rounded-2xl p-4 text-sm resize-none h-[90px] focus:ring-cyan-500 border-gray-300"
            />
            <div className="absolute bottom-3 right-4 text-[10px] text-gray-400 font-medium">
              {extraFunctions.length} / 200
            </div>
          </div>
        </div>

        {/* PREVIEW BLOCK */}
        <div className="bg-slate-50/70 border border-gray-200 rounded-2xl p-6 mt-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 mb-4">
            <h4 className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={16} className="text-cyan-500" />
              Предпросмотр раздела "Команда"
            </h4>
            <button
              type="button"
              onClick={handleCopyPreview}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black tracking-tight transition-all shadow-sm ${
                isCopied 
                  ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                  : 'bg-white text-gray-700 hover:text-cyan-600 border border-gray-300 hover:border-cyan-400'
              }`}
            >
              {isCopied ? (
                <>
                  <Check size={13} />
                  Текст скопирован
                </>
              ) : (
                <>
                  <Copy size={13} />
                  Копировать текст
                </>
              )}
            </button>
          </div>
          <div 
            className="team-preview text-sm text-gray-800 leading-relaxed max-h-[350px] overflow-y-auto pr-2"
            dangerouslySetInnerHTML={{ __html: buildTeamPreviewHTML() }}
          />
        </div>

        {/* BLOCK 3: CHECKLIST VALIDATION */}
        <div className="pt-8 border-t border-gray-100 space-y-4">
          <h3 className="text-base md:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <CheckCircle className="text-cyan-500" size={20} />
            3. Профессиональный чек-лист готовности
          </h3>

          <div className="space-y-3.5 bg-gray-50/70 p-5 rounded-[24px] border border-gray-100">
            {[
              {
                title: 'В команде есть руководитель и хотя бы один профильный специалист.',
                desc: 'Все базовые организационные узлы прикрыты конкретными людьми.'
              },
              {
                title: 'Опыт каждого описан конкретно (с цифрами, проектами, сроками), а не общими словами.',
                desc: 'Избегайте абстрактных фраз вроде «организованный, добрый, трудолюбивый».'
              },
              {
                title: 'Все ключевые функции проекта (управление, обучение/контент, PR, отчётность) закрыты.',
                desc: 'Если у вас нет PR-менеджера или бухгалтера, опишите, как закроете эти функции (например, силами лидера).'
              }
            ].map((item, idx) => (
              <label key={idx} className="flex items-start gap-3.5 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded text-cyan-500 focus:ring-cyan-500 border-gray-300 h-5 w-5 mt-0.5 cursor-pointer"
                  checked={checklist[idx] || false}
                  onChange={() => handleCheck(idx)}
                />
                <div className="select-none">
                  <span className={`text-xs md:text-sm leading-snug block ${checklist[idx] ? 'text-gray-950 font-black' : 'text-gray-700 group-hover:text-gray-900 font-medium'}`}>
                    {item.title}
                  </span>
                  <span className="text-[10px] text-gray-500/90 leading-relaxed block mt-0.5">
                    {item.desc}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {!allChecklistMarked && (
            <div className="text-xs text-red-500 font-semibold flex items-center gap-1.5 justify-center sm:justify-start bg-red-50 p-3 rounded-2xl max-w-fit border border-red-100">
              <AlertCircle size={14} />
              Пожалуйста, отметьте все 3 обязательных пункта чек-листа для продолжения!
            </div>
          )}
        </div>

      </div>
    </StepLayout>
  );
};

// Simple utility function to translate sphere ID into human readable label
const getSphereName = (id: string): string => {
  switch (id) {
    case 'education': return 'Образование и просвещение';
    case 'eco': return 'Экология и защита животных';
    case 'culture': return 'Культура, искусство и креативные индустрии';
    case 'it': return 'IT и инновации';
    case 'social': return 'Молодёжная политика и социум';
    case 'urban': return 'Урбанистика';
    case 'sport': return 'Спорт и ЗОЖ';
    case 'patriotism': return 'Патриотическое воспитание';
    default: return 'Другое';
  }
};
