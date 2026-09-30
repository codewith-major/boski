const fs = require('fs');
let code = fs.readFileSync('src/pages/ExchangeDetail.tsx', 'utf-8');

if (!code.includes('useModeration')) {
  code = code.replace("import { ResourceType } from '../types';", "import { ResourceType } from '../types';\nimport { useModeration } from '../contexts/ModerationContext';");
  
  code = code.replace(
    "const [confirmDecline, setConfirmDecline] = useState(false);",
    "const [confirmDecline, setConfirmDecline] = useState(false);\n  const { isUserSuspended } = useModeration();\n  const isSuspended = isUserSuspended(currentUser.id) || currentUser.accountStatus === 'SUSPENDED';"
  );
  
  code = code.replace(
    "disabled={exchange.state === 'cancelled' || exchange.state === 'completed'}",
    "disabled={exchange.state === 'cancelled' || exchange.state === 'completed' || isSuspended}"
  );
  
  fs.writeFileSync('src/pages/ExchangeDetail.tsx', code);
  console.log('Fixed ExchangeDetail.tsx');
}
