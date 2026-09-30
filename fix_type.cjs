const fs = require('fs');

let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(/resourceType:\s*status:/, 'resourceType: ResourceType;\n  status:');
fs.writeFileSync('src/types.ts', content);

