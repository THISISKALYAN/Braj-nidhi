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
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('a:/bn/src');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/onClick=\{\(\) = aria-label="Open menu"> setIsMobileMenuOpen\(!isMobileMenuOpen\)\}/g, 'onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Open menu"');
  
  content = content.replace(/onClick=\{\(\) = aria-label="Close menu"> setIsMobileMenuOpen\(false\)\}/g, 'onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu"');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
    console.log('Fixed syntax in ' + file);
  }
});
console.log('Fixed ' + count + ' files.');
