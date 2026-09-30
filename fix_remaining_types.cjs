const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if(!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let oldContent = content;
    
    // Statuses
    content = content.replace(/=== 'pending'/g, "=== 'REQUESTED'");
    content = content.replace(/=== 'accepted'/g, "=== 'ACCEPTED'");
    content = content.replace(/=== 'active'/g, "=== 'ACTIVE'");
    content = content.replace(/=== 'cancelled'/g, "=== 'CANCELLED'");
    content = content.replace(/=== 'completed'/g, "=== 'COMPLETED'");
    
    content = content.replace(/status: 'pending'/g, "status: 'REQUESTED'");
    content = content.replace(/status: 'accepted'/g, "status: 'ACCEPTED'");
    content = content.replace(/status: 'active'/g, "status: 'ACTIVE'");
    content = content.replace(/status: 'cancelled'/g, "status: 'CANCELLED'");
    content = content.replace(/status: 'completed'/g, "status: 'COMPLETED'");
    
    content = content.replace(/state: 'pending'/g, "status: 'REQUESTED'");
    content = content.replace(/state: 'accepted'/g, "status: 'ACCEPTED'");
    content = content.replace(/state: 'active'/g, "status: 'ACTIVE'");
    content = content.replace(/state: 'cancelled'/g, "status: 'CANCELLED'");
    content = content.replace(/state: 'completed'/g, "status: 'COMPLETED'");

    // ResourceContext.tsx: INITIAL_RESOURCES instead of MOCK_RESOURCES
    content = content.replace(/MOCK_RESOURCES/g, "INITIAL_RESOURCES");

    // Resource Types & Intents
    content = content.replace(/=== 'request'/g, "=== 'NEED'");
    content = content.replace(/type: 'request'/g, "intent: 'NEED'");
    content = content.replace(/type === 'request'/g, "intent === 'NEED'");
    content = content.replace(/resource\.type === 'request'/g, "resource.intent === 'NEED'");
    content = content.replace(/resourceType === 'request'/g, "intent === 'NEED'");
    content = content.replace(/draft\.type === 'request'/g, "draft.intent === 'NEED'");
    
    content = content.replace(/case 'item':/g, "case 'ITEM':");
    content = content.replace(/case 'skill':/g, "case 'SKILL':");
    content = content.replace(/case 'help':/g, "case 'HELP':");
    content = content.replace(/case 'request':/g, "case 'NEED':"); // might be wrong contextually but let's see
    
    content = content.replace(/Type '"item"'/g, "Type 'ITEM'");
    
    // StatusBadge
    content = content.replace(/pending:/g, "REQUESTED:");
    content = content.replace(/accepted:/g, "ACCEPTED:");
    content = content.replace(/cancelled:/g, "CANCELLED:");
    
    // OrderContext.tsx
    content = content.replace(/state:/g, "status:");

    // Explore.tsx
    content = content.replace(/value: 'request'/g, "value: 'NEED'");

    // RequestFlow.tsx
    content = content.replace(/OfferType, /g, "");
    content = content.replace(/import { OfferType } from '\.\.\/types';/g, "");

    // ActivityItem.tsx
    content = content.replace(/EXCHANGE_REQUEST_RECEIVED/g, "ORDER_REQUEST_RECEIVED");
    content = content.replace(/EXCHANGE_REQUEST_ACCEPTED/g, "ORDER_REQUEST_ACCEPTED");
    content = content.replace(/EXCHANGE_REQUEST_DECLINED/g, "ORDER_REQUEST_DECLINED");
    content = content.replace(/EXCHANGE_STARTED/g, "ORDER_STARTED");
    content = content.replace(/EXCHANGE_COMPLETED/g, "ORDER_COMPLETED");
    content = content.replace(/NEW_EXCHANGE_MESSAGE/g, "NEW_ORDER_MESSAGE");

    if (content !== oldContent) {
        fs.writeFileSync(filePath, content);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            replaceInFile(fullPath);
        }
    }
}

walkDir('src');
