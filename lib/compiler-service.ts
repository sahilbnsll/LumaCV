import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { ResumeData, TemplateType } from './resume-schema';
import { normalizeTemplateName, generateTypst } from './typst-generator';

export type CompileAttempt = {
  provider: string;
  ok: boolean;
  cycle: number;
  status?: number;
  retryable?: boolean;
  details?: string;
};

export type ProviderResult = {
  provider: string;
  pdfBuffer: ArrayBuffer;
};

export class ProviderError extends Error {
  status?: number;
  retryable: boolean;
  constructor(message: string, opts?: { status?: number; retryable?: boolean }) {
    super(message);
    this.name = 'ProviderError';
    this.status = opts?.status;
    this.retryable = opts?.retryable ?? true;
  }
}

interface CompileTypstOptions {
  resumeData?: ResumeData;
  template?: TemplateType | string;
  theme?: string;
  typstCode?: string;
}

import crypto from 'crypto';

interface CachedCompilation {
  pdfBuffer: ArrayBuffer;
  provider: string;
  createdAt: number;
}

const MAX_CACHE_ENTRIES = 120;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const compileMemoryCache = new Map<string, CachedCompilation>();

function getCompileCacheKey(options: CompileTypstOptions): string {
  const hash = crypto.createHash('sha256');
  if (options.typstCode && options.typstCode.trim()) {
    hash.update('raw:' + options.typstCode.trim());
  } else {
    hash.update('data:' + JSON.stringify(options.resumeData || {}) + ':' + (options.template || '') + ':' + (options.theme || ''));
  }
  return hash.digest('hex');
}

let cachedTypstCmd: string | null = null;

/**
 * Resolves the appropriate Typst executable for local Windows or Linux/Vercel serverless.
 * Result is cached in memory across requests for zero-overhead subsequent calls.
 */
async function getTypstExecutable(): Promise<string> {
  if (cachedTypstCmd) return cachedTypstCmd;

  const isLinux = process.platform === 'linux';

  if (isLinux) {
    const tmpTypst = path.join(os.tmpdir(), 'typst');
    try {
      await fs.access(tmpTypst);
      cachedTypstCmd = tmpTypst;
      return tmpTypst;
    } catch {
      // Not yet extracted/copied to /tmp
    }

    const packagedLinuxBin = path.join(process.cwd(), 'bin', 'typst-linux');
    try {
      await fs.access(packagedLinuxBin);
      await fs.copyFile(packagedLinuxBin, tmpTypst);
      await fs.chmod(tmpTypst, 0o755);
      cachedTypstCmd = tmpTypst;
      return tmpTypst;
    } catch {
      // Fallback to system PATH typst if available
      cachedTypstCmd = 'typst';
      return 'typst';
    }
  }

  // Windows
  const winBin = path.join(process.cwd(), 'bin', 'typst.exe');
  try {
    await fs.access(winBin);
    cachedTypstCmd = winBin;
    return winBin;
  } catch {
    cachedTypstCmd = 'typst';
    return 'typst';
  }
}

/**
 * Executes Typst compilation.
 * 100% compatible with Vercel serverless functions:
 * - Uses in-memory LRU cache for sub-millisecond instant repeat previews.
 * - Never writes to read-only directories.
 * - Uses os.tmpdir() exclusively for output PDFs.
 * - Streams custom markup via stdin or passes JSON directly in memory via --input data_json.
 */
