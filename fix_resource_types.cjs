const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if(!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let oldContent = content;
    
    // Type checking strings
    content = content.replace(/type === 'item'/g, "type === 'ITEM'");
    content = content.replace(/type === 'skill'/g, "type === 'SKILL'");
    content = content.replace(/type === 'help'/g, "type === 'HELP'");
    content = content.replace(/type === 'request'/g, "intent === 'NEED'");
    
    content = content.replace(/type: 'item'/g, "type: 'ITEM'");
    content = content.replace(/type: 'skill'/g, "type: 'SKILL'");
    content = content.replace(/type: 'help'/g, "type: 'HELP'");
    content = content.replace(/type: 'request'/g, "intent: 'NEED'");
    
    // Some specific cases
    content = content.replace(/resourceType === 'item'/g, "resourceType === 'ITEM'");
    content = content.replace(/resourceType === 'skill'/g, "resourceType === 'SKILL'");
    content = content.replace(/resourceType === 'help'/g, "resourceType === 'HELP'");
    
    content = content.replace(/'item' \| 'skill' \| 'request'/g, "'ITEM' | 'SKILL' | 'HELP'");
    
    // In Explore:
    content = content.replace(/value: 'item'/g, "value: 'ITEM'");
    content = content.replace(/value: 'skill'/g, "value: 'SKILL'");
    
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
