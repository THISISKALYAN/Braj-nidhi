import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.join('a:/bn', 'public');
const srcDir = path.join('a:/bn', 'src');

const toConvert = [
  'Braj_nidhi_.png',
  'sp logo.png',
  '1200x630wa-removebg-preview.png',
  'logo.png'
];

async function convertImage(inputPath, outputPath) {
  try {
    if (!fs.existsSync(inputPath)) return null;
    const pipeline = sharp(inputPath);
    const meta = await pipeline.metadata();
    
    if (meta.hasAlpha) {
      await sharp(inputPath)
        .webp({ lossless: true, quality: 90 })
        .toFile(outputPath);
    } else {
      await sharp(inputPath)
        .webp({ quality: 82, effort: 6 })
        .toFile(outputPath);
    }
    console.log(`Converted ${path.basename(inputPath)}`);
    return { orig: path.basename(inputPath), webp: path.basename(outputPath) };
  } catch (err) {
    console.error(`Failed: ${inputPath} — ${err.message}`);
    return null;
  }
}

async function main() {
  const conversions = [];
  
  for (const file of toConvert) {
    const inputPath = path.join(publicDir, file);
    const webpName = file.replace(/\.png$/, '.webp');
    const outputPath = path.join(publicDir, webpName);
    
    const result = await convertImage(inputPath, outputPath);
    if (result) conversions.push(result);
  }
  
  updateSourceReferences(srcDir, conversions);
}

function updateSourceReferences(dir, conversions) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      updateSourceReferences(fullPath, conversions);
      continue;
    }
    if (!['.tsx', '.ts', '.jsx', '.js', '.css'].includes(path.extname(file))) continue;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    for (const { orig, webp } of conversions) {
      const escaped = orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, webp);
        modified = true;
        console.log(`Updated "${orig}" → "${webp}" in ${fullPath}`);
      }
    }
    
    if (modified) fs.writeFileSync(fullPath, content);
  }
}

main().catch(console.error);
