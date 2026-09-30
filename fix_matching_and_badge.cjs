const fs = require('fs');

// Fix matching.ts
let matchContent = fs.readFileSync('src/lib/matching.ts', 'utf8');
matchContent = matchContent.replace(/source\.type !== 'request'/g, "source.intent !== 'NEED'");
matchContent = matchContent.replace(/resource\.intent === 'NEED' \|\| resource\.intent === 'NEED'/g, "resource.intent === 'NEED'");
matchContent = matchContent.replace(/target\.intent === 'NEED' \|\| target\.intent === 'NEED'/g, "target.intent === 'NEED'");
fs.writeFileSync('src/lib/matching.ts', matchContent);

// Fix StatusBadge.tsx
let badgeContent = fs.readFileSync('src/components/ui/StatusBadge.tsx', 'utf8');
badgeContent = badgeContent.replace(/status: OrderStatus;/g, "status: string;");
badgeContent = badgeContent.replace(/Record<OrderStatus, /g, "Record<string, ");
fs.writeFileSync('src/components/ui/StatusBadge.tsx', badgeContent);

// Fix RequestFlow.tsx
let reqFlowContent = fs.readFileSync('src/pages/RequestFlow.tsx', 'utf8');
reqFlowContent = reqFlowContent.replace(/import { ResourceType, Resource, Order, OfferType } from '\.\.\/types';/g, "import { ResourceType, Resource, Order } from '../types';");
fs.writeFileSync('src/pages/RequestFlow.tsx', reqFlowContent);

