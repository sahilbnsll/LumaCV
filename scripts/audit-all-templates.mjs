import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { ALL_TEMPLATES } from '../lib/templates-data.ts';
import { generateTypst } from '../lib/typst-generator.ts';
import { DEMO_RESUME_DATA } from '../lib/demo-data.ts';

const bin = path.resolve('./bin/typst.exe');
const typstDir = path.resolve('./typst');
const outDir = path.resolve('./scratch/audit-results');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Single source of truth for the "golden resume" used across QA scripts and
// the app's real demo surfaces (Dashboard, ATS Checker, /demo, Editor entry)
// — see lib/demo-data.ts. Previously this file had its own separate literal
// that used field names that don't exist on the real schema (specialization,
// awarder, citation, url on nested items) instead of the schema's
// fieldOfStudy/context/platform/link, so several sections silently rendered
// empty during audits without anyone noticing.
export const goldenResume = DEMO_RESUME_DATA;

// =========================================================================
// AUDIT RUNNER FUNCTION
// =========================================================================

async function auditSingleTemplate(template) {
  const tmplId = template.id;
  const pdfOut = path.join(outDir, `${tmplId}.pdf`);
  const pngPattern = path.join(outDir, `${tmplId}-page{n}.png`);

  // Clean old output files for this template
  for (const f of fs.readdirSync(outDir)) {
    if (f.startsWith(`${tmplId}.`) || f.startsWith(`${tmplId}-`)) {
      try { fs.unlinkSync(path.join(outDir, f)); } catch {}
    }
  }

  // 1. Generate Typst markup via actual production generator
  let typstCode;
  try {
    typstCode = generateTypst(goldenResume, tmplId, 'none');
  } catch (err) {
    return {
      id: tmplId,
      name: template.name,
      ok: false,
      stage: 'generateTypst',
      error: err.message,
    };
  }

  // 2. Compile to PDF using production Typst binary & stdin
  const startTime = Date.now();
  const pdfResult = await new Promise((resolve) => {
    const args = [
      'compile',
      '--root', typstDir,
      '--font-path', 'C:\\Windows\\Fonts',
      '-',
      pdfOut
    ];
    const proc = spawn(bin, args);
    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('error', err => resolve({ ok: false, error: err.message }));
    proc.on('close', code => {
      const durationMs = Date.now() - startTime;
      if (code === 0 && fs.existsSync(pdfOut)) {
        const stats = fs.statSync(pdfOut);
        resolve({ ok: true, durationMs, sizeBytes: stats.size, stderr: stderr.trim() });
      } else {
        resolve({ ok: false, durationMs, error: stderr.trim() || `Exit code ${code}` });
      }
    });
    proc.stdin.write(typstCode);
    proc.stdin.end();
  });

  if (!pdfResult.ok) {
    return {
      id: tmplId,
      name: template.name,
      ok: false,
      stage: 'compilePdf',
      error: pdfResult.error,
    };
  }

  // 3. Render PNG pages for Visual QA
  const pngResult = await new Promise((resolve) => {
    const args = [
      'compile',
      '--root', typstDir,
      '--font-path', 'C:\\Windows\\Fonts',
      '--ppi', '120',
      '-',
      pngPattern
    ];
    const proc = spawn(bin, args);
    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => {
      const pages = fs.readdirSync(outDir).filter(f => f.startsWith(`${tmplId}-page`) && f.endsWith('.png'));
      resolve({
        ok: code === 0 && pages.length > 0,
        pages: pages.length,
        pageFiles: pages,
        stderr: stderr.trim()
      });
    });
    proc.stdin.write(typstCode);
    proc.stdin.end();
  });

  // 4. Extract text from generated PDF to inspect field presence
  // pdfjs-dist v6 is ESM-only (the old CommonJS 'legacy/build/pdf.js' path was
  // removed) — dynamic import() the .mjs build instead of require().
  let extractedText = '';
  let extractionError = null;
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const data = new Uint8Array(fs.readFileSync(pdfOut));
    const doc = await pdfjsLib.getDocument({ data }).promise;
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map(item => item.str).join(' ');
      extractedText += `\n--- PAGE ${i} ---\n` + pageStrings;
    }
  } catch (err) {
    extractionError = err.message;
    extractedText = '';
  }

  // Field verification checklist
  const normalizedText = extractedText.replace(/\s+/g, ' ').toLowerCase();
  const checkField = (term) => normalizedText.includes(term.toLowerCase().replace(/\s+/g, ' '));
  const checks = {
    hasName: checkField('Alex Morgan') || checkField('Morgan'),
    hasEmail: checkField('alex@example.com'),
    hasPhone: checkField('98765 43210') || checkField('9876543210'),
    hasSummary: checkField('Platform engineer with 8+') || checkField('making deployments boring'),
    hasExperience: checkField('Nebula Systems') || checkField('Northstar Cloud') || checkField('Orbit Labs'),
    hasProjects: checkField('LumaCV Platform') || checkField('Platform Golden Path'),
    hasEducation: checkField('National Institute of Technology') || checkField('B.Tech'),
    hasSkills: checkField('Kubernetes') || checkField('Terraform') || checkField('AWS'),
    hasCertifications: checkField('AWS Certified') || checkField('Kubernetes Administrator'),
    hasAchievements: checkField('Engineering Excellence Award'),
    hasPublications: checkField('GitOps') || checkField('Deployment Lead Time'),
    hasLanguages: checkField('Hindi') || checkField('English'),
    hasMetrics: checkField('52% faster') || checkField('99.95%') || checkField('Deployment lead time'),
    hasCustomSections: checkField('Additional Information') || checkField('relocation'),
  };

  const missingCore = [];
  if (!checks.hasName) missingCore.push('name');
  if (!checks.hasSummary) missingCore.push('summary');
  if (!checks.hasExperience) missingCore.push('experience');
  if (!checks.hasProjects) missingCore.push('projects');
  if (!checks.hasEducation) missingCore.push('education');
  if (!checks.hasSkills) missingCore.push('skills');

  const missingExtended = [];
  if (!checks.hasCertifications) missingExtended.push('certifications');
  if (!checks.hasAchievements) missingExtended.push('achievements');
  if (!checks.hasPublications) missingExtended.push('publications');
  if (!checks.hasLanguages) missingExtended.push('languages');
  if (!checks.hasMetrics) missingExtended.push('metrics');
  if (!checks.hasCustomSections) missingExtended.push('customSections');

  return {
    id: tmplId,
    name: template.name,
    ok: true,
    durationMs: pdfResult.durationMs,
    sizeBytes: pdfResult.sizeBytes,
    pages: pngResult.pages || 1,
    pageFiles: pngResult.pageFiles || [],
    checks,
    missingCore,
    missingExtended,
    extractionError,
    warnings: pdfResult.stderr || pngResult.stderr || null,
  };
}

