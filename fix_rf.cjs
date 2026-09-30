const fs = require('fs');

let content = fs.readFileSync('src/pages/RequestFlow.tsx', 'utf8');

content = content.replace(/if \(offerType !== 'free' && !offerDetails\.trim\(\)\) \{\s*newErrors\.offerDetails = 'Please provide details about your offer';\s*\}/g, "");
content = content.replace(/offerType,\s*offerDetails: offerDetails \|\| undefined,/g, "");

fs.writeFileSync('src/pages/RequestFlow.tsx', content);

