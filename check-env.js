const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\User\\.gemini\\antigravity\\scratch\\my-sista';

console.log('Files in root:', fs.readdirSync(root));
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  console.log('.env exists! Contents:');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach(l => {
    if (l.trim() && !l.startsWith('#')) {
      const parts = l.split('=');
      console.log(`  ${parts[0]} = (present, length: ${parts[1]?.length || 0})`);
    }
  });
} else {
  console.log('.env does not exist');
}
