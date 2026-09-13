import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { generateTypst } from '../lib/typst-generator.ts';
import { DEMO_RESUME_DATA } from '../lib/demo-data.ts';
import { ALL_TEMPLATES } from '../lib/templates-data.ts';

// Every registered template (52, not the original 6) — each has its own
// distinct .typ layout file, so this must cover all of them, not just the
// founding set. Themes are spot-checked against a handful of templates
// rather than the full cross product (52 × 8 = 416 renders) since color
// tokens are applied by shared theme logic, not per-template.
const templates = ALL_TEMPLATES.map((t) => t.id);
const themeSpotCheckTemplates = ['modern', 'executive', 'terminal'];
const themes = ['none', 'navy', 'cobalt', 'emerald', 'burgundy', 'teal', 'slate', 'black'];

const bin = path.resolve('./bin/typst.exe');
const typstDir = path.resolve('./typst');
const outDir = path.resolve('./scratch/regression-renders');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function runRegression() {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting Automated Visual Regression Audit (${templates.length} templates × theme spot-check)`);
  console.log(`======================================================\n`);

  const results = [];

  for (const template of templates) {
    const templateThemes = themeSpotCheckTemplates.includes(template) ? themes : ['none'];
    for (const theme of templateThemes) {
      const code = generateTypst(DEMO_RESUME_DATA, template, theme);
      const pngPattern = path.join(outDir, `${template}-${theme}-{n}.png`);

      const outcome = await new Promise((resolve) => {
        const args = [
          'compile',
          '--root', typstDir,
          '--font-path', 'C:\\Windows\\Fonts',
          '--ppi', '144',
          '-',
          pngPattern
        ];
        const child = spawn(bin, args);
        let stderr = '';
        child.stderr.on('data', (d) => { stderr += d.toString(); });
        child.on('close', (code) => {
          if (code === 0) {
            // Check rendered PNGs
            const files = fs.readdirSync(outDir).filter(f => f.startsWith(`${template}-${theme}-`) && f.endsWith('.png'));
            const pageCount = files.length;
            const totalBytes = files.reduce((acc, f) => acc + fs.statSync(path.join(outDir, f)).size, 0);
            resolve({
              ok: true,
              pageCount,
              files,
              totalBytes,
            });
          } else {
            resolve({ ok: false, error: stderr.trim() });
          }
        });
        child.stdin.write(code);
        child.stdin.end();
      });

      const statusTag = outcome.ok ? (outcome.pageCount === 1 ? 'PASS [1 Page]' : `PASS [${outcome.pageCount} Pages]`) : 'FAIL';
      console.log(`[${statusTag}] ${template} + ${theme}: ${outcome.ok ? `${(outcome.totalBytes / 1024).toFixed(1)} KB` : outcome.error}`);
      results.push({ template, theme, ...outcome });
    }
  }

  const failures = results.filter(r => !r.ok);
  const multiPage = results.filter(r => r.ok && r.pageCount > 1);

  console.log(`\n======================================================`);
  console.log(`Summary: ${results.length} total | ${failures.length} failures | ${multiPage.length} multi-page`);
  console.log(`======================================================\n`);

  if (failures.length > 0) {
    console.error('Failed combinations:', failures);
    process.exit(1);
  }
}

runRegression().catch(err => {
  console.error(err);
  process.exit(1);
});
