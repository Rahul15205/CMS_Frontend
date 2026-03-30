const fs = require('fs');
const globPattern = 'd:\\\\Proteccio-Data\\\\Consent_Management_System\\\\frontend\\\\src\\\\services\\\\*.ts';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remove mock imports
  content = content.replace(/import\s+\{.*\}\s+from\s+['"]@\/data\/mock.*['"];?\r?\n?/gs, '');
  content = content.replace(/import\s+.*mock.*\s+from\s+['"]@\/data\/mock.*['"];?\r?\n?/gs, '');

  // Remove the inline mock arrays in the services (if any)
  content = content.replace(/\/\/ --- Inline mock data.*\r?\n(const mock.* = \[.*?\];\r?\n)+/gs, '');

  // Remove if (!FEATURE_FLAGS...) lines
  content = content.replace(/^\s*if\s*\(!FEATURE_FLAGS\.\w+\)\s*return\s+mock[^\n]+;\r?\n/gm, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Cleaned up mocks in ' + filePath);
  }
}

const files = require('child_process').execSync('dir /s /b d:\\Proteccio-Data\\Consent_Management_System\\frontend\\src\\services\\*.ts').toString().split('\r\n').filter(Boolean);
files.forEach(processFile);
console.log('Done script');
