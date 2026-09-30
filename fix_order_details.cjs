const fs = require('fs');

let content = fs.readFileSync('src/pages/OrderDetail.tsx', 'utf8');

// Fix lowercase status checks
content = content.replace(/order\.status !== 'cancelled'/g, "order.status !== 'CANCELLED'");
content = content.replace(/order\.status !== 'completed'/g, "order.status !== 'COMPLETED'");

// Fix offerType / offerDetails rendering to show Price / Budget
content = content.replace(/<div>\s*<h3 className="text-label text-text-secondary uppercase mb-1">Offer<\/h3>\s*<p className="text-body font-medium capitalize">\s*\{order\.offerType\} \{order\.offerDetails && `- \$\{order\.offerDetails\}`\}\s*<\/p>\s*<\/div>/, 
`<div>
                <h3 className="text-label text-text-secondary uppercase mb-1">Pricing</h3>
                <p className="text-body font-medium">
                  {order.price !== undefined ? \`₦\${order.price} / \${order.pricingUnit || 'fixed'}\` : (resource.budget ? \`₦\${resource.budget}\` : 'N/A')}
                </p>
              </div>`);

// Update renderActions to handle the new flow
const renderActionsOld = `  const renderActions = () => {
    if (order.status === 'REQUESTED' && isProvider) {
      return (
        <div className="flex flex-col gap-3">
          <Button variant="primary" fullWidth size="lg" onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}>
            ACCEPT REQUEST
          </Button>
          <Button variant="tertiary" fullWidth size="lg" onClick={() => updateOrderStatus(order.id, 'DECLINED')}>
            DECLINE
          </Button>
        </div>
      );
    }
    if (order.status === 'ACCEPTED' && isParticipant) {
      return (
        <div className="flex flex-col gap-3">
          <Button variant="primary" fullWidth size="lg" onClick={() => activateOrder(order.id)}>
            MARK AS ACTIVE
          </Button>
          <p className="text-caption text-text-secondary text-center">
            Confirm when the {resource.type === 'SKILL' ? 'session' : 'handover'} has started.
          </p>
        </div>
      );
    }
    if (order.status === 'ACTIVE') {
      return (
        <div className="flex flex-col gap-3">
          <Button variant="primary" fullWidth size="lg" onClick={() => completeOrder(order.id)}>
            {resource.type === 'ITEM' ? 'MARK AS RETURNED' : 'MARK COMPLETE'}
          </Button>
        </div>
      );
    }
    if (order.status === 'COMPLETED') {
      return <RatingForm orderId={order.id} toUserId={otherUser.id} />;
    }
    return null;
  };`;

const renderActionsNew = `  const renderActions = () => {
    if (order.status === 'REQUESTED' && isProvider) {
      return (
        <div className="flex flex-col gap-3">
          <Button variant="primary" fullWidth size="lg" onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}>
            ACCEPT REQUEST
          </Button>
          <Button variant="tertiary" fullWidth size="lg" onClick={() => updateOrderStatus(order.id, 'DECLINED')}>
            DECLINE
          </Button>
        </div>
      );
    }
    if (order.status === 'ACCEPTED' && isCustomer) {
      return (
        <div className="flex flex-col gap-3">
          <Button variant="primary" fullWidth size="lg" onClick={() => updateOrderStatus(order.id, 'PAID')}>
            MAKE PAYMENT
          </Button>
          <p className="text-caption text-text-secondary text-center">
            Secure payment to proceed with the order.
          </p>
        </div>
      );
    }
    if (order.status === 'PAID' && isProvider) {
      return (
        <div className="flex flex-col gap-3">
          <Button variant="primary" fullWidth size="lg" onClick={() => activateOrder(order.id)}>
            MARK AS ACTIVE
          </Button>
          <p className="text-caption text-text-secondary text-center">
            Confirm when the {resource.type === 'SKILL' ? 'session' : 'handover'} has started.
          </p>
        </div>
      );
    }
    if (order.status === 'ACTIVE') {
      return (
        <div className="flex flex-col gap-3">
          <Button variant="primary" fullWidth size="lg" onClick={() => completeOrder(order.id)}>
            {resource.type === 'ITEM' ? 'MARK AS RETURNED' : 'MARK COMPLETE'}
          </Button>
        </div>
      );
    }
    if (order.status === 'COMPLETED') {
      return <RatingForm orderId={order.id} toUserId={otherUser.id} />;
    }
    return null;
  };`;

content = content.replace(renderActionsOld, renderActionsNew);

fs.writeFileSync('src/pages/OrderDetail.tsx', content);

