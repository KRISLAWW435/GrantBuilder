const fs = require('fs');
const text = fs.readFileSync('src/views/Step3.tsx', 'utf-8');
const opens = (text.match(/<div/g) || []).length;
const closes = (text.match(/<\/div>/g) || []).length;
console.log('Divs open:', opens, 'closed:', closes);
