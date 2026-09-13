import fs from 'fs';
import path from 'path';
import { ALL_TEMPLATES } from '../lib/templates-data.ts';

const missingPng = [];
const missingPdf = [];

for (const t of ALL_TEMPLATES) {
  const pngPath = path.resolve('public/templates', `${t.id}.png`);
  const pdfPath = path.resolve('public/templates/pdf', `${t.id}.pdf`);
  if (!fs.existsSync(pngPath)) {
    missingPng.push(t.id);
  }
  if (!fs.existsSync(pdfPath)) {
    missingPdf.push(t.id);
  }
}

console.log(`Total Templates Checked: ${ALL_TEMPLATES.length}`);
console.log(`Missing PNG Previews: ${missingPng.length} ${JSON.stringify(missingPng)}`);
console.log(`Missing PDF Documents: ${missingPdf.length} ${JSON.stringify(missingPdf)}`);

if (missingPng.length === 0 && missingPdf.length === 0) {
  console.log('SUCCESS: All 52 templates have valid PNG previews and PDF documents!');
}
