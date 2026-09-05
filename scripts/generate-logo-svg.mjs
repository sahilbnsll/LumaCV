import fs from 'fs';

function generateStarburstSvg() {
  const cx = 100, cy = 100;
  
  // Outer points: 16 tips, 16 valleys = 32 points
  // 8 primary tips at 0, 45, 90, ...
  // 8 secondary tips at 22.5, 67.5, ...
  // 16 valleys at 11.25, 33.75, ...
  const outerPoints = [];
  for (let i = 0; i < 32; i++) {
    const angleDeg = i * (360 / 32); // 11.25 deg increments
    const rad = (angleDeg * Math.PI) / 180;
    let r;
    if (i % 2 === 0) {
      // Tip
      const tipIndex = i / 2;
      r = (tipIndex % 2 === 0) ? 92 : 80;
    } else {
      // Valley
      r = 45;
    }
    const x = Number((cx + r * Math.sin(rad)).toFixed(2));
    const y = Number((cy - r * Math.cos(rad)).toFixed(2));
    outerPoints.push(`${x},${y}`);
  }

  // Inner star points: 8 tips (at 0, 45, 90, 135, 180, 225, 270, 315), 8 valleys (at 22.5, 67.5, ...)
  const innerPoints = [];
  for (let i = 0; i < 16; i++) {
    const angleDeg = i * (360 / 16); // 22.5 deg increments
    const rad = (angleDeg * Math.PI) / 180;
    const r = (i % 2 === 0) ? 49 : 16;
    const x = Number((cx + r * Math.sin(rad)).toFixed(2));
    const y = Number((cy - r * Math.cos(rad)).toFixed(2));
    innerPoints.push(`${x},${y}`);
  }

  const d = `M ${outerPoints.join(' L ')} Z M ${innerPoints.join(' L ')} Z`;
  return d;
}

const pathData = generateStarburstSvg();

const svgContent = `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="${pathData}" fill="currentColor" />
</svg>
`;

fs.writeFileSync('public/icon.svg', svgContent);
console.log('Successfully updated public/icon.svg with exact geometry');
