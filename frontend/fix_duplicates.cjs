const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

function fixDuplicates(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove duplicate imports
  const importStatement = "import { useLanguage } from '../context/LanguageContext';";
  const importLines = content.split('\n');
  let importCount = 0;
  content = importLines.filter(line => {
    if (line.includes("import { useLanguage }")) {
      importCount++;
      return importCount === 1;
    }
    return true;
  }).join('\n');

  // Remove duplicate hook declarations
  const hookRegex = /const { t } = useLanguage\(\);/g;
  let hookCount = 0;
  content = content.replace(hookRegex, (match) => {
    hookCount++;
    if (hookCount === 1) {
      return match;
    }
    return '';
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed duplicates in ${path.basename(filePath)}`);
  }
}

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));
for (const file of files) {
  fixDuplicates(path.join(pagesDir, file));
}
