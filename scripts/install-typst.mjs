import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';

const TYPST_VERSION = 'v0.15.1';
const binDir = path.join(process.cwd(), 'bin');

if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

const isLinux = process.platform === 'linux';
const isWindows = process.platform === 'win32';

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          downloadFile(response.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`Download failed with status code ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      })
      .on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function ensureTypst() {
  const linuxBin = path.join(binDir, 'typst-linux');
  const winBin = path.join(binDir, 'typst.exe');

  if (isLinux && !fs.existsSync(linuxBin)) {
    console.log(`[install-typst] Downloading Typst Linux ${TYPST_VERSION} for Vercel/Linux deployment...`);
    const tarPath = path.join(binDir, 'typst-linux.tar.xz');
    const url = `https://github.com/typst/typst/releases/download/${TYPST_VERSION}/typst-x86_64-unknown-linux-musl.tar.xz`;

    try {
      await downloadFile(url, tarPath);
      console.log('[install-typst] Extracting typst-linux...');
      execSync(`tar -xf "${tarPath}" -C "${binDir}"`);
      const extractedBin = path.join(binDir, 'typst-x86_64-unknown-linux-musl', 'typst');
      fs.copyFileSync(extractedBin, linuxBin);
      fs.chmodSync(linuxBin, 0o755);

      // Cleanup
      fs.rmSync(path.join(binDir, 'typst-x86_64-unknown-linux-musl'), { recursive: true, force: true });
      fs.unlinkSync(tarPath);
      console.log('[install-typst] Successfully installed typst-linux.');
    } catch (err) {
      console.error('[install-typst] Failed to download/extract typst-linux:', err.message);
    }
  } else if (isWindows && !fs.existsSync(winBin)) {
    console.log(`[install-typst] Downloading Typst Windows ${TYPST_VERSION}...`);
    const zipPath = path.join(binDir, 'typst-win.zip');
    const url = `https://github.com/typst/typst/releases/download/${TYPST_VERSION}/typst-x86_64-pc-windows-msvc.zip`;

    try {
      await downloadFile(url, zipPath);
      console.log('[install-typst] Extracting typst.exe...');
      execSync(`tar -xf "${zipPath}" -C "${binDir}"`);
      const extractedBin = path.join(binDir, 'typst-x86_64-pc-windows-msvc', 'typst.exe');
      fs.copyFileSync(extractedBin, winBin);

      // Cleanup
      fs.rmSync(path.join(binDir, 'typst-x86_64-pc-windows-msvc'), { recursive: true, force: true });
      fs.unlinkSync(zipPath);
      console.log('[install-typst] Successfully installed typst.exe.');
    } catch (err) {
      console.error('[install-typst] Failed to download/extract typst.exe:', err.message);
    }
  } else {
    console.log('[install-typst] Typst binary already present.');
  }
}

ensureTypst();