export async function compileTypst(options: CompileTypstOptions): Promise<ProviderResult> {
  const cacheKey = getCompileCacheKey(options);
  const existing = compileMemoryCache.get(cacheKey);
  if (existing && (Date.now() - existing.createdAt) < CACHE_TTL_MS) {
    return {
      provider: `${existing.provider} (cached)`,
      pdfBuffer: existing.pdfBuffer,
    };
  }

  const typstDir = path.join(process.cwd(), 'typst');
  const tempId = `typst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const outputPdfPath = path.join(os.tmpdir(), `${tempId}.pdf`);

  const cleanup = async () => {
    try {
      await fs.unlink(outputPdfPath);
    } catch {}
  };

  const cmd = await getTypstExecutable();
  const template = normalizeTemplateName(options.template);
  const theme = options.theme && options.theme !== 'none' ? options.theme : 'none';

  try {
    const codeToCompile =
      options.typstCode && options.typstCode.trim()
        ? options.typstCode
        : options.resumeData
        ? generateTypst(options.resumeData, template as any, theme)
        : '';

    if (!codeToCompile) {
      throw new ProviderError('Neither resumeData nor typstCode was provided for compilation.', {
        retryable: false,
      });
    }

    // Compile Typst markup via stdin: avoids Windows CLI arg limits, quote mangling, and writable file requirements
    const args = ['compile', '--root', typstDir];
    // theme.typ's font-sans/font-serif stacks list "Inter" and "JetBrains Mono"
    // as the FIRST/primary choice, but neither ships with Typst's own embedded
    // fonts (DejaVu Sans Mono, Libertinus Serif, New Computer Modern only), and
    // production (Vercel/Linux) has no system font directory at all. Without
    // this, every "sans" template silently fell through the entire fallback
    // chain in production and rendered in Typst's last-resort serif default,
    // wrong font, not just a missing one. typst/fonts/ bundles just the two
    // fonts actually needed (Inter + JetBrains Mono, both variable-font single
    // files), so this stays a narrow, fast directory on every platform.
    args.push('--font-path', path.join(typstDir, 'fonts'));
    if (process.platform === 'win32') {
      args.push('--font-path', 'C:\\Windows\\Fonts');
    }
    args.push('-', outputPdfPath);

    await new Promise<void>((resolve, reject) => {
      const child = spawn(cmd, args, { timeout: 15000 });
      let stderr = '';

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('error', (err) => {
        reject(new ProviderError(err.message, { retryable: false }));
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          console.error('[Typst Stdin Error]:', stderr);
          reject(
            new ProviderError(stderr || `Typst process exited with code ${code}`, {
              retryable: false,
            })
          );
        }
      });

      child.stdin.write(codeToCompile);
      child.stdin.end();
    });

    const pdfBuffer = await fs.readFile(outputPdfPath);
    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    );

    const result: ProviderResult = {
      provider: `typst-serverless (${process.platform})`,
      pdfBuffer: arrayBuffer,
    };

    if (compileMemoryCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = compileMemoryCache.keys().next().value;
      if (oldestKey) compileMemoryCache.delete(oldestKey);
    }
    compileMemoryCache.set(cacheKey, {
      pdfBuffer: arrayBuffer,
      provider: result.provider,
      createdAt: Date.now(),
    });

    return result;
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new ProviderError(error instanceof Error ? error.message : 'Unknown compile error', {
      retryable: false,
    });
  } finally {
    cleanup().catch(() => {});
  }
}

/**
 * Executes a compilation cycle for async queue workers.
 */
export async function compileTypstProviderCycle(
  codeOrData: string | ResumeData,
  cycle = 1,
  opts?: { template?: string; theme?: string }
): Promise<{

  result?: ProviderResult;
  attempts: CompileAttempt[];
  sawRetryableFailure: boolean;
}> {
  const attempts: CompileAttempt[] = [];

  try {
    const isObject = typeof codeOrData === 'object' && codeOrData !== null;
    const result = await compileTypst({
      resumeData: isObject ? (codeOrData as ResumeData) : undefined,
      typstCode: !isObject ? (codeOrData as string) : undefined,
      template: opts?.template || 'modern',
      theme: opts?.theme || 'none',
    });

    attempts.push({
      provider: result.provider,
      ok: true,
      cycle,
    });

    return {
      result,
      attempts,
      sawRetryableFailure: false,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    attempts.push({
      provider: 'typst-serverless',
      ok: false,
      cycle,
      details: errorMsg,
      retryable: false,
    });

    return {
      attempts,
      sawRetryableFailure: false,
    };
  }
}


