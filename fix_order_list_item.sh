#!/bin/bash
cat src/components/order/OrderListItem.tsx | awk '
/import { users, currentUser } from/ {
  print "import { useAuth } from '\''../../contexts/AuthContext'\'';"
  print "import { supabase } from '\''../../lib/supabase'\'';"
  print "import { useState, useEffect } from '\''react'\'';"
  next
}
/export function OrderListItem/ {
  print $0
  print "  const { profile } = useAuth();"
  print "  const [otherUser, setOtherUser] = useState<any>(null);"
  next
}
/const isProvider = order.providerId === currentUser.id;/ {
  print "  const isProvider = order.providerId === profile?.id;"
  next
}
/const otherUser = Object.values/ {
  print "  useEffect(() => {"
  print "    if (otherUserId) {"
  print "      supabase.from(\"profiles\").select(\"*\").eq(\"id\", otherUserId).single().then(({ data }) => {"
  print "        if (data) setOtherUser(data);"
  print "      });"
  print "    }"
  print "  }, [otherUserId]);"
  next
}
/const hasRated = hasRatedOrder\(order.id, currentUser.id\);/ {
  print "  const hasRated = profile ? hasRatedOrder(order.id, profile.id) : false;"
  next
}
/const isUnread = hasUnreadMessages\(order.id, currentUser.id\);/ {
  print "  const isUnread = profile ? hasUnreadMessages(order.id, profile.id) : false;"
  next
}
/{otherUser.name}/ {
  gsub(/{otherUser.name}/, "{otherUser?.name || '\''...'\''}")
  print $0
  next
}
{ print $0 }
' > src/components/order/OrderListItem.tmp.tsx
mv src/components/order/OrderListItem.tmp.tsx src/components/order/OrderListItem.tsx
