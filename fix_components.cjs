const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminShell.tsx', 'utf-8');
code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');
fs.writeFileSync('src/components/admin/AdminShell.tsx', code);

code = fs.readFileSync('src/contexts/ModerationContext.tsx', 'utf-8');
code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');
fs.writeFileSync('src/contexts/ModerationContext.tsx', code);
console.log('Fixed components');
