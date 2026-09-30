const fs = require('fs');
let code = fs.readFileSync('src/components/resources/ProviderCard.tsx', 'utf-8');

if (!code.includes('ReportModal')) {
  code = code.replace(
    "import { Star } from 'lucide-react';",
    "import { Star, Flag } from 'lucide-react';\nimport { useState } from 'react';\nimport { ReportModal } from '../moderation/ReportModal';"
  );
  
  code = code.replace(
    "export function ProviderCard({ user, className }: ProviderCardProps) {",
    "export function ProviderCard({ user, className }: ProviderCardProps) {\n  const [isReportOpen, setIsReportOpen] = useState(false);\n"
  );
  
  code = code.replace(
    "<div className={cn(\"flex flex-col gap-4\", className)}>",
    "<div className={cn(\"flex flex-col gap-4\", className)}>\n      <ReportModal targetType=\"USER\" targetId={user.id} isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />"
  );
  
  code = code.replace(
    "</div>\n    </div>",
    "</div>\n        <button onClick={() => setIsReportOpen(true)} className=\"mt-2 flex items-center space-x-1 text-xs text-stone-400 hover:text-red-500 transition-colors w-fit\">\n          <Flag className=\"w-3 h-3\" />\n          <span>Report User</span>\n        </button>\n      </div>\n    </div>"
  );

  fs.writeFileSync('src/components/resources/ProviderCard.tsx', code);
  console.log('Fixed ProviderCard.tsx');
}
