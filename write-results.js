const fs = require('fs');
const path = require('path');

const root = 'C:\\Users\\User\\.gemini\\antigravity\\scratch\\my-sista';
const logFile = path.join(root, 'check-env-direct.txt');

try {
  let output = '';
  output += `Files in root: ${JSON.stringify(fs.readdirSync(root))}\n`;

  const envPath = path.join(root, '.env');
  if (fs.existsSync(envPath)) {
    output += `.env exists!\n`;
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(l => {
      if (l.trim() && !l.startsWith('#')) {
        const parts = l.split('=');
        output += `  ${parts[0]} = (present, length: ${parts[1]?.length || 0})\n`;
      }
    });
  } else {
    output += `.env does not exist\n`;
  }

  // Also check if we can query the DB. Since we might have env vars, let's print process.env keys
  output += `Env keys: ${JSON.stringify(Object.keys(process.env))}\n`;

  fs.writeFileSync(logFile, output, 'utf8');
  console.log('Wrote log file to', logFile);
} catch (e) {
  fs.writeFileSync(logFile, 'Error: ' + e.message + '\n' + e.stack, 'utf8');
}
