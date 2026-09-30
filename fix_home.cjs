const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace(/r\.intent !== 'request'/g, "r.intent !== 'NEED'");
content = content.replace(/r\.intent === 'request'/g, "r.intent === 'NEED'");
content = content.replace(/\(r\.intent === 'NEED' \|\| r\.intent === 'NEED'\)/g, "r.intent === 'NEED'");
content = content.replace(/\/explore\?type=request/g, "/explore?filter=NEED");
content = content.replace(/\/explore\?type=item/g, "/explore?filter=ITEM");
content = content.replace(/\/explore\?type=skill/g, "/explore?filter=SKILL");

fs.writeFileSync('src/pages/Home.tsx', content);

