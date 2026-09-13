import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_TEMPLATES } from '../lib/templates-data.ts';
import { DEMO_RESUME_DATA } from '../lib/demo-data.ts';
import { generateTypst } from '../lib/typst-generator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const templateId = process.argv[2];
if (!templateId) {
    console.error('Usage: node scripts/compile-single-template.mjs <template-id>');
    process.exit(1);
}

const template = ALL_TEMPLATES.find(t => t.id === templateId);
if (!template) {
    console.error(`Template "${templateId}" not found in ALL_TEMPLATES.`);
    process.exit(1);
}

async function run() {
    const outDir = path.join(rootDir, 'scratch', 'visual-audit');
    await fs.mkdir(outDir, { recursive: true });

    // Clean previous pages for this template
    const existing = await fs.readdir(outDir);
    for (const f of existing) {
        if (f.startsWith(`${templateId}-page`) && f.endsWith('.png')) {
            await fs.unlink(path.join(outDir, f));
        }
        if (f === `${templateId}.pdf`) {
            await fs.unlink(path.join(outDir, f));
        }
    }

    const typstBin = path.join(rootDir, 'bin', 'typst.exe');
    const typstRoot = path.join(rootDir, 'typst');
    const typstCode = generateTypst(DEMO_RESUME_DATA, template.id);

    // 1. Compile PDF
    const outPdf = path.join(outDir, `${template.id}.pdf`);
    await new Promise((resolve, reject) => {
        const child = spawn(typstBin, [
            'compile',
            '--root', typstRoot,
            '--font-path', 'C:\\Windows\\Fonts',
            '-',
            outPdf
        ]);
        let stderr = '';
        child.stderr.on('data', d => { stderr += d; });
        child.on('close', code => {
            if (code === 0) resolve();
            else reject(new Error(`PDF compile failed: ${stderr}`));
        });
        child.stdin.write(typstCode);
        child.stdin.end();
    });

    // 2. Compile every page PNG at 144 PPI
    const pngPattern = path.join(outDir, `${template.id}-page{n}.png`);
    await new Promise((resolve, reject) => {
        const child = spawn(typstBin, [
            'compile',
            '--root', typstRoot,
            '--font-path', 'C:\\Windows\\Fonts',
            '-f', 'png',
            '--ppi', '144',
            '-',
            pngPattern
        ]);
        let stderr = '';
        child.stderr.on('data', d => { stderr += d; });
        child.on('close', code => {
            if (code === 0) resolve();
            else reject(new Error(`PNG compile failed: ${stderr}`));
        });
        child.stdin.write(typstCode);
        child.stdin.end();
    });

    const files = (await fs.readdir(outDir))
        .filter(f => f.startsWith(`${templateId}-page`) && f.endsWith('.png'))
        .sort((a, b) => {
            const numA = parseInt(a.replace(/.*-page(\d+)\.png/, '$1'), 10);
            const numB = parseInt(b.replace(/.*-page(\d+)\.png/, '$1'), 10);
            return numA - numB;
        });

    console.log(JSON.stringify({
        id: template.id,
        name: template.name,
        sourceFile: template.sourceFile,
        pdf: outPdf,
        pages: files.map(f => path.join(outDir, f))
    }, null, 2));
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
