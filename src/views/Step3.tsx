import React, { useState, useEffect, useRef } from 'react';
import { StepLayout } from '../components/StepLayout.tsx';
import { useAppContext } from '../store.tsx';
import { HelpCircle, Check, Sparkles, Star, AlertCircle, Info } from 'lucide-react';
import { calculateProjectScores } from '../utils/scoreCalculator.ts';

interface GroupOption {
  id: string;
  name: string;
  isYouthOnly: boolean;
  excludedFunds?: string[];
  motivations?: MotivationOption[];
}

interface MotivationOption {
  id: string;
  label: string;
}

const GROUP_ICONS: Record<string, string> = {
  'Школьники (1–4 классы)': '🎒',
  'Школьники (5–9 классы)': '🏫',
  'Школьники (10–11 классы, выпускники)': '🎓',
  'Школьники 5–11 классов': '🏫',
  'Студенты СПО (колледжей)': '🧑‍🎓',
  'Студенты вузов (бакалавриат)': '🧑‍🎓',
  'Студенты': '🧑‍🎓',
  'Молодые специалисты (до 30 лет)': '💼',
  'Молодые специалисты (до 35 лет)': '💼',
  'Молодые педагоги (до 35 лет)': '👩‍🏫',
  'Молодые учёные и исследователи (до 35 лет)': '🔬',
  'Старшие подростки (14–18 лет)': '🎒',
  'Педагоги, наставники': '👩‍🏫',
  'Родители школьников': '👨‍👩',
  'Жители конкретного микрорайона': '🏡',
  'Жители конкретного микрорайона, двора': '🏡',
  'Экоактивисты, волонтёры': '🌿',
  'Экоактивисты и волонтёры': '🌿',
  'Семьи с детьми': '🧸',
  'Владельцы домашних животных': '🐾',
  'Студенческий актив (лидеры сообществ)': '⚡',
  'Подростки в трудной жизненной ситуации': '❤️',
  'Молодые семьи с детьми': '👨‍👩‍👧‍👦',
  'Молодежные волонтерские отряды': '🤝',
  'Самозанятая молодежь': '💻',
  'Многодетные родители': '👨‍👩‍👧‍👦',
  'Пожилые жители (серебряные волонтеры)': '👵',
  'Молодые архитекторы, урбанисты и дизайнеры': '📐',
  'Локальные городские активисты': '📣',
  'Студенты строительных / творческих специальностей': '📐',
  'Молодые любители массового спорта': '🏃',
  'Новички в фитнесе и здоровом образе жизни': '💪',
  'Дети и подростки из неблагополучных семей': '👦',
  'Студенческие спорческие клубы': '🏆',
  'Студенческие спортивные клубы': '🏆',
  'Инструкторы и спортивные тренеры': '📣',
  'Пожилые любители активного образа жизни': '🚶',
  'Творческая молодежь (музыканты, художники, актеры)': '🎨',
  'Студенты гуманитарных и творческих вузов / колледжей': '🎭',
  'Молодые дизайнеры, иллюстраторы, цифровые художники': '🎨',
  'Молодые литераторы, поэты, писатели': '✍️',
  'Молодые ремесленники, мастера народных промыслов': '🏺',
  'Участники любительских творческих коллективов (театральных, музыкальных, танцевальных)': '🎭',
  'Молодые организаторы культурных событий (event-менеджеры, кураторы)': '🎟️',
  'Молодые блогеры и создатели контента в сфере культуры': '📱',
  'Начинающие музыканты, актёры, художники (без профильного образования)': '🎻',
  'Молодые преподаватели творческих дисциплин (до 35 лет)': '👩‍🏫',
  'Любители локальной истории, краеведы': '📜',
  'Начинающие мастера народных промыслов и ремесел': '🍯',
  'Краеведы и историки старшего поколения': '🔍',
  'Воспитанники военно-патриотических клубов': '🎖️',
  'Школьники старших классов': '🎒',
  'Студенты исторических и педагогических направлений': '📚',
  'Молодые исследователи и краеведы': '🔬',
  'Ветераны и историки': '🎖️'
};

const FUND_AUDIENCE_REQUIREMENTS: Record<string, {text: string, age_min: number | null, age_max: number | null, allow_multiple_groups: boolean, max_groups: number}> = {
  rosmol: {
    text: "Целевая аудитория — граждане РФ 14–35 лет. Проект должен решать конкретную проблему молодёжи. Убедитесь, что ваша целевая группа и их потребность соответствуют выбранной номинации.",
    age_min: 14,
    age_max: 35,
    allow_multiple_groups: true,
    max_groups: 3
  },
  fpg: {
    text: "ФПГ не устанавливает жёстких возрастных рамок. Приоритет — социально незащищённые группы. Опишите, какую социальную проблему решает проект для данной аудитории.",
    age_min: null,
    age_max: null,
    allow_multiple_groups: true,
    max_groups: 3
  },
  pfki: {
    text: "ПФКИ поддерживает проекты в сфере культуры и креативных индустрий. Целевая аудитория может быть любой, но важна культурная потребность, которую закрывает проект.",
    age_min: null,
    age_max: null,
    allow_multiple_groups: true,
    max_groups: 3
  },
  other: {
    text: "Ознакомьтесь с требованиями выбранного конкурса к целевой аудитории и впишите их вручную.",
    age_min: null,
    age_max: null,
    allow_multiple_groups: true,
    max_groups: 3
  },
  fsi: {
    text: "Фонд содействия инновациям поддерживает технологические и наукоемкие проекты. Опишите целевую аудиторию, которая будет использовать ваши инновационные решения.",
    age_min: null,
    age_max: null,
    allow_multiple_groups: true,
    max_groups: 3
  }
};

