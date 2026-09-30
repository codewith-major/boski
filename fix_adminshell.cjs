const fs = require('fs');

let content = fs.readFileSync('src/components/admin/AdminShell.tsx', 'utf8');

content = content.replace(
  "import { Users, LayoutDashboard, FileText, Repeat, AlertTriangle, Menu, X, LogOut } from 'lucide-react';",
  "import { Users, LayoutDashboard, FileText, Repeat, AlertTriangle, Menu, X, LogOut, BarChart2 } from 'lucide-react';"
);

content = content.replace(
  "const navItems = [",
  `const navItems = [
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },`
);

fs.writeFileSync('src/components/admin/AdminShell.tsx', content);

