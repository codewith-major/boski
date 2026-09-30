const fs = require('fs');
const path = require('path');

const dir = 'src/pages/admin';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let code = fs.readFileSync(filePath, 'utf-8');
    
    // Replace \` with `
    code = code.replace(/\\`/g, '`');
    // Replace \$ with $
    code = code.replace(/\\\$/g, '$');
    
    fs.writeFileSync(filePath, code);
  }
});
console.log('Fixed admin files');
