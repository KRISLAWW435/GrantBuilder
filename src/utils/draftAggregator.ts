import { ProjectData } from '../types.ts';

function cleanDuplicates(text: string): string {
  if (!text) return '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const uniqueLines = Array.from(new Set(lines));
  return uniqueLines.join('\n\n');
}

export function generateCleanDraft(data: ProjectData): string {
  const parts: string[] = [];

  // 1. Название проекта
  parts.push(`# ЗАЯВКА НА ГРАНТ\n\n## Название проекта:\n**${data.projectTitle || 'Не указано'}**`);

  // 2. Краткая суть
  if (data.shortDescription) {
    parts.push(`## Краткая суть проекта\n${data.shortDescription}`);
  }

  // 3. Обоснование актуальности
  let relevance = `## Обоснование актуальности проекта\n\n`;
  relevance += `**Описание социальной проблемы:**\n${data.projectProblem || 'Не указано'}\n\n`;
  
  if (data.problemFactors && data.problemFactors.length > 0) {
    const factorsText = data.problemFactors
      .map(f => f === 'other' ? (data.customProblemFactor || 'Другой фактор') : f)
      .join(', ');
    relevance += `**Факторы возникновения проблемы:**\n${factorsText}\n\n`;
  }
  
  if (data.problemConsequences && data.problemConsequences.length > 0) {
    const consequencesText = data.problemConsequences
      .map(c => c === 'other' ? (data.customProblemConsequence || 'Другие последствия') : c)
      .join(', ');
    relevance += `**Негативные последствия проблемы:**\n${consequencesText}\n\n`;
  }
  
  relevance += `**Предлагаемое решение:**\n${data.problemSolution || 'Не указано'}\n\n`;
  
  if (data.problemEvidence && data.problemEvidence.length > 0) {
    relevance += `**Доказательства актуальности проблемы (статистика, исследования):**\n${data.problemEvidence.join(', ')}\n`;
    if (data.problemEvidenceLinks) {
      relevance += `**Источники/ссылки на данные:** ${data.problemEvidenceLinks}\n`;
    }
    relevance += `\n`;
  }
  
  relevance += `**Срочность решения проблемы:**\n${data.problemUrgency || 'Не указано'}`;
  parts.push(relevance);

  // 4. Целевая аудитория
  const groupList = (data.targetGroups || []).map(g => g === 'other' ? (data.customTargetGroup || 'Другая группа') : g);
  const groupName = groupList.length > 0 ? groupList.join(', ') : 'Не указана';
  
  let audience = `## Целевая аудитория\n\n`;
  audience += `**Целевая группа:** ${groupName}\n\n`;
  audience += `**Возраст целевой группы:** с ${data.ageFrom || '___'} до ${data.ageTo || '___'} лет\n\n`;
  audience += `**Мотивация участников (зачем им это нужно?):**\n${data.targetMotivation || 'Не указано'}\n\n`;
  audience += `**Прямой охват (непосредственные участники):** ${data.directReach || '0'} человек\n\n`;
  audience += `**Косвенный охват (родственники, зрители, благополучатели):** ${data.indirectReach || '0'} человек\n\n`;
  audience += `**Обоснование количественных показателей охвата:**\n${data.reachJustification || 'Не указано'}`;
  parts.push(audience);

  // 5. Календарный план
  let plan = `## Календарный план реализации проекта\n\n`;
  const stagesList = data.step5Stages || [];
  if (stagesList.length > 0) {
    stagesList.forEach((stage, idx) => {
      plan += `### Этап ${idx + 1}. ${stage.title}\n`;
      plan += `**Сроки проведения этапа:** ${stage.start || '___'} – ${stage.end || '___'}\n\n`;
      plan += `**Ключевые запланированные действия:**\n${stage.actions || 'Не указаны'}\n\n`;
      plan += `**Измеримые количественные результаты (KPI):**\n${stage.kpi || 'Не указаны'}\n\n`;
      plan += `**Подтверждающие материалы (артефакты):**\n${stage.artifact || 'Не указаны'}\n\n`;
    });
  } else {
    plan += `Календарный план еще не сформирован.`;
  }
  parts.push(plan);

  // 6. Бюджет
  let budget = `## Бюджет и финансовое обеспечение проекта\n\n`;
  const bItems = data.step6BudgetItems || [];
  if (bItems.length > 0) {
    budget += `### Таблица планируемых расходов\n\n`;
    budget += `| Статья расходов | Описание и детализация | Запрашиваемая сумма (руб.) | Софинансирование (руб.) | Всего (руб.) |\n`;
    budget += `| --- | --- | ---: | ---: | ---: |\n`;
    
    let totalReq = 0;
    let totalCo = 0;
    bItems.forEach(item => {
      const r = Number(item.requested) || 0;
      const c = Number(item.coFinance) || 0;
      const itemTotal = r + c;
      totalReq += r;
      totalCo += c;
      budget += `| ${item.category} | ${item.detail} | ${r.toLocaleString('ru-RU')} | ${c.toLocaleString('ru-RU')} | ${itemTotal.toLocaleString('ru-RU')} |\n`;
    });
    
    const grandTotal = totalReq + totalCo;
    const coPercent = grandTotal > 0 ? ((totalCo / grandTotal) * 100).toFixed(1) : '0';
    
    budget += `| **ИТОГО** | **Сводные финансовые итоги** | **${totalReq.toLocaleString('ru-RU')}** | **${totalCo.toLocaleString('ru-RU')}** | **${grandTotal.toLocaleString('ru-RU')}** |\n\n`;
    
    budget += `### Итоговая финансовая сводка\n`;
    budget += `- **Общая стоимость проекта:** ${grandTotal.toLocaleString('ru-RU')} руб.\n`;
    budget += `- **Общая запрашиваемая сумма гранта:** ${totalReq.toLocaleString('ru-RU')} руб.\n`;
    budget += `- **Общий объем софинансирования:** ${totalCo.toLocaleString('ru-RU')} руб. (${coPercent}% от стоимости)\n`;
  } else {
    budget += `Бюджет еще не заполнен подробными элементами расходов.`;
  }
  parts.push(budget);

  // 7. Партнеры
  if (data.step6HasPartners && data.step6Partners && data.step6Partners.length > 0) {
    let partnersText = `## Партнёры проекта и формы поддержки\n\n`;
    data.step6Partners.forEach((pt, pIdx) => {
      partnersText += `**Партнёр ${pIdx + 1}:** ${pt.name || 'Не указано'}\n`;
      partnersText += `- **Вид поддержки:** ${pt.supportType || 'Организационная/информационная/материальная'}\n`;
      partnersText += `- **Описание помощи:** ${pt.description || 'Не заполнено'}\n\n`;
    });
    parts.push(partnersText);
  }

  // 8. Команда
  let team = `## Команда и компетенции исполнителей\n\n`;
  
  const leaderRef = data.step7Leader || { name: '', experience: '' };
  team += `### Руководитель проекта\n`;
  team += `**ФИО:** ${leaderRef.name || 'Не указано'}\n`;
  team += `**Роль:** Руководитель проекта\n`;
  team += `**Опыт и ключевые компетенции:**\n${leaderRef.experience || 'Не заполнено'}\n\n`;
  
  const membersList = data.step7Members || [];
  if (membersList.length > 0) {
    team += `### Ключевые члены команды\n\n`;
    membersList.forEach((m, mIdx) => {
      const displayRole = m.role === 'Другое' ? m.customRole : m.role;
      team += `**Член команды ${mIdx + 1}:** ${m.name || 'Не указано'}\n`;
      team += `- **Роль в проекте:** ${displayRole || 'Не указана'}\n`;
      team += `- **Релевантный опыт:** ${m.experience || 'Не заполнено'}\n\n`;
    });
  }
  parts.push(team);

  // 9. Памятка финальной проверки
  let checklistPamyatka = `## Памятка финальной проверки\n\n`;
  checklistPamyatka += `Перед отправкой заявки на официальный портал убедитесь в следующих критических моментах:\n\n`;
  checklistPamyatka += `- [ ] Название проекта отражает его суть и цели выбранной темы конкурса (Шаг 1).\n`;
  checklistPamyatka += `- [ ] Проверены все формальные требования фонда (статус заявителя, возраст участников, сроки).\n`;
  checklistPamyatka += `- [ ] Бюджет сходится, все статьи расшифрованы, налоги учтены.\n`;
  checklistPamyatka += `- [ ] Календарный план реален по срокам, нет пересечений с праздниками/каникулами.\n`;
  checklistPamyatka += `- [ ] К каждому этапу указаны подтверждающие материалы (фото, списки, анкеты).\n`;
  checklistPamyatka += `- [ ] Опыт команды описан конкретно, с цифрами и примерами.\n`;
  checklistPamyatka += `- [ ] В тексте нет «воды», общих фраз и необоснованных обещаний.\n`;
  checklistPamyatka += `- [ ] Я проанализировал(а) заявку с помощью DeepSeek и вручную исправил(а) все указанные им слабые места.\n`;
  
  parts.push(checklistPamyatka);

  return parts.join('\n\n---\n\n');
}
