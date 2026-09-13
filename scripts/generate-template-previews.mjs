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

async function compileTypstToPng(typstBin, typstRoot, typstCode, outPngPath) {
    const args = [
        'compile',
        '--root', typstRoot,
        '--font-path', 'C:\\Windows\\Fonts',
        '-f', 'png',
        '--pages', '1',
        '--ppi', '144',
        '-',
        outPngPath
    ];

    return new Promise((resolve, reject) => {
        const child = spawn(typstBin, args);
        let stderr = '';
        child.stderr.on('data', chunk => { stderr += chunk; });
        child.on('close', code => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(stderr || `typst exited with code ${code}`));
            }
        });
        child.stdin.write(typstCode);
        child.stdin.end();
    });
}

async function compileTypstToPdf(typstBin, typstRoot, typstCode, outPdfPath) {
    const args = [
        'compile',
        '--root', typstRoot,
        '--font-path', 'C:\\Windows\\Fonts',
        '-',
        outPdfPath
    ];

    return new Promise((resolve, reject) => {
        const child = spawn(typstBin, args);
        let stderr = '';
        child.stderr.on('data', chunk => { stderr += chunk; });
        child.on('close', code => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(stderr || `typst exited with code ${code}`));
            }
        });
        child.stdin.write(typstCode);
        child.stdin.end();
    });
}

async function run() {
    const outPngDir = path.join(rootDir, 'public', 'templates');
    const outPdfDir = path.join(rootDir, 'public', 'templates', 'pdf');
    await fs.mkdir(outPngDir, { recursive: true });
    await fs.mkdir(outPdfDir, { recursive: true });

    const typstBin = path.join(rootDir, 'bin', 'typst.exe');
    const typstRoot = path.join(rootDir, 'typst');

    console.log(`========================================================================`);
    console.log(`LumaCV Template Previews & PDF Generator`);
    console.log(`Using Golden Resume (${DEMO_RESUME_DATA.personalInfo.name}) — all ${ALL_TEMPLATES.length} templates`);
    console.log(`Compiler: ${typstBin}`);
    console.log(`========================================================================\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < ALL_TEMPLATES.length; i++) {
        const t = ALL_TEMPLATES[i];
        const tNum = `[${String(i + 1).padStart(2)}/${ALL_TEMPLATES.length}]`;
        const startTime = Date.now();

        // Generate Typst code using the comprehensive Golden Resume
        const typstCode = generateTypst(DEMO_RESUME_DATA, t.id);

        // Target image name exactly matches template ID
        const targetPngName = `${t.id}.png`;
        const outPng = path.join(outPngDir, targetPngName);
        const outPdf = path.join(outPdfDir, `${t.id}.pdf`);

        try {
            // 1. Compile Page 1 PNG preview
            await compileTypstToPng(typstBin, typstRoot, typstCode, outPng);

            // 2. Compile full multi-page PDF
            await compileTypstToPdf(typstBin, typstRoot, typstCode, outPdf);

            const duration = Date.now() - startTime;
            const pngStat = await fs.stat(outPng);
            console.log(`${tNum} ✓ ${t.id} (${t.name}) -> ${targetPngName} (${(pngStat.size / 1024).toFixed(1)} KB, ${duration}ms)`);

            // 3. Create compatibility aliases so no existing URLs or legacy references break
            const aliases = new Set([
                targetPngName,
                `${t.id.replace(/_/g, '-')}.png`,
                `${t.id.replace(/-/g, '_')}.png`,
                `${t.name.toLowerCase().replace(/\s+/g, '_')}.png`,
                `${t.name.toLowerCase().replace(/\s+/g, '-')}.png`,
            ]);

            if (t.sourceFile.startsWith('new-')) {
                aliases.add(`new-${t.id}.png`);
            } else if (t.sourceFile.startsWith('provided-')) {
                aliases.add(`provided-${t.id}.png`);
            } else if (t.sourceFile.startsWith('generated-')) {
                aliases.add(`generated-${t.id}.png`);
                aliases.add(`generated_${t.id}.png`);
            }

            // Also copy to any aliases
            for (const alias of aliases) {
                if (alias !== targetPngName) {
                    const aliasPath = path.join(outPngDir, alias);
                    try {
                        await fs.copyFile(outPng, aliasPath);
                    } catch {
                        // ignore alias copy error
                    }
                }
            }

            successCount++;
        } catch (err) {
            console.error(`${tNum} ✗ FAILED ${t.id} (${t.name}):`, err.message);
            failCount++;
        }
    }

    console.log(`\n------------------------------------------------------------------------`);
    console.log(`Compilation Summary: ${successCount}/${ALL_TEMPLATES.length} templates succeeded (${failCount} failed).`);
    console.log(`PNG previews saved in: public/templates/`);
    console.log(`PDFs saved in: public/templates/pdf/`);
    console.log(`------------------------------------------------------------------------\n`);

    if (failCount > 0) {
        process.exit(1);
    }
}

run().catch(err => {
    console.error('Fatal error in preview generation:', err);
    process.exit(1);
});
