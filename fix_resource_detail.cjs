const fs = require('fs');
let code = fs.readFileSync('src/pages/ResourceDetail.tsx', 'utf-8');

code = code.replace(
  "import { ResourceType } from '../types';",
  "import { ResourceType } from '../types';\nimport { ShieldAlert, Flag, MessageSquare } from 'lucide-react';\nimport { ReportModal } from '../components/moderation/ReportModal';"
);

fs.writeFileSync('src/pages/ResourceDetail.tsx', code);
console.log('Fixed ResourceDetail.tsx');
