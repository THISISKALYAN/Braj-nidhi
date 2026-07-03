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
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('a:/bn/src');
let iframeCount = 0;
let buttonCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Add missing title to iframes
  content = content.replace(/<iframe([^>]+)>/g, (match, p1) => {
    if (!match.includes('title=')) {
      iframeCount++;
      return '<iframe title="Embedded Map"' + p1 + '>';
    }
    return match;
  });

  // Add aria-labels to common icon-only buttons
  content = content.replace(/<button([^>]*className=["'][^"']*mobile-menu-btn[^"']*["'][^>]*)>/g, (match, p1) => {
    if (!match.includes('aria-label=')) {
      buttonCount++;
      return '<button' + p1 + ' aria-label="Open menu">';
    }
    return match;
  });

  content = content.replace(/<button([^>]*className=["'][^"']*mobile-menu-close[^"']*["'][^>]*)>/g, (match, p1) => {
    if (!match.includes('aria-label=')) {
      buttonCount++;
      return '<button' + p1 + ' aria-label="Close menu">';
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
console.log('Fixed ' + iframeCount + ' iframes and ' + buttonCount + ' buttons.');
