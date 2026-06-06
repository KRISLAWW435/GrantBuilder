import fs from 'fs';

for (let i = 2; i <= 8; i++) {
  const filePath = `./src/views/Step${i}.tsx`;
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  const prevStep = i - 1;
  fileContent = fileContent.replace(new RegExp(`export const Step${prevStep}`, 'g'), `export const Step${i}`);
  fs.writeFileSync(filePath, fileContent);
}
console.log('Done replacing exports');
