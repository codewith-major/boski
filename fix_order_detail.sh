#!/bin/bash
cat src/pages/OrderDetail.tsx | awk '
/const { isUserSuspended } = useModeration();/ {
  print "  const { profile } = useAuth();"
  print "  const [otherUser, setOtherUser] = useState<any>(null);"
  print $0
  next
}
/const isSuspended = isUserSuspended\(currentUser.id\)/ {
  print "  const isSuspended = profile ? (isUserSuspended(profile.id) || profile.accountStatus === \"SUSPENDED\") : false;"
  next
}
/markOrderMessagesRead\(order.id, currentUser.id\);/ {
  print "      if (profile) markOrderMessagesRead(order.id, profile.id);"
  print "      return loadAndSubscribeToOrder(order.id);"
  next
}
/const isProvider = currentUser.id === order.providerId;/ {
  print "  const isProvider = profile?.id === order.providerId;"
  next
}
/const isCustomer = currentUser.id === order.customerId;/ {
  print "  const isCustomer = profile?.id === order.customerId;"
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
/<ConversationHeader otherUser={otherUser} resource={resource} \/>/ {
  print "                {otherUser && <ConversationHeader otherUser={otherUser} resource={resource} />}"
  next
}
/sendMessage\(order.id, currentUser.id, body\)/ {
  print "                  onSend={(body) => profile && sendMessage(order.id, profile.id, body)}"
  next
}
/<TrustCard user={otherUser}/ {
  print "            {otherUser && <TrustCard user={otherUser} className=\"p-0 bg-transparent shadow-none\" />}"
  next
}
/{otherUser.name}/ {
  gsub(/{otherUser.name}/, "{otherUser?.name}")
  print $0
  next
}
{ print $0 }
' > src/pages/OrderDetail.tmp.tsx
mv src/pages/OrderDetail.tmp.tsx src/pages/OrderDetail.tsx
