const fs = require('fs');

let content = fs.readFileSync('src/components/order/OrderTimeline.tsx', 'utf8');

content = content.replace(/const steps = \[[\s\S]*?\];/, `const steps = [
    { id: 'REQUESTED', label: 'Requested' },
    { id: 'ACCEPTED', label: 'Accepted' },
    { id: 'PAID', label: 'Paid' },
    { id: 'ACTIVE', label: 'Active / In Progress' },
    { id: 'COMPLETED', label: 'Completed' },
  ];`);
  
fs.writeFileSync('src/components/order/OrderTimeline.tsx', content);

