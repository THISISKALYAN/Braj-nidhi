import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk('a:/bn/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.includes("'Bebas Neue'")) {
    content = content.replace(/'Bebas Neue'/g, 'var(--font-bebas-neue)');
    changed = true;
  }
  if (content.includes("Bebas Neue,")) {
    content = content.replace(/Bebas Neue,/g, 'var(--font-bebas-neue),');
    changed = true;
  }
  if (content.includes("'Outfit'")) {
    content = content.replace(/'Outfit'/g, 'var(--font-outfit)');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
