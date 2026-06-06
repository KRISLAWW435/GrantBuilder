import fs from 'fs';

let content = fs.readFileSync('src/utils/indexedDb.ts', 'utf-8');
content = content.replace(/static migrateDraft.*?return draft;\n  }\n\n/s, '');
content = content.replace(/this\.migrateDraft\(draft\)/g, 'draft');
content = content.replace(/this\.migrateDraft\(request\.result\)/g, 'request.result');
content = content.replace(/results\.map\(this\.migrateDraft\)/g, 'results');
content = content.replace(/list\.map\(this\.migrateDraft\)/g, 'list');
fs.writeFileSync('src/utils/indexedDb.ts', content);
console.log('Restored DB');
