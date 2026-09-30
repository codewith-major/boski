const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if(!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // replacements
    let oldContent = content;
    
    content = content.split('requesterId').join('customerId');
    content = content.split('ExchangeListItem').join('OrderListItem');
    content = content.split('ExchangeTimeline').join('OrderTimeline');
    content = content.split('ExchangeState').join('OrderStatus');
    content = content.split('ExchangeRequest').join('Order');
    content = content.split('updateExchangeStatus').join('updateOrderStatus');
    content = content.split('useExchanges').join('useOrders');
    content = content.split('hasRatedExchange').join('hasRatedOrder');
    content = content.split('markExchangeMessagesRead').join('markOrderMessagesRead');
    content = content.split('hasUnreadExchangeMessages').join('hasUnreadOrderMessages');
    content = content.split('getExchangeById').join('getOrderById');
    content = content.split('getExchangesForResource').join('getOrdersForResource');
    content = content.split('exchange.state').join('exchange.status');
    content = content.split('exchangeId').join('orderId');
    content = content.split('exchanges').join('orders');
    content = content.split('Exchanges').join('Orders');
    content = content.split('exchange').join('order');
    content = content.split('Exchange').join('Order');
    content = content.split('order_REQUEST_RECEIVED').join('ORDER_REQUEST_RECEIVED');
    content = content.split('order_REQUEST_ACCEPTED').join('ORDER_REQUEST_ACCEPTED');
    content = content.split('order_REQUEST_DECLINED').join('ORDER_REQUEST_DECLINED');
    content = content.split('NEW_order_MESSAGE').join('NEW_ORDER_MESSAGE');
    content = content.split('order_STARTED').join('ORDER_STARTED');
    content = content.split('order_COMPLETED').join('ORDER_COMPLETED');
    
    if (content !== oldContent) {
        fs.writeFileSync(filePath, content);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            replaceInFile(fullPath);
        }
    }
}

walkDir('src');
