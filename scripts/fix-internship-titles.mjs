import fs from 'fs';
import path from 'path';

const files = [
  'generated-boutique.typ',
  'generated-editorial.typ',
  'generated-executive.typ',
  'generated-matrix.typ',
  'generated-monochrome.typ',
  'generated-neo.typ',
  'generated-nordic.typ',
  'generated-portfolio.typ',
  'generated-statement.typ',
  'generated-swiss.typ',
  'generated-terminal.typ',
  'generated-timeline.typ'
];

for (const f of files) {
  const p = path.resolve('typst/templates', f);
  if (!fs.existsSync(p)) continue;
  let code = fs.readFileSync(p, 'utf8');

  // Replace section("Experience" inside the internships block
  const oldSnippet = 'else if sec == "internships" {\n      if "internships" in data and data.internships.len() > 0 {\n    section("Experience",';
  const newSnippet = 'else if sec == "internships" {\n      if "internships" in data and data.internships.len() > 0 {\n    section("Internships",';

  if (code.includes(oldSnippet)) {
    code = code.replace(oldSnippet, newSnippet);
    fs.writeFileSync(p, code, 'utf8');
    console.log(`✓ Fixed internships header in ${f}`);
  } else {
    // Try regex
    const regex = /(else if sec == "internships"\s*\{\s*if "internships" in data and data\.internships\.len\(\) > 0\s*\{\s*)section\("Experience",/g;
    if (regex.test(code)) {
      code = code.replace(regex, '$1section("Internships",');
      fs.writeFileSync(p, code, 'utf8');
      console.log(`✓ Fixed internships header (regex) in ${f}`);
    } else {
      console.log(`- Already correct or no match in ${f}`);
    }
  }
}
