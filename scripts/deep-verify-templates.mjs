import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { ALL_TEMPLATES } from '../lib/templates-data.ts';

const require = createRequire(import.meta.url);
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

function parsePngHeader(buf) {
  if (buf.length < 24) return null;
  // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
                buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a;
  if (!isPng) return null;
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height, aspectRatio: (height / width).toFixed(3) };
}

async function verifyAll() {
  console.log('='.repeat(80));
  console.log(`LumaCV Deep Verification: Auditing All ${ALL_TEMPLATES.length} Generated Images & PDFs`);
  console.log('='.repeat(80));

  const results = [];
  let allPerfect = true;

  for (let i = 0; i < ALL_TEMPLATES.length; i++) {
    const t = ALL_TEMPLATES[i];
    const prefix = `[${String(i + 1).padStart(2)}/${ALL_TEMPLATES.length}] ${t.id.padEnd(20)} (${t.name.padEnd(12)})`;
    
    const pngPath = path.resolve('public/templates', `${t.id}.png`);
    const pdfPath = path.resolve('public/templates/pdf', `${t.id}.pdf`);

    const itemResult = {
      id: t.id,
      name: t.name,
      pngValid: false,
      pdfValid: false,
      pngDetails: null,
      pdfDetails: null,
      flaws: []
    };

    // 1. Check PNG
    if (!fs.existsSync(pngPath)) {
      itemResult.flaws.push('Missing PNG file');
    } else {
      const pngBuf = fs.readFileSync(pngPath);
      const pngHeader = parsePngHeader(pngBuf);
      if (!pngHeader) {
        itemResult.flaws.push('Corrupt or invalid PNG header');
      } else if (pngBuf.length < 50 * 1024) {
        itemResult.flaws.push(`PNG file size suspiciously small: ${(pngBuf.length / 1024).toFixed(1)} KB`);
      } else {
        itemResult.pngValid = true;
        itemResult.pngDetails = {
          sizeKb: (pngBuf.length / 1024).toFixed(1),
          width: pngHeader.width,
          height: pngHeader.height,
          aspectRatio: pngHeader.aspectRatio
        };
      }
    }

    // 2. Check PDF
    if (!fs.existsSync(pdfPath)) {
      itemResult.flaws.push('Missing PDF file');
    } else {
      try {
        const pdfBuf = fs.readFileSync(pdfPath);
        if (pdfBuf.length < 5 * 1024) {
          itemResult.flaws.push(`PDF file size suspiciously small: ${(pdfBuf.length / 1024).toFixed(1)} KB`);
        } else {
          const doc = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBuf) }).promise;
          const numPages = doc.numPages;
          let fullText = '';
          const pageCharCounts = [];

          for (let p = 1; p <= numPages; p++) {
            const page = await doc.getPage(p);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            pageCharCounts.push(pageText.trim().length);
            fullText += `\n--- Page ${p} ---\n` + pageText;
          }

          // Flaw checks
          if (numPages > 4) {
            itemResult.flaws.push(`Excessive page count (${numPages} pages)`);
          }

          if (fullText.includes('[object Object]')) {
            itemResult.flaws.push('Contains [object Object] text');
          }
          if (fullText.includes('NaN')) {
            itemResult.flaws.push('Contains NaN text');
          }
          if (fullText.includes('undefined')) {
            itemResult.flaws.push('Contains undefined text');
          }

          // Check core fields
          const norm = fullText.toLowerCase().replace(/\s+/g, ' ');
          const hasName = norm.includes('alexandra') || norm.includes('chen');
          const hasSummary = norm.includes('systems architect') || norm.includes('mission-critical');
          const hasExperience = norm.includes('vercel') || norm.includes('cloudflare');
          const hasSkills = norm.includes('rust') || norm.includes('kubernetes');
          const hasEducation = norm.includes('stanford') || norm.includes('berkeley');

          if (!hasName) itemResult.flaws.push('Missing Candidate Name');
          if (!hasSummary) itemResult.flaws.push('Missing Professional Summary');
          if (!hasExperience) itemResult.flaws.push('Missing Experience');
          if (!hasSkills) itemResult.flaws.push('Missing Skills');
          if (!hasEducation) itemResult.flaws.push('Missing Education');

          // Check for empty pages
          const emptyPages = pageCharCounts.map((count, idx) => count < 20 ? idx + 1 : null).filter(Boolean);
          if (emptyPages.length > 0) {
            itemResult.flaws.push(`Empty or near-empty page(s): ${emptyPages.join(', ')}`);
          }

          if (itemResult.flaws.length === 0) {
            itemResult.pdfValid = true;
          }

          itemResult.pdfDetails = {
            sizeKb: (pdfBuf.length / 1024).toFixed(1),
            pages: numPages,
            pageCharCounts,
            totalChars: fullText.length,
            hasName,
            hasSummary,
            hasExperience,
            hasSkills,
            hasEducation
          };
        }
      } catch (err) {
        itemResult.flaws.push(`PDF parse failure: ${err.message}`);
      }
    }

    results.push(itemResult);

    if (itemResult.flaws.length === 0) {
      console.log(`${prefix} ✓ PERFECT (PNG: ${itemResult.pngDetails.sizeKb}KB [${itemResult.pngDetails.width}x${itemResult.pngDetails.height}], PDF: ${itemResult.pdfDetails.pages}p, ${itemResult.pdfDetails.totalChars} chars)`);
    } else {
      allPerfect = false;
      console.log(`${prefix} ⚠️ ISSUES: ${itemResult.flaws.join(' | ')}`);
    }
  }

  console.log('\n' + '-'.repeat(80));
  const perfectCount = results.filter(r => r.flaws.length === 0).length;
  console.log(`Final Verification Audit: ${perfectCount} / ${ALL_TEMPLATES.length} templates are 100% PERFECT.`);
  console.log('-'.repeat(80));

  fs.writeFileSync('scratch/deep-verification-report.json', JSON.stringify(results, null, 2));
  console.log('Saved detailed audit report to scratch/deep-verification-report.json');

  return { allPerfect, perfectCount, total: ALL_TEMPLATES.length };
}

verifyAll().catch(console.error);
