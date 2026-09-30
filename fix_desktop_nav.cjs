const fs = require('fs');
let code = fs.readFileSync('src/components/layout/DesktopNavigation.tsx', 'utf-8');

if (!code.includes('currentUser')) {
  code = code.replace(
    "import { useActivity } from '../../contexts/ActivityContext';",
    "import { useActivity } from '../../contexts/ActivityContext';\nimport { currentUser } from '../../data/mockData';"
  );
  
  code = code.replace(
    "</nav>\n          <div className=\"w-px h-6 bg-border-subtle\"></div>",
    "</nav>\n          \n          {currentUser.role === 'ADMIN' && (\n            <>\n              <div className=\"w-px h-6 bg-border-subtle\"></div>\n              <NavLink to=\"/admin\" className={({ isActive }) => cn(\"text-label relative py-2 transition-colors\", isActive ? \"text-text-primary\" : \"text-text-secondary hover:text-text-primary\")}>\n                Admin\n              </NavLink>\n            </>\n          )}\n\n          <div className=\"w-px h-6 bg-border-subtle\"></div>"
  );
  
  fs.writeFileSync('src/components/layout/DesktopNavigation.tsx', code);
  console.log('Fixed DesktopNavigation.tsx');
}
