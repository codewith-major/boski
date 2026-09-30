const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "import AdminReportDetail from './pages/admin/AdminReportDetail';",
  "import AdminReportDetail from './pages/admin/AdminReportDetail';\nimport AdminAnalytics from './pages/admin/AdminAnalytics';"
);

content = content.replace(
  "<Route index element={<Navigate to=\"/admin/overview\" replace />} />",
  "<Route index element={<Navigate to=\"/admin/overview\" replace />} />\n                      <Route path=\"analytics\" element={<AdminAnalytics />} />"
);

fs.writeFileSync('src/App.tsx', content);

