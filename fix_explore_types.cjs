const fs = require('fs');

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

content = content.replace(
    /const \[activeFilter, setActiveFilter\] = useState<ResourceType \| 'all'>\([\s\S]*?\);/,
    "const [activeFilter, setActiveFilter] = useState<import('../types').ResourceType | 'NEED' | 'all'>((typeParam as any) || 'all');"
);

content = content.replace(/resource\.intent !== 'request'/g, "resource.intent !== 'NEED'");

// Fix activeFilter type issue in setActiveFilter
content = content.replace(/setActiveFilter\(\(searchParams\.get\('type'\) as ResourceType \| null\) \|\| 'all'\);/, 
    "setActiveFilter((searchParams.get('type') as import('../types').ResourceType | 'NEED' | null) || 'all');"
);

content = content.replace(/resource\.intent === 'NEED' \|\| resource\.intent === 'NEED'/g, "resource.intent === 'NEED'");

fs.writeFileSync('src/pages/Explore.tsx', content);