const AUDIENCE_GROUPS_BY_SPHERE: Record<string, GroupOption[]> = {
  education: [
    {
      id: 'school_1_4',
      name: 'Школьники (1–4 классы)',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'edu_school_1_1', label: 'Познавать мир в игровой форме' },
        { id: 'edu_school_1_2', label: 'Развить творческие способности' },
        { id: 'edu_school_1_3', label: 'Научиться работать в команде' },
        { id: 'edu_school_1_4', label: 'Получить помощь в учёбе' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'school_5_9',
      name: 'Школьники (5–9 классы)',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'edu_school_5_1', label: 'Определиться с интересами и будущей профессией' },
        { id: 'edu_school_5_2', label: 'Подтянуть знания по школьным предметам' },
        { id: 'edu_school_5_3', label: 'Найти увлекательное хобби' },
        { id: 'edu_school_5_4', label: 'Подготовиться к олимпиадам' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'school_10_11',
      name: 'Школьники (10–11 классы, выпускники)',
      isYouthOnly: true,
      motivations: [
        { id: 'edu_school_10_1', label: 'Успешно сдать ЕГЭ/ОГЭ' },
        { id: 'edu_school_10_2', label: 'Выбрать вуз и специальность' },
        { id: 'edu_school_10_3', label: 'Получить профориентационную поддержку' },
        { id: 'edu_school_10_4', label: 'Развить навыки для взрослой жизни' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'students_spo',
      name: 'Студенты СПО (колледжей)',
      isYouthOnly: true,
      motivations: [
        { id: 'edu_spo_1', label: 'Получить практические навыки по специальности' },
        { id: 'edu_spo_2', label: 'Найти стажировку или работу' },
        { id: 'edu_spo_3', label: 'Познакомиться с профессионалами' },
        { id: 'edu_spo_4', label: 'Повысить конкурентоспособность' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'students_uni',
      name: 'Студенты вузов (бакалавриат)',
      isYouthOnly: true,
      motivations: [
        { id: 'edu_uni_1', label: 'Углубить профессиональные знания' },
        { id: 'edu_uni_2', label: 'Найти ментора' },
        { id: 'edu_uni_3', label: 'Построить карьерную траекторию' },
        { id: 'edu_uni_4', label: 'Принять участие в реальных проектах' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_specialists',
      name: 'Молодые специалисты (до 35 лет)',
      isYouthOnly: true,
      motivations: [
        { id: 'edu_spec_1', label: 'Углубить профессиональные знания' },
        { id: 'edu_spec_2', label: 'Найти ментора' },
        { id: 'edu_spec_3', label: 'Построить карьерную траекторию' },
        { id: 'edu_spec_4', label: 'Принять участие в реальных проектах' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_teachers',
      name: 'Молодые педагоги (до 35 лет)',
      isYouthOnly: true,
      motivations: [
        { id: 'edu_teach_1', label: 'Освоить новые методики преподавания' },
        { id: 'edu_teach_2', label: 'Найти наставника среди опытных коллег' },
        { id: 'edu_teach_3', label: 'Обменяться опытом с ровесниками' },
        { id: 'edu_teach_4', label: 'Получить грантовую поддержку для своих идей' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_scientists_edu',
      name: 'Молодые учёные и исследователи (до 35 лет)',
      isYouthOnly: true,
      motivations: [
        { id: 'edu_sci_1', label: 'Провести исследование' },
        { id: 'edu_sci_2', label: 'Опубликоваться в научном журнале' },
        { id: 'edu_sci_3', label: 'Найти финансирование' },
        { id: 'edu_sci_4', label: 'Выступить на конференции' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'older_teens_edu',
      name: 'Старшие подростки (14–18 лет)',
      isYouthOnly: true,
      motivations: [
        { id: 'edu_teen_1', label: 'Успешно сдать ЕГЭ/ОГЭ' },
        { id: 'edu_teen_2', label: 'Выбрать вуз и специальность' },
        { id: 'edu_teen_3', label: 'Получить профориентационную поддержку' },
        { id: 'edu_teen_4', label: 'Развить навыки для взрослой жизни' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'pedagogues',
      name: 'Педагоги, наставники',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'edu_ped_1', label: 'Повысить квалификацию' },
        { id: 'edu_ped_2', label: 'Поделиться опытом' },
        { id: 'edu_ped_3', label: 'Внедрить новые форматы обучения' },
        { id: 'edu_ped_4', label: 'Получить признание и поддержку' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'parents',
      name: 'Родители школьников',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'edu_par_1', label: 'Помочь ребёнку в учёбе' },
        { id: 'edu_par_2', label: 'Лучше понимать современное образование' },
        { id: 'edu_par_3', label: 'Найти развивающие занятия для детей' },
        { id: 'edu_par_4', label: 'Обменяться опытом с другими родителями' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    { id: 'other', name: 'Другое (свой вариант)', isYouthOnly: true }
  ],
  eco: [
    {
      id: 'residents',
      name: 'Жители конкретного микрорайона',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'eco_res_1', label: 'Решить локальную экопроблему (свалки, грязь)' },
        { id: 'eco_res_2', label: 'Научиться раздельному сбору отходов на практике' },
        { id: 'eco_res_3', label: 'Сделать свой район чище и зеленее' },
        { id: 'eco_res_4', label: 'Познакомиться с соседями через совместные акции' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'school_5_11',
      name: 'Школьники 5–11 классов',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'eco_sch_1', label: 'Узнать больше о природе и экологии' },
        { id: 'eco_sch_2', label: 'Принять участие в увлекательных экспедициях и акциях' },
        { id: 'eco_sch_3', label: 'Научиться заботиться об окружающей среде' },
        { id: 'eco_sch_4', label: 'Найти друзей среди юных экологов' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'school_8_11_eco',
      name: 'Школьники 8–11 классов',
      isYouthOnly: true,
      motivations: [
        { id: 'eco_sch_5', label: 'Узнать больше о природе и экологии' },
        { id: 'eco_sch_6', label: 'Принять участие в увлекательных экспедициях и акциях' },
        { id: 'eco_sch_7', label: 'Научиться заботиться об окружающей среде' },
        { id: 'eco_sch_8', label: 'Найти друзей среди юных экологов' },
        { id: 'eco_sch_9', label: 'Подготовиться к поступлению на экологические специальности' },
        { id: 'eco_sch_10', label: 'Провести собственное исследование' },
        { id: 'eco_sch_11', label: 'Стать лидером экодвижения в школе' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_eco_scientists',
      name: 'Молодые учёные-экологи, исследователи',
      isYouthOnly: true,
      motivations: [
        { id: 'eco_sci_1', label: 'Провести полевые исследования' },
        { id: 'eco_sci_2', label: 'Опубликовать научную работу' },
        { id: 'eco_sci_3', label: 'Найти финансирование для экологического проекта' },
        { id: 'eco_sci_4', label: 'Применить науку для решения реальных проблем региона' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'students',
      name: 'Студенты',
      isYouthOnly: true,
      motivations: [
        { id: 'eco_stud_1', label: 'Получить практический опыт в экологических проектах' },
        { id: 'eco_stud_2', label: 'Пройти стажировку в профильной организации' },
        { id: 'eco_stud_3', label: 'Познакомиться с потенциальными работодателями' },
        { id: 'eco_stud_4', label: 'Внести вклад в охрану природы' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'eco_activists',
      name: 'Экоактивисты и волонтёры',
      isYouthOnly: true,
      motivations: [
        { id: 'eco_act_1', label: 'Организовать масштабную экологическую акцию' },
        { id: 'eco_act_2', label: 'Привлечь внимание к острой проблеме' },
        { id: 'eco_act_3', label: 'Получить ресурсы и поддержку для своих идей' },
        { id: 'eco_act_4', label: 'Обучить других ответственному отношению к природе' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_pet_owners_volunteers',
      name: 'Молодые владельцы домашних животных, зооволонтёры',
      isYouthOnly: true,
      motivations: [
        { id: 'eco_pet_1', label: 'Помочь бездомным животным' },
        { id: 'eco_pet_2', label: 'Научиться правильно ухаживать за питомцами' },
        { id: 'eco_pet_3', label: 'Найти единомышленников среди зоозащитников' },
        { id: 'eco_pet_4', label: 'Стерилизовать/привить животных по льготной программе' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'families_kids',
      name: 'Семьи с детьми',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'eco_fam_1', label: 'Научить детей любить природу' },
        { id: 'eco_fam_2', label: 'Провести время с пользой на свежем воздухе' },
        { id: 'eco_fam_3', label: 'Участвовать в семейных экоквестах и пикниках' },
        { id: 'eco_fam_4', label: 'Внести вклад в сохранение природы для будущих поколений' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'pet_owners',
      name: 'Владельцы домашних животных',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'eco_po_1', label: 'Помочь бездомным животным' },
        { id: 'eco_po_2', label: 'Научиться правильно ухаживать за питомцами' },
        { id: 'eco_po_3', label: 'Найти единомышленников среди зоозащитников' },
        { id: 'eco_po_4', label: 'Стерилизовать/привить животных по льготной программе' },
        { id: 'eco_po_5', label: 'Получить консультацию ветеринара или кинолога' },
        { id: 'eco_po_6', label: 'Найти компанию для совместных прогулок' },
        { id: 'eco_po_7', label: 'Благоустроить площадку для выгула' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    { id: 'other', name: 'Другое (свой вариант)', isYouthOnly: true }
  ],
  it: [
    {
      id: 'school_7_11_it',
      name: 'Школьники 7–11 классов (юные программисты)',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'it_school_1', label: 'Попробовать себя в IT и определиться с будущей профессией' },
        { id: 'it_school_2', label: 'Подготовиться к олимпиадам, ОГЭ/ЕГЭ по информатике' },
        { id: 'it_school_3', label: 'Научиться создавать сайты, игры или мобильные приложения' },
        { id: 'it_school_4', label: 'Найти единомышленников и участвовать в хакатонах для начинающих' },
        { id: 'it_school_5', label: 'Получить поддержку наставника для первых IT-проектов' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'it_hackathon_participants',
      name: 'Участники школьных и студенческих IT-кружков, хакатонов',
      isYouthOnly: true,
      motivations: [
        { id: 'it_hack_1', label: 'Развить навыки командной работы над IT-проектами' },
        { id: 'it_hack_2', label: 'Найти ментора или потенциального работодателя' },
        { id: 'it_hack_3', label: 'Создать работающий прототип для портфолио' },
        { id: 'it_hack_4', label: 'Подготовиться к всероссийским/международным соревнованиям' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_it_teachers',
      name: 'Молодые IT-преподаватели и наставники (до 35 лет)',
      isYouthOnly: true,
      motivations: [
        { id: 'it_teacher_young_1', label: 'Передать опыт молодому поколению' },
        { id: 'it_teacher_young_2', label: 'Повысить квалификацию в современных технологиях' },
        { id: 'it_teacher_young_3', label: 'Внедрить новые методики преподавания информатики' },
        { id: 'it_teacher_young_4', label: 'Найти поддержку и обменяться опытом с коллегами' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'students_it',
      name: 'Студенты IT-специальностей вузов/колледжей',
      isYouthOnly: true,
      motivations: [
        { id: 'it_stud_1', label: 'Освоить востребованную IT-специальность' },
        { id: 'it_stud_2', label: 'Попасть в сообщество разработчиков и инноваторов' },
        { id: 'it_stud_3', label: 'Создать работающий прототип для портфолио' },
        { id: 'it_stud_4', label: 'Найти ментора или потенциального работодателя' },
        { id: 'it_stud_5', label: 'Получить практический опыт в реальных IT-проектах' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'developers_startups',
      name: 'Начинающие разработчики и стартаперы',
      isYouthOnly: true,
      motivations: [
        { id: 'it_dev_startup_1', label: 'Создать собственный технологический проект/стартап' },
        { id: 'it_dev_startup_2', label: 'Получить практический опыт в реальных IT-проектах' },
        { id: 'it_dev_startup_3', label: 'Найти ментора или потенциального работодателя' },
        { id: 'it_dev_startup_4', label: 'Попасть в сообщество разработчиков и инноваторов' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_scientists',
      name: 'Молодые ученые и исследователи',
      isYouthOnly: true,
      motivations: [
        { id: 'it_sci_1', label: 'Провести исследование на стыке IT и науки' },
        { id: 'it_sci_2', label: 'Опубликовать научную работу или выступить на конференции' },
        { id: 'it_sci_3', label: 'Найти коллег для междисциплинарных проектов' },
        { id: 'it_sci_4', label: 'Получить доступ к вычислительным ресурсам/лабораториям' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'teachers_it',
      name: 'Преподаватели информатики и наставники',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'it_teacher_1', label: 'Передать опыт молодому поколению' },
        { id: 'it_teacher_2', label: 'Повысить квалификацию в современных технологиях' },
        { id: 'it_teacher_3', label: 'Внедрить новые методики преподавания информатики' },
        { id: 'it_teacher_4', label: 'Найти поддержку и обменяться опытом с коллегами' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'startup_entrepreneurs',
      name: 'Стартаперы и технологические предприниматели',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'it_ent_1', label: 'Создать собственный технологический проект/стартап' },
        { id: 'it_ent_2', label: 'Найти инвестора или ментора' },
        { id: 'it_ent_3', label: 'Протестировать MVP на реальной аудитории' },
        { id: 'it_ent_4', label: 'Попасть в акселератор или бизнес-инкубатор' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    { id: 'other', name: 'Другое (свой вариант)', isYouthOnly: true }
  ],
  social: [
    {
      id: 'community_leaders',
      name: 'Студенческий актив (лидеры сообществ)',
      isYouthOnly: true,
      motivations: [
        { id: 'soc_lead_1', label: 'Развить лидерские и управленческие навыки' },
        { id: 'soc_lead_2', label: 'Реализовать собственную социальную инициативу' },
        { id: 'soc_lead_3', label: 'Найти поддержку и ресурсы для своего проекта' },
        { id: 'soc_lead_4', label: 'Обменяться опытом с активистами из других регионов' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'youth_difficult_life',
      name: 'Молодые люди, находящиеся в трудной жизненной ситуации',
      isYouthOnly: true,
      motivations: [
        { id: 'soc_dif_1', label: 'Получить помощь в социализации и адаптации' },
        { id: 'soc_dif_2', label: 'Найти наставника и поддержку' },
        { id: 'soc_dif_3', label: 'Повысить самооценку и поверить в свои силы' },
        { id: 'soc_dif_4', label: 'Приобрести полезные навыки для самостоятельной жизни' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_families_kids',
      name: 'Молодые семьи с детьми',
      isYouthOnly: true,
      motivations: [
        { id: 'soc_fam_1', label: 'Улучшить жилищные или бытовые условия' },
        { id: 'soc_fam_2', label: 'Получить знания о воспитании и развитии детей' },
        { id: 'soc_fam_3', label: 'Найти сообщество таких же молодых родителей' },
        { id: 'soc_fam_4', label: 'Организовать досуг для всей семьи' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'disabled_youth_social',
      name: 'Молодые люди с ограниченными возможностями здоровья (ОВЗ)',
      isYouthOnly: true,
      motivations: [
        { id: 'soc_dis_1', label: 'Преодолеть социальную изоляцию' },
        { id: 'soc_dis_2', label: 'Найти доступные форматы образования и работы' },
        { id: 'soc_dis_3', label: 'Получить поддержку в профориентации и трудоустройстве' },
        { id: 'soc_dis_4', label: 'Заниматься творчеством или спортом в инклюзивной среде' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_moms_maternity_leave',
      name: 'Молодые мамы в декретном отпуске',
      isYouthOnly: true,
      motivations: [
        { id: 'soc_mom_1', label: 'Найти возможности для удалённой работы или подработки' },
        { id: 'soc_mom_2', label: 'Получить новые знания, не выходя из дома' },
        { id: 'soc_mom_3', label: 'Сохранить профессиональные навыки во время декрета' },
        { id: 'soc_mom_4', label: 'Познакомиться с другими мамами для обмена опытом' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'volunteer_teams',
      name: 'Молодежные волонтерские отряды',
      isYouthOnly: true,
      motivations: [
        { id: 'soc_vol_1', label: 'Получить опыт организации социальных акций' },
        { id: 'soc_vol_2', label: 'Найти поддержку для своих волонтёрских инициатив' },
        { id: 'soc_vol_3', label: 'Пройти обучение и повысить квалификацию' },
        { id: 'soc_vol_4', label: 'Увидеть результаты своего труда в реальных изменениях' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'self_employed_youth',
      name: 'Самозанятая молодежь',
      isYouthOnly: true,
      motivations: [
        { id: 'soc_self_1', label: 'Продвинуть свои услуги и найти клиентов' },
        { id: 'soc_self_2', label: 'Получить юридическую и бухгалтерскую поддержку' },
        { id: 'soc_self_3', label: 'Обменяться опытом с другими самозанятыми' },
        { id: 'soc_self_4', label: 'Выйти на новый уровень дохода' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'large_families',
      name: 'Многодетные родители',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'soc_lrg_1', label: 'Получить помощь в организации семейного досуга' },
        { id: 'soc_lrg_2', label: 'Найти доступ к образовательным ресурсам для детей' },
        { id: 'soc_lrg_3', label: 'Улучшить материальное положение семьи' },
        { id: 'soc_lrg_4', label: 'Познакомиться с другими многодетными семьями' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'silver_volunteers',
      name: 'Пожилые жители (серебряные волонтеры)',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'soc_sil_1', label: 'Передать опыт молодому поколению' },
        { id: 'soc_sil_2', label: 'Оставаться активными и востребованными' },
        { id: 'soc_sil_3', label: 'Найти единомышленников для добрых дел' },
        { id: 'soc_sil_4', label: 'Освоить современные технологии для общения' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'students_colleges',
      name: 'Студенты средних специальных учебных заведений (ссузов)',
      isYouthOnly: true,
      motivations: [
        { id: 'soc_coll_1', label: 'Определиться с будущей профессией' },
        { id: 'soc_coll_2', label: 'Найти стажировку или подработку' },
        { id: 'soc_coll_3', label: 'Развить soft skills для карьеры' },
        { id: 'soc_coll_4', label: 'Поучаствовать в интересных внеучебных проектах' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    { id: 'other', name: 'Другое (свой вариант)', isYouthOnly: true }
  ],
  urban: [
    {
      id: 'young_architects',
      name: 'Молодые архитекторы, урбанисты и дизайнеры',
      isYouthOnly: true,
      motivations: [
        { id: 'urb_arch_1', label: 'Применить профессиональные знания для реального благоустройства' },
        { id: 'urb_arch_2', label: 'Увидеть свой проект реализованным в городской среде' },
        { id: 'urb_arch_3', label: 'Поработать в междисциплинарной команде' },
        { id: 'urb_arch_4', label: 'Получить обратную связь от жителей и экспертов' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_community_activists',
      name: 'Молодые активисты местных сообществ, ТОСов',
      isYouthOnly: true,
      motivations: [
        { id: 'urb_act_1', label: 'Сделать свой двор/район удобнее и красивее' },
        { id: 'urb_act_2', label: 'Объединить соседей для совместных действий' },
        { id: 'urb_act_3', label: 'Получить поддержку и ресурсы на реализацию идей' },
        { id: 'urb_act_4', label: 'Научиться взаимодействовать с местной властью' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_housing_specialists',
      name: 'Молодые специалисты в сфере ЖКХ и благоустройства',
      isYouthOnly: true,
      motivations: [
        { id: 'urb_house_1', label: 'Улучшить качество городской среды' },
        { id: 'urb_house_2', label: 'Внедрить современные технологии в ЖКХ' },
        { id: 'urb_house_3', label: 'Повысить свою квалификацию' },
        { id: 'urb_house_4', label: 'Найти единомышленников для обмена опытом' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_landscape_designers',
      name: 'Молодые ландшафтные дизайнеры и экологи-урбанисты',
      isYouthOnly: true,
      motivations: [
        { id: 'urb_land_1', label: 'Создать зелёные и комфортные пространства' },
        { id: 'urb_land_2', label: 'Реализовать проект с учётом экологических принципов' },
        { id: 'urb_land_3', label: 'Получить опыт в реальном проектировании' },
        { id: 'urb_land_4', label: 'Привлечь внимание к проблемам экологии города' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_urban_entrepreneurs',
      name: 'Молодые предприниматели в сфере городских сервисов',
      isYouthOnly: true,
      motivations: [
        { id: 'urb_ent_1', label: 'Запустить или протестировать бизнес-идею' },
        { id: 'urb_ent_2', label: 'Улучшить сервис для жителей' },
        { id: 'urb_ent_3', label: 'Найти партнёров и менторов' },
        { id: 'urb_ent_4', label: 'Получить поддержку от города или фонда' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_local_residents',
      name: 'Молодые жители конкретных районов/дворов (инициативные группы)',
      isYouthOnly: true,
      motivations: [
        { id: 'urb_res_1', label: 'Решить конкретную проблему своего двора' },
        { id: 'urb_res_2', label: 'Превратить заброшенное место в общественное пространство' },
        { id: 'urb_res_3', label: 'Научиться оформлять заявки на гранты' },
        { id: 'urb_res_4', label: 'Сплотить соседей вокруг общей идеи' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'residents_local',
      name: 'Жители конкретного микрорайона, двора',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'urb_res_local_1', label: 'Решить конкретную проблему своего двора' },
        { id: 'urb_res_local_2', label: 'Превратить заброшенное место в общественное пространство' },
        { id: 'urb_res_local_3', label: 'Научиться оформлять заявки на гранты' },
        { id: 'urb_res_local_4', label: 'Сплотить соседей вокруг общей идеи' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'local_activists',
      name: 'Локальные городские активисты',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'urb_act_local_1', label: 'Привлечь внимание к важной городской проблеме' },
        { id: 'urb_act_local_2', label: 'Организовать общественное обсуждение и найти решение' },
        { id: 'urb_act_local_3', label: 'Получить поддержку от НКО и муниципалитета' },
        { id: 'urb_act_local_4', label: 'Масштабировать успешный опыт на другие территории' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'students_construction',
      name: 'Студенты строительных / творческих специальностей',
      isYouthOnly: true,
      motivations: [
        { id: 'urb_stud_1', label: 'Получить практический опыт в реальном проекте' },
        { id: 'urb_stud_2', label: 'Поработать с профессионалами и наставниками' },
        { id: 'urb_stud_3', label: 'Увидеть результат своего труда в городе' },
        { id: 'urb_stud_4', label: 'Собрать портфолио для будущей карьеры' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'architects_designers',
      name: 'Архитекторы, дизайнеры, урбанисты',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'urb_arch_design_1', label: 'Применить свои компетенции для социально значимого проекта' },
        { id: 'urb_arch_design_2', label: 'Обменяться опытом с коллегами' },
        { id: 'urb_arch_design_3', label: 'Увидеть реализованный объект в портфолио' },
        { id: 'urb_arch_design_4', label: 'Получить признание профессионального сообщества' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'local_entrepreneurs',
      name: 'Местные предприниматели',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'urb_ent_local_1', label: 'Улучшить облик территории рядом с бизнесом' },
        { id: 'urb_ent_local_2', label: 'Привлечь больше клиентов за счёт благоустройства' },
                { id: 'urb_ent_local_3', label: 'Найти партнёров среди жителей и администрации' },
        { id: 'urb_ent_local_4', label: 'Внести вклад в развитие родного района' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    }
  ],
  sport: [
    {
      id: 'sport_lovers',
      name: 'Любители спорта',
      isYouthOnly: true,
      motivations: [
        { id: 'spr_love_1', label: 'Найти компанию для регулярных тренировок' },
        { id: 'spr_love_2', label: 'Попробовать новый вид спорта' },
        { id: 'spr_love_3', label: 'Подготовиться к любительским соревнованиям' },
        { id: 'spr_love_4', label: 'Улучшить физическую форму без больших затрат' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'fitness_beginners',
      name: 'Новички в фитнесе и здоровом образе жизни',
      isYouthOnly: true,
      motivations: [
        { id: 'spr_fit_1', label: 'Начать заниматься с нуля под руководством тренера' },
        { id: 'spr_fit_2', label: 'Получить мотивацию и поддержку' },
        { id: 'spr_fit_3', label: 'Научиться правильно питаться' },
        { id: 'spr_fit_4', label: 'Преодолеть стеснение и страх перед залом' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'disabled_youth_sports',
      name: 'Молодые люди с ОВЗ, занимающиеся адаптивным спортом',
      isYouthOnly: true,
      motivations: [
        { id: 'spr_dis_1', label: 'Найти доступные спортивные секции' },
        { id: 'spr_dis_2', label: 'Улучшить здоровье и физическую форму' },
        { id: 'spr_dis_3', label: 'Поучаствовать в соревнованиях для людей с ОВЗ' },
        { id: 'spr_dis_4', label: 'Обрести уверенность в себе' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_sport_trainers',
      name: 'Молодые тренеры и инструкторы по спорту (до 35 лет)',
      isYouthOnly: true,
      motivations: [
        { id: 'spr_trn_1', label: 'Набрать группы и начать тренировать' },
        { id: 'spr_trn_2', label: 'Повысить квалификацию' },
        { id: 'spr_trn_3', label: 'Обменяться опытом с коллегами' },
        { id: 'spr_trn_4', label: 'Получить поддержку для открытия своей секции' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'kids_difficult_families',
      name: 'Дети и подростки из неблагополучных семей',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'spr_kids_1', label: 'Найти безопасное и полезное увлечение' },
        { id: 'spr_kids_2', label: 'Получить поддержку взрослого наставника' },
        { id: 'spr_kids_3', label: 'Укрепить здоровье и дисциплину' },
        { id: 'spr_kids_4', label: 'Изменить своё окружение к лучшему' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'youth_difficult_families_sport',
      name: 'Подростки 14–17 лет из неблагополучных семей',
      isYouthOnly: true,
      motivations: [
        { id: 'spr_yth_1', label: 'Найти безопасное и полезное увлечение' },
        { id: 'spr_yth_2', label: 'Получить поддержку взрослого наставника' },
        { id: 'spr_yth_3', label: 'Укрепить здоровье и дисциплину' },
        { id: 'spr_yth_4', label: 'Изменить своё окружение к лучшему' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'students_sports_clubs',
      name: 'Студенческие спортивные клубы',
      isYouthOnly: true,
      motivations: [
        { id: 'spr_stud_1', label: 'Организовать соревнования или турнир' },
        { id: 'spr_stud_2', label: 'Привлечь больше студентов к занятиям' },
        { id: 'spr_stud_3', label: 'Получить инвентарь и экипировку' },
        { id: 'spr_stud_4', label: 'Пройти обучение у профессиональных тренеров' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'trainers',
      name: 'Инструкторы и спортивные тренеры',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'spr_tr_1', label: 'Передать опыт молодёжи' },
        { id: 'spr_tr_2', label: 'Повысить квалификацию' },
        { id: 'spr_tr_3', label: 'Найти финансирование для развития секции' },
        { id: 'spr_tr_4', label: 'Внедрить современные методики тренировок' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'elderly_active_life',
      name: 'Пожилые любители active-образа жизни',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'spr_eld_1', label: 'Сохранить здоровье и бодрость' },
        { id: 'spr_eld_2', label: 'Найти компанию для прогулок и занятий' },
        { id: 'spr_eld_3', label: 'Освоить безопасные упражнения' },
        { id: 'spr_eld_4', label: 'Поделиться опытом с молодым поколением' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'people_with_disabilities',
      name: 'Люди с ограниченными возможностями здоровья (ОВЗ)',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'spr_pw_1', label: 'Найти доступные спортивные секции' },
        { id: 'spr_pw_2', label: 'Улучшить здоровье и физическую форму' },
        { id: 'spr_pw_3', label: 'Поучаствовать в соревнованиях для людей с ОВЗ' },
        { id: 'spr_pw_4', label: 'Обрести уверенность в себе' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'adults_sedentary',
      name: 'Взрослые, ведущие малоподвижный образ жизни',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'spr_ad_1', label: 'Начать двигаться без риска для здоровья' },
        { id: 'spr_ad_2', label: 'Получить индивидуальные рекомендации' },
        { id: 'spr_ad_3', label: 'Втянуться в регулярные тренировки' },
        { id: 'spr_ad_4', label: 'Улучшить самочувствие и внешний вид' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    { id: 'other', name: 'Другое (свой вариант)', isYouthOnly: true }
  ],
  culture: [
    {
      id: 'creative_youth',
      name: 'Творческая молодежь (музыканты, художники, актеры)',
      isYouthOnly: true,
      motivations: [
        { id: 'cult_crea_1', label: 'Найти площадку для выступлений/выставок' },
        { id: 'cult_crea_2', label: 'Получить профессиональную обратную связь' },
        { id: 'cult_crea_3', label: 'Познакомиться с продюсерами/кураторами' },
        { id: 'cult_crea_4', label: 'Реализовать совместный творческий проект' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'students_humanities',
      name: 'Студенты гуманитарных и творческих вузов / колледжей',
      isYouthOnly: true,
      motivations: [
        { id: 'cult_stud_1', label: 'Применить знания на практике' },
        { id: 'cult_stud_2', label: 'Создать портфолио' },
        { id: 'cult_stud_3', label: 'Найти стажировку в культурных институциях' },
        { id: 'cult_stud_4', label: 'Участвовать в конкурсах и фестивалях' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_designers',
      name: 'Молодые дизайнеры, иллюстраторы, цифровые художники',
      isYouthOnly: true,
      motivations: [
        { id: 'cult_des_1', label: 'Показать свои работы широкой аудитории' },
        { id: 'cult_des_2', label: 'Найти заказчиков или арт-директоров' },
        { id: 'cult_des_3', label: 'Поработать в коллаборации' },
        { id: 'cult_des_4', label: 'Освоить новые техники и инструменты' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_writers',
      name: 'Молодые литераторы, поэты, писатели',
      isYouthOnly: true,
      motivations: [
        { id: 'cult_writ_1', label: 'Опубликовать свои произведения' },
        { id: 'cult_writ_2', label: 'Принять участие в литературных вечерах' },
        { id: 'cult_writ_3', label: 'Получить рецензию от профессионалов' },
        { id: 'cult_writ_4', label: 'Найти читателей и единомышленников' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_craftsmen',
      name: 'Молодые ремесленники, мастера народных промыслов',
      isYouthOnly: true,
      motivations: [
        { id: 'cult_craft_1', label: 'Сохранить и передать традиции' },
        { id: 'cult_craft_2', label: 'Найти рынок сбыта' },
        { id: 'cult_craft_3', label: 'Обучить других своему ремеслу' },
        { id: 'cult_craft_4', label: 'Принять участие в ярмарках и выставках' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'amateur_creatives',
      name: 'Участники любительских творческих коллективов (театральных, музыкальных, танцевальных)',
      isYouthOnly: true,
      motivations: [
        { id: 'cult_amat_1', label: 'Выступить на большой сцене' },
        { id: 'cult_amat_2', label: 'Повысить уровень мастерства' },
        { id: 'cult_amat_3', label: 'Найти новый репертуар/постановки' },
        { id: 'cult_amat_4', label: 'Познакомиться с другими коллективами' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_cultural_managers',
      name: 'Молодые организаторы культурных событий (event-менеджеры, кураторы)',
      isYouthOnly: true,
      motivations: [
        { id: 'cult_man_1', label: 'Провести собственное мероприятие' },
        { id: 'cult_man_2', label: 'Получить опыт у старших коллег' },
        { id: 'cult_man_3', label: 'Найти партнёров и спонсоров' },
        { id: 'cult_man_4', label: 'Создать культурное сообщество' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_cultural_bloggers',
      name: 'Молодые блогеры и создатели контента в сфере культуры',
      isYouthOnly: true,
      motivations: [
        { id: 'cult_blog_1', label: 'Увеличить аудиторию' },
        { id: 'cult_blog_2', label: 'Найти интересных героев и темы' },
        { id: 'cult_blog_3', label: 'Получить доступ к закрытым мероприятиям' },
        { id: 'cult_blog_4', label: 'Монетизировать своё творчество' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'amateur_artists',
      name: 'Начинающие музыканты, актёры, художники (без профильного образования)',
      isYouthOnly: true,
      motivations: [
        { id: 'cult_art_1', label: 'Получить базовые знания' },
        { id: 'cult_art_2', label: 'Найти наставника' },
        { id: 'cult_art_3', label: 'Поверить в себя и начать творить' },
        { id: 'cult_art_4', label: 'Найти первых поклонников' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_art_teachers',
      name: 'Молодые преподаватели творческих дисциплин (до 35 лет)',
      isYouthOnly: true,
      motivations: [
        { id: 'cult_art_teach_1', label: 'Набрать учеников' },
        { id: 'cult_art_teach_2', label: 'Повысить квалификацию' },
        { id: 'cult_art_teach_3', label: 'Обменяться опытом' },
        { id: 'cult_art_teach_4', label: 'Получить поддержку для своих образовательных программ' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'local_history_lovers',
      name: 'Любители локальной истории, краеведы',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'cult_hist_1', label: 'Изучить историю родного края' },
        { id: 'cult_hist_2', label: 'Поделиться знаниями с молодёжью' },
                { id: 'cult_hist_3', label: 'Организовать экскурсии или выставки' },
        { id: 'cult_hist_4', label: 'Сохранить культурное наследие' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    }
  ],
  patriotism: [
    {
      id: 'young_patriots',
      name: 'Участники военно-патриотических игр и сборов',
      isYouthOnly: true,
      motivations: [
        { id: 'pat_yun_1', label: 'Проявить себя в команде' },
        { id: 'pat_yun_2', label: 'Развить лидерские качества' },
        { id: 'pat_yun_3', label: 'Узнать больше о военной истории' },
        { id: 'pat_yun_4', label: 'Принять участие в масштабных мероприятиях' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_search_scouts',
      name: 'Молодые поисковики, участники поисковых отрядов',
      isYouthOnly: true,
      motivations: [
        { id: 'pat_sea_1', label: 'Найти и увековечить память павших' },
        { id: 'pat_sea_2', label: 'Освоить методики поисковой работы' },
        { id: 'pat_sea_3', label: 'Принять участие в Вахтах Памяти' },
        { id: 'pat_sea_4', label: 'Передать опыт новичкам' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'history_reconstructors',
      name: 'Участники военно-исторических реконструкций',
      isYouthOnly: true,
      motivations: [
        { id: 'pat_rec_1', label: 'Погрузиться в изучаемую эпоху' },
        { id: 'pat_rec_2', label: 'Изготовить аутентичное снаряжение' },
        { id: 'pat_rec_3', label: 'Выступить на фестивалях' },
        { id: 'pat_rec_4', label: 'Привлечь внимание к истории' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_museum_specialists',
      name: 'Молодые специалисты музейного дела и archives',
      isYouthOnly: true,
      motivations: [
        { id: 'pat_mus_1', label: 'Получить практический опыт' },
        { id: 'pat_mus_2', label: 'Реализовать выставочный проект' },
        { id: 'pat_mus_3', label: 'Оцифровать фонды' },
        { id: 'pat_mus_4', label: 'Найти наставника' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_genealogists',
      name: 'Молодые люди, изучающие семейную историю и генеалогию',
      isYouthOnly: true,
      motivations: [
        { id: 'pat_gen_1', label: 'Узнать свои корни' },
        { id: 'pat_gen_2', label: 'Составить родословную' },
        { id: 'pat_gen_3', label: 'Поделиться историей семьи' },
        { id: 'pat_gen_4', label: 'Сохранить память для потомков' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'school_seniors',
      name: 'Школьники старших классов',
      isYouthOnly: true,
      motivations: [
        { id: 'pat_sen_1', label: 'Узнать больше об истории страны' },
        { id: 'pat_sen_2', label: 'Подготовиться к экзаменам' },
        { id: 'pat_sen_3', label: 'Принять участие в патриотических акциях' },
        { id: 'pat_sen_4', label: 'Найти интересное внешкольное занятие' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'students_history_pedagogy',
      name: 'Студенты исторических и педагогических направлений',
      isYouthOnly: true,
      motivations: [
        { id: 'pat_ped_1', label: 'Применить знания на практике' },
        { id: 'pat_ped_2', label: 'Разработать методические материалы' },
        { id: 'pat_ped_3', label: 'Провести уроки мужества' },
        { id: 'pat_ped_4', label: 'Получить опыт работы с молодёжью' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'young_researchers',
      name: 'Молодые исследователи и краеведы',
      isYouthOnly: true,
      motivations: [
        { id: 'pat_res_1', label: 'Изучить малоизвестные страницы истории' },
        { id: 'pat_res_2', label: 'Опубликовать исследование' },
        { id: 'pat_res_3', label: 'Принять участие в конференции' },
        { id: 'pat_res_4', label: 'Найти единомышленников' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'underage_kids_6_7',
      name: 'Дети дошкольного возраста (6-7 лет)',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'pat_und_1', label: 'Узнать о Родине в игровой форме' },
        { id: 'pat_und_2', label: 'Научиться любить свой край' },
        { id: 'pat_und_3', label: 'Подготовиться к школе' },
        { id: 'pat_und_4', label: 'Поучаствовать в утренниках и конкурсах' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'veterans_war_children',
      name: 'Ветераны, дети войны',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'pat_vet_1', label: 'Поделиться воспоминаниями' },
        { id: 'pat_vet_2', label: 'Почувствовать заботу и внимание' },
        { id: 'pat_vet_3', label: 'Принять участие в памятных мероприятиях' },
        { id: 'pat_vet_4', label: 'Передать уроки истории молодёжи' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    {
      id: 'svo_families',
      name: 'Семьи участников СВО',
      isYouthOnly: false,
      excludedFunds: ['rosmol'],
      motivations: [
        { id: 'pat_svo_1', label: 'Получить поддержку и помощь' },
        { id: 'pat_svo_2', label: 'Сохранить память о подвиге близких' },
        { id: 'pat_svo_3', label: 'Объединиться с другими семьями' },
        { id: 'pat_svo_4', label: 'Принять участие в патриотических акциях' },
        { id: 'other', label: 'Другое (свой вариант)' }
      ]
    },
    { id: 'other', name: 'Другое (свой вариант)', isYouthOnly: true }
  ],
  universal: [
    { id: 'active_youth', name: 'Активная творческая / social-молодежь', isYouthOnly: true },
    { id: 'local_residents', name: 'Местные жители целевой локации', isYouthOnly: false, excludedFunds: ['rosmol'] },
    { id: 'students_young_specialists', name: 'Студенты и молодые специалисты', isYouthOnly: true },
    { id: 'other', name: 'Другое (свой вариант)', isYouthOnly: true }
  ]
};

const NEEDS_BY_SPHERE: Record<string, MotivationOption[]> = {
  education: [
    { id: 'gain_skills', label: 'Получить практические навыки для будущей профессии' },
    { id: 'profile_job', label: 'Определиться с будущей профессией' },
    { id: 'prep_exams', label: 'Подготовиться к экзаменам' },
    { id: 'find_peers', label: 'Найти единомышленников' },
    { id: 'mentor_support', label: 'Получить поддержку наставника' },
    { id: 'other', label: 'Другое (свой вариант)' }
  ],
  eco: [
    { id: 'personal_impact', label: 'Внести личный вклад в улучшение экологии своего района' },
    { id: 'nature_time', label: 'Интересно и с пользой провести время на природе' },
    { id: 'responsible_attitude', label: 'Научиться ответственному отношению к животным' },
    { id: 'eco_help', label: 'Узнать, как помогать природе' },
    { id: 'waste_sorting', label: 'Научиться раздельному сбору отходов' },
    { id: 'volunteer_hours', label: 'Получить волонтёрские часы / запись в книжку' },
    { id: 'other', label: 'Другое (свой вариант)' }
  ],
  it: [
    { id: 'osvoit_cs', label: 'Освоить востребованную IT-специальность' },
    { id: 'create_startup', label: 'Создать собственный технологический проект/стартап' },
    { id: 'dev_community', label: 'Попасть в сообщество разработчиков и инноваторов' },
    { id: 'practical_experience', label: 'Получить практический опыт в реальных IT-проектах' },
    { id: 'create_portfolio', label: 'Создать работающий прототип/портфолио' },
    { id: 'find_mentor', label: 'Найти ментора или потенциального работодателя' },
    { id: 'other', label: 'Другое (свой вариант)' }
  ],
  social: [
    { id: 'get_support', label: 'Найти поддержку и наставника для реализации своей идеи' },
    { id: 'integrate_social', label: 'Интегрироваться в социальную среду, почувствовать себя нужным' },
    { id: 'develop_leadership', label: 'Развить лидерские качества и soft skills' },
    { id: 'find_peers_safe', label: 'Найти единомышленников и безопасное пространство для общения' },
    { id: 'get_psy_support', label: 'Получить психологическую поддержку и ориентиры' },
    { id: 'other', label: 'Другое (свой вариант)' }
  ],
  urban: [
    { id: 'improve_yard', label: 'Повлиять на благоустройство своего двора/района' },
    { id: 'apply_professional', label: 'Применить профессиональные навыки для улучшения городской среды' },
    { id: 'unite_neighbors', label: 'Объединиться с соседями для решения общей проблемы' },
    { id: 'participate_co_design', label: 'Получить практические навыки соучаствующего проектирования' },
    { id: 'safe_space', label: 'Создать комфортное и безопасное общественное пространство' },
    { id: 'other', label: 'Другое (свой вариант)' }
  ],
  sport: [
    { id: 'improve_health', label: 'Укрепить здоровье, улучшить физическую форму' },
    { id: 'get_rehabilitation_support', label: 'Получить поддержку в реабилитации и социализации через спорт' },
    { id: 'peers_regular', label: 'Найти единомышленников для регулярных занятий' },
    { id: 'free_training', label: 'Получить доступ к бесплатным тренировкам и инвентарю' },
    { id: 'competitions', label: 'Принять участие в ярких спортивных соревнованиях' },
    { id: 'other', label: 'Другое (свой вариант)' }
  ],
  culture: [
    { id: 'creative_selfrealization', label: 'Творчески самореализоваться, раскрыть таланты' },
    { id: 'learn_heritage', label: 'Познакомиться с культурным наследием региона' },
    { id: 'participate_social_cultural', label: 'Принять участие в создании общественно значимого культурного продукта' },
    { id: 'artists_support', label: 'Найти продюсеров, кураторов или экспертную обратную связь' },
    { id: 'pro_equipment', label: 'Получить доступ к профессиональному оборудованию / залам' },
    { id: 'other', label: 'Другое (свой вариант)' }
  ],
  patriotism: [
    { id: 'history_country_family', label: 'Узнать больше об истории своей страны и семьи' },
    { id: 'honor_memory', label: 'Почтить память героев и передать знания младшему поколению' },
    { id: 'event_organization_experience', label: 'Получить опыт организации патриотических мероприятий' },
    { id: 'reconstructions', label: 'Участвовать в живых исторических реконструкциях и квестах' },
    { id: 'historical_memory', label: 'Сохранить историческую память для будущих поколений' },
    { id: 'other', label: 'Другое (свой вариант)' }
  ],
  universal: [
    { id: 'solve_local', label: 'Решить значимую локальную или социальную проблему' },
    { id: 'support_idea', label: 'Найти поддержку для реализации своей неформальной идеи' },
    { id: 'new_skills', label: 'Обрести новые прикладные навыки и контакты' },
    { id: 'useful_time', label: 'Полезно и содержательно провести свободное время' },
    { id: 'other', label: 'Другое (свой вариант)' }
  ]
};

const CHECKLIST_ITEMS = [
  'Моя целевая аудитория конкретна, измерима и соответствует требованиям фонда.',
  'Указанное количество участников реалистично и подтверждено расчётами или опросами. (Проверьте: косвенный охват должен быть обоснован так же строго, как и прямой.)',
  'Я чётко понимаю, что именно мотивирует этих людей участвовать в проекте.'
];

export const Step3: React.FC = () => {
  const { data, setData } = useAppContext();
  
  const fundConfig = FUND_AUDIENCE_REQUIREMENTS[data.selectedFund] || FUND_AUDIENCE_REQUIREMENTS.other;
  const maxGroups = fundConfig.max_groups;
  const isMultiGroup = fundConfig.allow_multiple_groups;
  
  const [checklist, setChecklist] = useState([false, false, false]);
  const [showNeedsWarning, setShowNeedsWarning] = useState(false);
  const [motivationWarning, setMotivationWarning] = useState('');

  const sphereId = data.projectSphereId || 'universal';
  const isRosmol = data.selectedFund === 'rosmol';

  // Fallback to safe options if sphere not found
  const rawGroupOptions = AUDIENCE_GROUPS_BY_SPHERE[sphereId] || AUDIENCE_GROUPS_BY_SPHERE.universal;
  
  const primaryGroupOption = rawGroupOptions.find(g => 
    g.name === (data.primaryTargetGroup || data.targetGroups?.[0]) || (g.id === 'other' && (data.primaryTargetGroup === 'other' || data.targetGroups?.[0] === 'other'))
  );

  const activeNeedsOptions = primaryGroupOption?.motivations 
    ? primaryGroupOption.motivations
    : (NEEDS_BY_SPHERE[sphereId] || NEEDS_BY_SPHERE.universal);

  // Filter groups depending on fund and youth flags
  const filteredGroups = rawGroupOptions.filter(group => {
    if (group.id === 'other') {
      return false;
    }
    const lowerName = group.name.toLowerCase();
    const isExplicitlyYouth = lowerName.includes('молод') || lowerName.includes('до 35');

    if (group.excludedFunds && data.selectedFund && group.excludedFunds.includes(data.selectedFund)) {
      if (data.selectedFund === 'rosmol' && isExplicitlyYouth) {
        // Keep youth-focused educators/etc if marked as rosmol-excluded in the raw config
      } else {
        return false;
      }
    }
    if (isRosmol) {
      if (!group.isYouthOnly && !isExplicitlyYouth) {
        return false;
      }
    }
    return true;
  });

  const ageFromNum = data.ageFrom ? parseInt(data.ageFrom, 10) : NaN;
  const ageToNum = data.ageTo ? parseInt(data.ageTo, 10) : NaN;

  // Logic values for Rosmol age limits
  const isAgeValidForRosmol = fundConfig.age_min === null || (
    (!isNaN(ageFromNum) && ageFromNum >= fundConfig.age_min && (!fundConfig.age_max || ageFromNum <= fundConfig.age_max)) &&
    (!isNaN(ageToNum) && ageToNum >= fundConfig.age_min && (!fundConfig.age_max || ageToNum <= fundConfig.age_max)) &&
    (isNaN(ageFromNum) || isNaN(ageToNum) || ageFromNum <= ageToNum)
  );

  const isAgeSoftWarning = !isRosmol && (
    (!isNaN(ageFromNum) && (ageFromNum < 1 || ageFromNum > 80)) ||
    (!isNaN(ageToNum) && (ageToNum < 1 || ageToNum > 80))
  );

  const isAgeEmpty = !data.ageFrom || !data.ageTo;
  const isAgeInputsValid = !isAgeEmpty && !isNaN(ageFromNum) && !isNaN(ageToNum) && ageFromNum <= ageToNum;

  // Validation
  const isGroupValid = Array.isArray(data.targetGroups) && data.targetGroups.length > 0 && 
    Boolean(data.targetGroups[0]?.trim());

  
  const hasOther = Array.isArray(data.targetNeeds) && data.targetNeeds.includes('other');
  const isOtherFilled = !hasOther || Boolean(data.customMotivation?.trim());
  const readyCount = Array.isArray(data.targetNeeds) ? data.targetNeeds.filter(n => n !== 'other').length : 0;
  
  const isNeedsValid = Array.isArray(data.targetNeeds) && 
                       data.targetNeeds.length > 0 && 
                       isOtherFilled && 
                       (readyCount >= 2 || hasOther);
  
  const isDirectReachValid = Boolean(data.directReach) && parseInt(data.directReach, 10) > 0;
  const isIndirectReachValid = Boolean(data.indirectReach) && parseInt(data.indirectReach, 10) >= 0;
  const allChecked = checklist.every(Boolean);

  const canProceed = isGroupValid && 
                     isAgeInputsValid && 
                     true &&
                     isNeedsValid && 
                     isDirectReachValid && 
                     isIndirectReachValid &&
                     allChecked;

  // Resolve motivation labels easily
  const getMotivationLabel = (idOrLabel: string) => {
    if (idOrLabel === 'other') return 'Другое (свой вариант)';
    const match = activeNeedsOptions.find((n: any) => n.id === idOrLabel || n.label === idOrLabel);
    return match ? match.label : idOrLabel;
  };

  // Dynamic automatic summary aggregation
  const textSummary = (() => {
    const groupList = (data.targetGroups || []).filter((g: string) => g?.trim());
    const groupName = groupList.length > 0 ? groupList.join(', ') : '___';
    const ageString = data.ageFrom && data.ageTo ? `${data.ageFrom}–${data.ageTo}` : '___';
    const chosenNeedsStr = Array.isArray(data.targetNeeds) && data.targetNeeds.length > 0 
      ? data.targetNeeds.map(n => n === 'other' ? (data.customMotivation || 'свой вариант') : getMotivationLabel(n)).join(', ').toLowerCase()
      : '___';
    const utpText = data.targetUtp ? data.targetUtp : '___';
    const directVal = data.directReach ? data.directReach : '0';
    const indirectVal = data.indirectReach ? data.indirectReach : '0';
    const debugJustify = data.reachJustification ? data.reachJustification : '___';
    const recruitStr = data.recruitmentChannels ? data.recruitmentChannels : '___';
    
    return `Целевая аудитория проекта: ${groupName} в возрасте ${ageString} лет.

Основная потребность целевой группы: ${chosenNeedsStr}. Это подтверждается ${data.needEvidence ? data.needEvidence : '___'}.

Почему придут именно к нам: ${utpText}.

Планируемый охват: прямой — ${directVal} человек, косвенный — ${indirectVal} человек. Расчёт основан на данных : ${debugJustify}.

Каналы привлечения участников: ${recruitStr}.`;
  })();

  // Synchronize generated draft text and participant statistics
  useEffect(() => {
    const resolvedMotivations = (data.targetNeeds || []).map(n => {
      if (n === 'other') return data.customMotivation || 'Свой вариант';
      const match = activeNeedsOptions.find((o: any) => o.id === n || o.label === n);
      return match ? match.label : n;
    });
    const motivationsStr = resolvedMotivations.join('\n');

    setData(prev => {
      const newTargetAudience = textSummary;
      const newTargetMotivation = motivationsStr;
      const newParticipantsCount = prev.directReach ? `${prev.directReach} чел. напрямую, ${prev.indirectReach || 0} онлайн` : '';

      if (
        prev.targetAudience === newTargetAudience &&
        prev.targetMotivation === newTargetMotivation &&
        prev.participantsCount === newParticipantsCount
      ) {
        return prev;
      }

      return {
        ...prev,
        targetAudience: newTargetAudience,
        targetMotivation: newTargetMotivation,
        participantsCount: newParticipantsCount
      };
    });
  }, [textSummary, data.targetNeeds, data.customMotivation, data.directReach, data.indirectReach, activeNeedsOptions]);

  const lastGroupIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const currentGroupId = primaryGroupOption?.id;
    if (lastGroupIdRef.current !== undefined && lastGroupIdRef.current !== currentGroupId) {
      setData(prev => {
        if (prev.targetNeeds && prev.targetNeeds.length > 0) {
          setMotivationWarning('Список доступных мотиваций обновился из-за смены целевой группы.');
          setTimeout(() => setMotivationWarning(''), 5000);
          return {
            ...prev,
            targetNeeds: [],
            customMotivation: ''
          };
        }
        return prev;
      });
    }
    lastGroupIdRef.current = currentGroupId;
  }, [primaryGroupOption?.id, setData]);

  // Handle checked confirmation
  const handleCheck = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index] = !newChecklist[index];
    setChecklist(newChecklist);
  };

  // Group selection dispatcher
  const handleGroupSelect = (group: GroupOption) => {
    const groupValue = group.name;
    const currentGroups = Array.isArray(data.targetGroups) ? [...data.targetGroups] : [];
    const isAlreadySelected = currentGroups.includes(groupValue);

    let newGroups = [...currentGroups];
    if (isMultiGroup) {
      if (isAlreadySelected) {
        newGroups = currentGroups.filter(g => g !== groupValue);
      } else {
        const filledGroups = newGroups.filter(g => g?.trim());
        if (filledGroups.length >= maxGroups) {
          return;
        }
        const emptyIndex = newGroups.findIndex(g => !g || g.trim() === '');
        if (emptyIndex !== -1 && emptyIndex < maxGroups) {
           newGroups[emptyIndex] = groupValue;
        } else if (newGroups.length < maxGroups) {
           newGroups.push(groupValue);
        }
      }
    } else {
      if (!isAlreadySelected) {
        newGroups = [groupValue];
      } else {
        newGroups = [];
      }
    }

    setData(prev => ({
      ...prev,
      targetGroups: newGroups,
      primaryTargetGroup: newGroups[0] || '',
      customTargetGroup: ''
    }));
  };
  
  const setPrimaryGroup = (val: string) => {
    setData(prev => ({ ...prev, primaryTargetGroup: val }));
  };

  // Checkbox motivation dispatcher (Max 3 chosen)
  const handleNeedToggle = (needId: string) => {
    const currentNeeds = Array.isArray(data.targetNeeds) ? [...data.targetNeeds] : [];
    const isAlreadyChecked = currentNeeds.includes(needId);

    if (isAlreadyChecked) {
      setData(prev => ({
        ...prev,
        targetNeeds: currentNeeds.filter(n => n !== needId),
        customMotivation: needId === 'other' ? '' : prev.customMotivation
      }));
      setShowNeedsWarning(false);
      setMotivationWarning('');
    } else {
      if (needId === 'other' && currentNeeds.includes('other')) {
        setMotivationWarning('Можно указать только один свой вариант');
        setTimeout(() => setMotivationWarning(''), 3000);
        return;
      }
      if (currentNeeds.length >= 3) {
        setShowNeedsWarning(true);
        setTimeout(() => setShowNeedsWarning(false), 2500);
      } else {
        setData(prev => ({
          ...prev,
          targetNeeds: [...currentNeeds, needId]
        }));
        setShowNeedsWarning(false);
        setMotivationWarning('');
      }
    }
  };

  // Score System Calculation
  const { step3: localScore } = calculateProjectScores(data, { step2: [], step3: checklist });

  const mentorAdvice = `Эксперт оценивает, насколько глубоко вы понимаете проблему. «Проект для молодёжи» — это абстракция. «Проект для 50 подростков 14–16 лет из малообеспеченных семей г. Сызрань, которые не имеют доступа к платным IT-курсам» — конкретная группа с измеримой потребностью. Основная группа — это те, кто получает прямой результат проекта (обучение, помощь, навыки). Именно их проблема — обоснование всего проекта.`;

  // Dynamic hints for checklist based on fund and sphere
  const getChecklistHints = () => {
    let hint1 = 'Убедитесь, что аудитория описана не слишком широко.';
    if (data.selectedFund === 'rosmol') hint1 += ' Особое внимание на возраст: строго от 14 до 35 лет.';
    else if (data.selectedFund === 'fsi') hint1 += ' Аудитория должна включать стейкхолдеров инновационного продукта.';
    
    let hint2 = 'Эксперты проверяют адекватность охвата масштабу проекта.';
    if (sphereId === 'it') hint2 += ' Для IT-проектов онлайн-охват может быть значительно больше прямого.';
    
    let hint3 = 'Мотивация должна быть искренней, а не "заставили в школе".';
    if (data.selectedFund === 'pfci') hint3 += ' Для культурных проектов важна эстетическая или образовательная ценность.';
    
    return [hint1, hint2, hint3];
  };
  const checklistHints = getChecklistHints();

  return (
    <StepLayout
      title="Кто станет участником вашего проекта?"
      subtitle="Опишите конкретную группу людей и объясните, почему они придут именно к вам."
      mentorTitle="Совет грантрайтера: зачем нужна одна основная целевая группа?"
      mentorContent={mentorAdvice}
      canProceed={canProceed}
      progressScore={localScore}
      progressMax={11}
    >
      <div className="space-y-10">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 text-sm text-slate-700 leading-relaxed relative">
          <div className="absolute top-0 right-0 px-3 py-1 bg-slate-200 text-slate-800 font-bold text-[10px] uppercase tracking-widest rounded-bl-xl rounded-tr-2xl">
            Правила фонда
          </div>
          <p>{fundConfig.text}</p>
        </div>

        {/* Block 1: Target Group Select list */}
        <div>
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5 mb-6 text-sm text-indigo-950 leading-relaxed shadow-sm relative flex flex-col sm:flex-row gap-4 items-start overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-100/80 text-indigo-800 font-bold text-[10px] uppercase tracking-widest rounded-bl-xl rounded-tr-2xl">
              Памятка
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-150 bg-indigo-100/70 flex items-center justify-center shrink-0 text-indigo-600">
              <Info size={20} />
            </div>
            <div className="flex-1 mt-1 sm:mt-0">
              <strong className="block mb-1.5 font-bold text-base text-indigo-900 tracking-tight">Как заполнить этот раздел:</strong>
              <p className="text-indigo-900/90 text-[13px] md:text-sm leading-relaxed font-normal">
                Выберите одну основную целевую группу — тех, чью проблему решает проект. Если ваш проект также вовлекает зрителей, волонтёров или родителей, вы можете добавить их как дополнительные группы (не более трёх всего). Они не должны размывать фокус основной группы.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {/* Block A */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Блок А. Основная целевая группа <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">Выберите основную целевую группу — тех, чью проблему решает проект</p>
              <input 
                type="text" 
                placeholder="Например: Подростки 14-16 лет..." 
                className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 border-gray-300"
                value={data.targetGroups?.[0] || ''}
                onChange={(e) => {
                  const newGroups = [...(data.targetGroups || [])];
                  newGroups[0] = e.target.value;
                  setData(prev => ({ ...prev, targetGroups: newGroups }));
                }}
              />
            </div>

            {/* Block B */}
            {isMultiGroup && (
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Блок Б. Дополнительные группы (необязательно)
              </label>
              <p className="text-xs text-gray-500 mb-3">Кто ещё будет вовлечён в проект? (зрители, волонтёры, родители и др.)</p>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Дополнительная группа 1 (до 2 дополнительных групп)" 
                  className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 border-gray-300"
                  value={data.targetGroups?.[1] || ''}
                  onChange={(e) => {
                    const newGroups = [...(data.targetGroups || [])];
                    newGroups[1] = e.target.value;
                    setData(prev => ({ ...prev, targetGroups: newGroups }));
                  }}
                />
                <input 
                  type="text" 
                  placeholder="Дополнительная группа 2" 
                  className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 border-gray-300"
                  value={data.targetGroups?.[2] || ''}
                  onChange={(e) => {
                    const newGroups = [...(data.targetGroups || [])];
                    newGroups[2] = e.target.value;
                    setData(prev => ({ ...prev, targetGroups: newGroups }));
                  }}
                />
              </div>
            </div>
            )}
          </div>

          <label className="label-sleek mb-4 block text-lg font-medium">Быстрый выбор типичных групп</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGroups.map((group) => {
              const icon = GROUP_ICONS[group.name] || '🧑';
              const groupValue = group.name;
              const isSelected = Array.isArray(data.targetGroups) && data.targetGroups.includes(groupValue);

              return (
                <div
                  key={group.id}
                  onClick={() => handleGroupSelect(group)}
                  className={`relative p-5 border rounded-2xl cursor-pointer transition-all flex flex-col justify-start min-h-[120px] break-words ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-cyan-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-gray-100 mb-2 shrink-0">
                    {icon}
                  </div>
                  <h3 className={`font-semibold leading-snug text-sm ${isSelected ? 'text-cyan-900' : 'text-gray-900'}`}>
                    {group.name}
                  </h3>

                  {isSelected && (
                    <div className="absolute top-5 right-4 text-cyan-500 flex flex-col items-center">
                      <Check className="w-5 h-5 mb-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Block 2: Age Limits */}
        <div className="pt-8 border-t border-gray-100">
          <label className="label-sleek mb-2 block text-lg font-medium">Возрастной диапазон участников <span className="text-red-500">*</span></label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 max-w-md">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-500 w-6">От</span>
              <input
                type="number"
                min={1}
                max={120}
                value={data.ageFrom || ''}
                onChange={(e) => setData(prev => ({ ...prev, ageFrom: e.target.value }))}
                placeholder={data.selectedFund === 'rosmol' ? '14' : ''}
                className={`w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border shadow-sm ${
                  (isRosmol && !isAgeValidForRosmol && data.ageFrom) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              <span className="text-sm text-gray-400">лет</span>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-500 w-6 font-normal">до</span>
              <input
                type="number"
                min={1}
                max={120}
                value={data.ageTo || ''}
                onChange={(e) => setData(prev => ({ ...prev, ageTo: e.target.value }))}
                placeholder={data.selectedFund === 'rosmol' ? '35' : ''}
                className={`w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border shadow-sm ${
                  (isRosmol && !isAgeValidForRosmol && data.ageTo) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              <span className="text-sm text-gray-400">лет</span>
            </div>
          </div>

          {/* Age Warnings */}
          {data.selectedFund === 'rosmol' && (
            <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Участники проектов Росмолодёжи должны быть в возрасте 14–35 лет включительно.</span>
            </div>
          )}

          {data.selectedFund === 'fpg' && (
            <p className="mt-3 text-xs text-gray-500 ml-1">Укажите возрастной диапазон вашей целевой группы. ФПГ не устанавливает ограничений.</p>
          )}

          {data.selectedFund === 'pfki' && (
            <p className="mt-3 text-xs text-gray-500 ml-1">Укажите возраст участников. ПФКИ не ограничивает возраст целевой аудитории.</p>
          )}

          {isAgeSoftWarning && !isRosmol && (
            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Проверьте корректность возраста (обычно целевые группы укладываются в диапазон 1–80 лет).</span>
            </div>
          )}
        </div>

        {/* Block 3: Participant Motivation */}
        <div className="pt-8 border-t border-gray-100">
          <label className="label-sleek mb-2 block text-lg font-medium">Мотивация участников <span className="text-red-500">*</span></label>
          
          {/* Sub-block 3a: Internal Needs (Checkbox Select, Max 3 chosen) */}
          <div className="mb-6">
            <h4 className="block text-sm font-semibold text-gray-700 mb-1">3а. Внутренняя потребность (почему им это нужно?)</h4>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Выберите <strong>не менее 2 готовых вариантов</strong>, либо <strong>укажите свой вариант</strong> в поле ниже (можно совместить готовый и свой варианты; всего можно выбрать до 3-х пунктов).
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeNeedsOptions.map((needOption) => {
                const isChecked = Array.isArray(data.targetNeeds) && data.targetNeeds.includes(needOption.id);
                
                return (
                  <div 
                    key={needOption.id}
                    onClick={() => handleNeedToggle(needOption.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked 
                        ? 'border-cyan-500 bg-cyan-50/50 text-cyan-900 font-medium' 
                        : 'border-gray-100 bg-white hover:border-cyan-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className={`mt-0.5 min-w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                      isChecked ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-300'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm leading-snug">{needOption.label}</span>
                  </div>
                );
              })}
            </div>

            {showNeedsWarning && (
              <div className="mt-3 text-xs text-rose-600 font-semibold flex items-center gap-1.5 animate-bounce">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Можно выбрать не более трех пунктов</span>
              </div>
            )}

            {motivationWarning && (
              <div className={`mt-3 p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
                motivationWarning.includes('обновился') || motivationWarning.includes('изменен')
                  ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                  : 'bg-red-50 border-red-200 text-red-700 font-semibold'
              }`}>
                <AlertCircle className={`w-4 h-4 shrink-0 ${motivationWarning.includes('обновился') || motivationWarning.includes('изменен') ? 'text-cyan-600' : 'text-red-500'}`} />
                <span>{motivationWarning}</span>
              </div>
            )}

            {Array.isArray(data.targetNeeds) && data.targetNeeds.length > 0 && !isNeedsValid && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Пожалуйста, выберите еще минимум один готовый вариант (всего не менее двух) либо опишите свой вариант в поле ниже.</span>
              </div>
            )}

            {Array.isArray(data.targetNeeds) && data.targetNeeds.includes('other') && (
              <div className="mt-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Опишите вашу мотивацию (потребность) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={data.customMotivation || ''}
                  onChange={(e) => setData(prev => ({ ...prev, customMotivation: e.target.value }))}
                  placeholder="Опишите мотивацию ваших участников"
                  className={`w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border bg-white ${
                    !data.customMotivation?.trim() ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
                {!data.customMotivation?.trim() && (
                  <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1">
                    Укажите свой вариант
                  </p>
                )}
              </div>
            )}
          </div>
            
            <div className="mt-6 animate-in fade-in slide-in-from-top-2 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">На основании чего вы определили эту потребность? (рекомендуется)</label>
              <textarea
                rows={3}
                value={data.needEvidence || ''}
                onChange={(e) => setData(prev => ({ ...prev, needEvidence: e.target.value }))}
                placeholder="Например: опрос в сообществе ВК (25 ответов), интервью с 5 педагогами..."
                className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 bg-white resize-y min-h-[80px]"
              />
              <p className="mt-2 text-xs text-gray-500">Рекомендуем заполнить — это повышает доверие эксперта.</p>
            </div>
          {/* Sub-block 3b: Unique Offering USP */}
          <div className="bg-cyan-50/30 border border-cyan-100/60 p-6 rounded-2xl mt-4">
            <h4 className="text-base font-semibold text-cyan-950 mb-2 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-cyan-600 fill-cyan-100" />
              <span>3б. Уникальное предложение (почему придут именно к вам?)</span>
            </h4>
            <p className="text-xs text-cyan-800/80 mb-3 leading-relaxed">
              Чем ваш проект отличается от аналогичных? Например: "У нас бесплатно и в шаговой доступности от школы", "Выдают сертификат для портфолио", "Занятия ведут практики из IT-компаний".
            </p>
            <textarea
              rows={3}
              value={data.targetUtp || ''}
              onChange={(e) => setData(prev => ({ ...prev, targetUtp: e.target.value }))}
              placeholder="Укажите 1–2 ключевых отличия (цена, преподаватели, формат, результат)"
              className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm bg-white resize-y min-h-[80px]"
            />
          </div>
        </div>

        {/* Block 4: Reach and justification */}
        <div className="pt-8 border-t border-gray-100 space-y-6">
          <label className="label-sleek mb-2 block text-lg font-medium">Планируемый охват и обоснование <span className="text-red-500">*</span></label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Прямой охват (непосредственные участники мероприятий) <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={1}
                value={data.directReach || ''}
                onChange={(e) => setData(prev => ({ ...prev, directReach: e.target.value }))}
                placeholder="50"
                className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Только те, кто участвует очно или напрямую в программах.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Косвенный охват (зрители, подписчики, аудитория СМИ) <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={0}
                value={data.indirectReach || ''}
                onChange={(e) => setData(prev => ({ ...prev, indirectReach: e.target.value }))}
                placeholder="1000"
                className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Охват информационной кампании, публикации, зрители.</p>
              {(parseInt(data.indirectReach as string, 10) > 500) && (
                <p className="text-xs text-amber-600 mt-1.5 font-medium">Указано большое число. Убедитесь, что оно подтверждено: данными о среднем охвате публикаций, вместимостью площадки, аналитикой прошлых мероприятий.</p>
              )}
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Обоснование числа участников <span className="text-red-500">*</span></label>
             <p className="text-xs text-gray-500 mb-3 leading-snug">
               Откуда вы взяли эти цифры? Опираетесь ли вы на результаты опроса, вместимость площадки, количество подписчиков, статистику похожих проектов? Эксперт хочет видеть, что цифры не с потолка.
             </p>
             <textarea
              rows={4}
              value={data.reachJustification || ''}
              onChange={(e) => setData(prev => ({ ...prev, reachJustification: e.target.value }))}
              placeholder="Расчет опирается на вместимость 2-х аудиторий школы..."
              className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm resize-y"
            />
            <p className="text-xs text-slate-400 mt-2 font-mono">Пример: Прямой охват = 2 аудитории × 25 мест × 2 смены = 50 чел. (подтверждено вместимостью по паспорту помещения). Косвенный охват = средний охват поста ВК (1000 чел., данные за 3 мес.) × 5 постов + зрители выставки (500 чел., вместимость зала) = 5500.</p>
          </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Как участники узнают о проекте?</label>
              <input
                type="text"
                maxLength={150}
                value={data.recruitmentChannels || ''}
                onChange={(e) => setData(prev => ({ ...prev, recruitmentChannels: e.target.value }))}
                placeholder="Таргет ВК на Сызрань, объявления в школах, рассылка в творческих кружках"
                className="w-full sleek-input rounded-xl p-4 text-sm focus:ring-cyan-500 focus:border-cyan-500 block border-gray-300 shadow-sm"
              />
            </div>
          </div>

        {/* Block 5: AI-assisted Draft Compilation Preview */}
        <div className="pt-8 border-t border-gray-100">
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse" />
              <span>Пример текста для заявки</span>
            </h4>
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600 leading-relaxed italic">{textSummary}</p>
            </div>
          </div>
        </div>

        {/* Block 6: Confirmation Checklist */}
        <div className="pt-8 border-t border-gray-100">
          <label className="label-sleek mb-4 block text-lg font-medium">Чек-лист подтверждения</label>
          <div className="space-y-4">
            {CHECKLIST_ITEMS.map((text, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors group">
                <div 
                  onClick={() => handleCheck(idx)}
                  className={`mt-0.5 min-w-6 h-6 rounded cursor-pointer border flex items-center justify-center transition-all flex-shrink-0 ${
                    checklist[idx] ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-300 hover:border-cyan-400 bg-white'
                  }`}
                >
                  {checklist[idx] && <Check className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-start gap-2">
                    <span 
                      onClick={() => handleCheck(idx)}
                      className={`text-sm md:text-base leading-snug cursor-pointer select-none ${checklist[idx] ? 'text-gray-900 font-medium' : 'text-gray-600'}`}
                    >
                      {text}
                    </span>
                    <div className="group/hint relative shrink-0 mt-0.5 hidden sm:block">
                      <HelpCircle className="w-4 h-4 text-cyan-400 hover:text-cyan-600 cursor-help transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/hint:opacity-100 transition-opacity pointer-events-none z-10">
                        {checklistHints[idx]}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 sm:hidden">
                    {checklistHints[idx]}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {!allChecked && (
             <p className="text-sm text-red-500 mt-4 text-center font-medium animate-pulse">
               Пожалуйста, подтвердите все пункты чек-листа, чтобы продолжить.
             </p>
          )}
        </div>
      </div>
    </StepLayout>
  );
};
