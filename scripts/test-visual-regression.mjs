import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { generateTypst } from '../lib/typst-generator.ts';
import { DEMO_RESUME_DATA } from '../lib/demo-data.ts';

const templates = ['modern', 'classic', 'engineering', 'compact', 'two_column', 'ats_safe'];
const themes = ['none', 'navy', 'cobalt', 'emerald', 'burgundy', 'teal', 'slate', 'black'];

const bin = path.resolve('./bin/typst.exe');
const typstDir = path.resolve('./typst');
const outDir = path.resolve('./scratch/regression-renders');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function runRegression() {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting Automated Visual Regression Audit (48 Combinations)`);
  console.log(`======================================================\n`);

  const results = [];

  for (const template of templates) {
    for (const theme of themes) {
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
