const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace(/\/explore\?filter=NEED/g, "/explore?type=NEED");
content = content.replace(/\/explore\?filter=ITEM/g, "/explore?type=ITEM");
content = content.replace(/\/explore\?filter=SKILL/g, "/explore?type=SKILL");

fs.writeFileSync('src/pages/Home.tsx', content);

