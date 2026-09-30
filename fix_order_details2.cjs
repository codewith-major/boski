const fs = require('fs');
let content = fs.readFileSync('src/pages/OrderDetail.tsx', 'utf8');

content = content.replace(
`            {order.status === 'ACCEPTED' && (
              <div className="bg-accent/10 border border-accent/20 p-5 rounded-md">
                <h3 className="text-h4 mb-2">Order Accepted</h3>
                <p className="text-body-sm">
                  Arrange the handover or session with {otherUser.name}. 
                  Once ready, mark this order as active below.
                </p>
              </div>
            )}`,
`            {order.status === 'ACCEPTED' && isCustomer && (
              <div className="bg-accent/10 border border-accent/20 p-5 rounded-md">
                <h3 className="text-h4 mb-2">Order Accepted</h3>
                <p className="text-body-sm">
                  {otherUser.name} accepted your request. Please proceed to payment to confirm the order.
                </p>
              </div>
            )}
            {order.status === 'ACCEPTED' && isProvider && (
              <div className="bg-accent/10 border border-accent/20 p-5 rounded-md">
                <h3 className="text-h4 mb-2">Awaiting Payment</h3>
                <p className="text-body-sm">
                  Waiting for {otherUser.name} to complete payment.
                </p>
              </div>
            )}
            {order.status === 'PAID' && (
              <div className="bg-success/10 border border-success/20 p-5 rounded-md">
                <h3 className="text-h4 mb-2">Payment Secured</h3>
                <p className="text-body-sm">
                  Arrange the handover or session with {otherUser.name}. 
                  Once ready, mark this order as active below.
                </p>
              </div>
            )}`
);

fs.writeFileSync('src/pages/OrderDetail.tsx', content);

