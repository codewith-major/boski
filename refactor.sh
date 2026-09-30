#!/bin/bash

# We'll use find and sed to replace occurrences.
# This might be tricky because of casing. Let's do case-sensitive where appropriate.

find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/ExchangeContext/OrderContext/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/ExchangeProvider/OrderProvider/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/useExchanges/useOrders/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/ExchangeRequest/Order/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/ExchangeState/OrderStatus/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/ExchangeDetail/OrderDetail/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/AdminExchanges/AdminOrders/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/exchangeId/orderId/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/exchangeTerms//g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/completedExchanges/completedOrders/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/exchange\.state/order.status/g'

# Let's first move some files
mkdir -p src/contexts src/pages/admin src/pages
mv src/contexts/ExchangeContext.tsx src/contexts/OrderContext.tsx 2>/dev/null
mv src/pages/Exchanges.tsx src/pages/Orders.tsx 2>/dev/null
mv src/pages/ExchangeDetail.tsx src/pages/OrderDetail.tsx 2>/dev/null
mv src/pages/admin/AdminExchanges.tsx src/pages/admin/AdminOrders.tsx 2>/dev/null
