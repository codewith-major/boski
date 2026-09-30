#!/bin/bash
sed -i 's/const { isUserSuspended } = useModeration();/const { profile } = useAuth();\n  const [otherUser, setOtherUser] = useState<any>(null);\n  const { isUserSuspended } = useModeration();/g' src/pages/OrderDetail.tsx
