const fs = require('fs');
let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

content = content.replace(
    /const \[activeFilter, setActiveFilter\] = useState<ResourceType \| 'all'>\('all'\);/,
    "const [activeFilter, setActiveFilter] = useState<import('../types').ResourceType | 'NEED' | 'all'>('all');"
);

content = content.replace(
    /const handleFilterClick = \(filter: ResourceType \| 'all'\) => \{/,
    "const handleFilterClick = (filter: import('../types').ResourceType | 'NEED' | 'all') => {"
);

content = content.replace(
    /const filters: \{ label: string; value: ResourceType \| 'all' \}\[\] = \[/,
    "const filters: { label: string; value: import('../types').ResourceType | 'NEED' | 'all' }[] = ["
);

content = content.replace(
    /\{ label: 'Requests', value: 'all' \},/,
    "{ label: 'Requests', value: 'NEED' },"
);

fs.writeFileSync('src/pages/Explore.tsx', content);
