const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  const targetPath = process.argv[2];
  if (!targetPath) {
    console.error('Target path required');
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, input, 'utf8');
  console.log('Saved: ' + targetPath + ' (' + input.length + ' chars)');
});
