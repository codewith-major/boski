const fs = require('fs');
let code = fs.readFileSync('src/components/layout/MobileHeader.tsx', 'utf-8');

if (!code.includes('currentUser')) {
  code = code.replace(
    "import { useActivity } from '../../contexts/ActivityContext';",
    "import { useActivity } from '../../contexts/ActivityContext';\nimport { currentUser } from '../../data/mockData';\nimport { ShieldAlert } from 'lucide-react';"
  );
  
  code = code.replace(
    "<button \n          onClick={() => navigate('/activity')}",
    "{currentUser.role === 'ADMIN' && (\n          <button \n            onClick={() => navigate('/admin')}\n            className=\"relative text-text-secondary hover:text-text-primary p-2 rounded-full mr-2\"\n            aria-label=\"Admin\"\n          >\n            <ShieldAlert className=\"w-5 h-5\" />\n          </button>\n        )}\n        <button \n          onClick={() => navigate('/activity')}"
  );
  
  fs.writeFileSync('src/components/layout/MobileHeader.tsx', code);
  console.log('Fixed MobileHeader.tsx');
}
