const fs = require('fs');

function replaceInFile(path, oldStr, newStr) {
    if(fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');
        content = content.split(oldStr).join(newStr);
        fs.writeFileSync(path, content);
    }
}

replaceInFile('src/contexts/OrderContext.tsx', 'INITIAL_EXCHANGES', 'INITIAL_ORDERS');
replaceInFile('src/contexts/OrderContext.tsx', 'ExchangeContext', 'OrderContext');
replaceInFile('src/contexts/OrderContext.tsx', 'ExchangeProvider', 'OrderProvider');
replaceInFile('src/contexts/OrderContext.tsx', 'ExchangeContextType', 'OrderContextType');
replaceInFile('src/contexts/OrderContext.tsx', 'ExchangeRequest', 'Order');
replaceInFile('src/contexts/OrderContext.tsx', 'requesterId', 'customerId');
replaceInFile('src/contexts/OrderContext.tsx', 'exchange.state', 'order.status');
replaceInFile('src/contexts/OrderContext.tsx', 'setExchanges', 'setOrders');
replaceInFile('src/contexts/OrderContext.tsx', 'exchanges', 'orders');
replaceInFile('src/contexts/OrderContext.tsx', 'updateExchangeStatus', 'updateOrderStatus');
replaceInFile('src/contexts/OrderContext.tsx', 'exchangeId', 'orderId');
replaceInFile('src/contexts/OrderContext.tsx', 'createExchangeRequest', 'createOrderRequest');
replaceInFile('src/contexts/OrderContext.tsx', 'const updateOrderStatus = (id: string, state: OrderStatus) =>', 'const updateOrderStatus = (id: string, status: OrderStatus) =>');
replaceInFile('src/contexts/OrderContext.tsx', '...ex, state', '...ex, status');

replaceInFile('src/contexts/MessageContext.tsx', 'ExchangeMessage', 'OrderMessage');

replaceInFile('src/App.tsx', 'ExchangeProvider', 'OrderProvider');
replaceInFile('src/App.tsx', './contexts/ExchangeContext', './contexts/OrderContext');
replaceInFile('src/App.tsx', 'ExchangeDetail', 'OrderDetail');
replaceInFile('src/App.tsx', 'Exchanges', 'Orders');
replaceInFile('src/App.tsx', './pages/Exchanges', './pages/Orders');
replaceInFile('src/App.tsx', './pages/ExchangeDetail', './pages/OrderDetail');
replaceInFile('src/App.tsx', 'path="/exchanges"', 'path="/orders"');
replaceInFile('src/App.tsx', 'path="/exchange/:id"', 'path="/order/:id"');
replaceInFile('src/App.tsx', 'AdminExchanges', 'AdminOrders');

