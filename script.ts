import fs from 'fs';

let content = fs.readFileSync('src/views/Step3.tsx', 'utf-8');

// Fix first corruption
const regex1 = /\{ id: 'urb_ent_local_3'[\s\S]+?sport_lovers'/;
// Wait, sport_lovers is not there, it says `  patriotism: [\n    {\n      id: 'young_patriots',\n      name: 'Участники военно-патриотических игр и сборов',\n      isYouthOnly: true, спорта',\n      isYouthOnly: true,\n      motivations:`

const fix1 = `        { id: 'urb_ent_local_3', label: 'Найти партнёров среди жителей и администрации' },
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
      motivations: [`;

let idx1 = content.indexOf(`{ id: 'urb_ent_local_3'`);
let idx2 = content.indexOf(`{ id: 'spr_love_1'`);
if(idx1 !== -1 && idx2 !== -1) {
  content = content.substring(0, idx1) + fix1 + '\n        ' + content.substring(idx2);
}

// Fix second corruption
const fix2 = `        { id: 'cult_hist_3', label: 'Организовать экскурсии или выставки' },
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
      motivations: [`;

let idx3 = content.indexOf(`{ id: 'cult_hist_3'`);
let idx4 = content.indexOf(`{ id: 'pat_yun_1'`);

if (idx3 !== -1 && idx4 !== -1) {
  content = content.substring(0, idx3) + fix2 + '\n        ' + content.substring(idx4);
}

fs.writeFileSync('src/views/Step3.tsx', content, 'utf-8');
console.log('Fixed Step3.tsx');
