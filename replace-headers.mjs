import fs from 'fs';
import path from 'path';

const search1 = `<img loading="lazy" decoding="async" src="/sp logo.png" alt="Srila Prabhupada" style={{ height: '60px', width: 'auto', display: 'block', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }} />`;
const replace1 = `<Image src="/sp logo.png" alt="Srila Prabhupada" width={100} height={60} style={{ height: '60px', width: 'auto', display: 'block', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }} />`;

const search2 = `<img loading="lazy" decoding="async" src="/Braj_nidhi_.png" alt="Braj Nidhi Logo" style={{ height: '55px', width: 'auto', display: 'block' }} />`;
const replace2 = `<Image src="/Braj_nidhi_.png" alt="Braj Nidhi Logo" width={165} height={55} style={{ height: '55px', width: 'auto', display: 'block' }} />`;

const search3 = `<img loading="lazy" decoding="async" src="/LOGO1.webp" alt="Vrindavan Chandrodaya Mandir" style={{ height: '50px', width: 'auto', display: 'block', borderRadius: '6px' }} />`;
const replace3 = `<Image src="/LOGO1.webp" alt="Vrindavan Chandrodaya Mandir" width={50} height={50} style={{ height: '50px', width: 'auto', display: 'block', borderRadius: '6px' }} />`;

const search4 = `<img loading="lazy" decoding="async" src="/Braj_nidhi_.png" alt="Braj Nidhi Logo" style={{ height: "45px", width: "auto" }} />`;
const replace4 = `<Image src="/Braj_nidhi_.png" alt="Braj Nidhi Logo" width={135} height={45} style={{ height: "45px", width: "auto" }} />`;

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

const files = walk('a:/bn/src/app');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes(search1) || content.includes(search2) || content.includes(search3) || content.includes(search4)) {
    content = content.replace(search1, replace1);
    content = content.replace(search2, replace2);
    content = content.replace(search3, replace3);
    content = content.replace(search4, replace4);
    
    // Add import Image if not present
    if (!content.includes("import Image from 'next/image'")) {
        content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport Image from 'next/image';");
        if (!content.includes("import Image from 'next/image'") && content.includes('import Link from "next/link";')) {
             content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";');
        }
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated headers in', file);
  }
});
