import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appDir = path.join(__dirname, 'src', 'app');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const headerRegex = /<Link\s+href="\/"\s+style=\{\{\s*textDecoration:\s*['"]none['"],\s*display:\s*['"]flex['"],\s*alignItems:\s*['"]center['"]\s*\}\}>\s*<Image\s+src=["']\/LOGO1\.webp["']([^>]*)\/>\s*<\/Link>/g;

const footerRegex = /<div\s+className=["']footer-col["']>\s*<h3>Explore Vrindavan<\/h3>\s*((?:<(?:a|Link)\s+[^>]*>.*?<\/(?:a|Link)>\s*)+)<\/div>/g;

const files = walk(appDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Reset regex state
  headerRegex.lastIndex = 0;
  footerRegex.lastIndex = 0;

  // 1. Header logo link update
  if (headerRegex.test(content)) {
    content = content.replace(headerRegex, (match, p1) => {
      changed = true;
      return `<a href="https://vcm.org.in/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Image src="/LOGO1.webp"${p1}/>
            </a>`;
    });
  }

  // 2. Footer backlinks update
  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, (match, p1) => {
      changed = true;
      if (match.includes('\n')) {
        const replacement = p1 + 
`                <a href="https://vcm.org.in/" target="_blank" rel="noopener noreferrer">Chandrodaya Mandir</a>\n` +
`                <a href="https://www.vhtofficial.com/" target="_blank" rel="noopener noreferrer">Heritage Tower</a>\n`;
        return match.replace(p1, replacement);
      } else {
        const replacement = p1 + 
`<a href="https://vcm.org.in/" target="_blank" rel="noopener noreferrer">Chandrodaya Mandir</a>` +
`<a href="https://www.vhtofficial.com/" target="_blank" rel="noopener noreferrer">Heritage Tower</a>`;
        return match.replace(p1, replacement);
      }
    });
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Updated backlinks in ${path.relative(appDir, file)}`);
  }
});

console.log('🎉 Finished updating backlinks!');