// =========================================================================
// RUN AUDIT
// =========================================================================
async function run() {
  console.log(`\n========================================================================`);
  console.log(`LumaCV Golden Resume Template Audit — Testing all ${ALL_TEMPLATES.length} templates`);
  console.log(`========================================================================\n`);

  const results = [];
  let compileSuccess = 0;
  let compileFailed = 0;

  for (let i = 0; i < ALL_TEMPLATES.length; i++) {
    const t = ALL_TEMPLATES[i];
    process.stdout.write(`[${String(i + 1).padStart(2)}/${ALL_TEMPLATES.length}] Auditing "${t.id}" (${t.name})... `);
    const res = await auditSingleTemplate(t);
    results.push(res);

    if (res.ok) {
      compileSuccess++;
      const coreNotice = res.missingCore.length > 0 ? ` ⚠️ MISSING CORE: [${res.missingCore.join(', ')}]` : '';
      const extNotice = res.missingExtended.length > 0 ? ` (Omitted optional: ${res.missingExtended.join(', ')})` : '';
      const extractionNotice = res.extractionError ? ` 🛑 TEXT EXTRACTION FAILED: ${res.extractionError}` : '';
      console.log(`✓ OK (${res.durationMs}ms, ${res.pages}p, ${(res.sizeBytes / 1024).toFixed(1)}KB)${coreNotice}${extNotice}${extractionNotice}`);
    } else {
      compileFailed++;
      console.log(`❌ FAILED at stage ${res.stage}: ${res.error}`);
    }
  }

  // Write full JSON report to disk
  fs.writeFileSync(path.join(outDir, 'audit-report.json'), JSON.stringify(results, null, 2));

  console.log(`\n------------------------------------------------------------------------`);
  console.log(`Audit Summary: ${compileSuccess}/${ALL_TEMPLATES.length} compiled successfully (${compileFailed} failed).`);
  console.log(`Audit report written to scratch/audit-results/audit-report.json`);
  console.log(`------------------------------------------------------------------------\n`);
}

run();
