const fs = require('fs');
const path = require('path');
const [,, targetPath, base64Content] = process.argv;
const fullPath = path.resolve(targetPath);
fs.mkdirSync(path.dirname(fullPath), { recursive: true });
const content = Buffer.from(base64Content, 'base64').toString('utf8');
fs.writeFileSync(fullPath, content, 'utf8');
console.log('Successfully wrote ' + targetPath);