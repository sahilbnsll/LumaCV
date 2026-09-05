import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('scratch/regression-renders');
const destDir = path.resolve('public/templates/renders');
const baseDir = path.resolve('public/templates');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png'));
console.log(`Found ${files.length} render files in ${srcDir}`);

for (const file of files) {
  const cleanName = file.replace(/-1\.png$/, '.png');
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, cleanName);
  fs.copyFileSync(srcPath, destPath);

  // If this is the default/navy or none variant, also make sure base template has an up to date copy
  if (cleanName.includes('-navy.png')) {
    const templateName = cleanName.replace('-navy.png', '');
    const baseTarget = path.join(baseDir, `${templateName}.png`);
    fs.copyFileSync(srcPath, baseTarget);
    console.log(`Updated base template: ${templateName}.png`);
  }
}

const copied = fs.readdirSync(destDir);
console.log(`Successfully synced ${copied.length} renders to ${destDir}`);
