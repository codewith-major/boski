const fs = require('fs');

function replaceAll(file, search, replace) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(search).join(replace);
    fs.writeFileSync(file, content);
}

replaceAll('src/components/activity/ActivityItem.tsx', '`/order/${', '`/orders/${');
replaceAll('src/components/order/OrderListItem.tsx', '`/order/${', '`/orders/${');
replaceAll('src/pages/admin/AdminOrders.tsx', '`/order/${', '`/orders/${');
replaceAll('src/App.tsx', 'path="/order/:id"', 'path="/orders/:id"');

