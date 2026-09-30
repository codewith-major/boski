import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { OrderListItem } from '../components/order/OrderListItem';
import { useOrders } from '../contexts/OrderContext';

export default function Orders() {
  const { orders } = useOrders();

  const pendingOrders = orders.filter(ex => ex.status === 'REQUESTED');
  const activeOrders = orders.filter(ex => ex.status === 'ACCEPTED' || ex.status === 'ACTIVE');
  const completedOrders = orders.filter(ex => ex.status === 'COMPLETED' || ex.status === 'CANCELLED');

  return (
    <PageContainer className="flex flex-col gap-10">
      <PageHeader 
        title="Orders" 
        description="Manage your requests and active orders." 
      />
      
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border-subtle rounded-lg bg-surface-subtle text-center gap-4">
          <h3 className="text-h3">No Orders Yet</h3>
          <p className="text-body text-text-secondary max-w-sm">
            You haven't requested or offered any resources yet. Head over to Explore to find what you need.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {pendingOrders.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-label text-text-secondary uppercase tracking-widest">Pending</h2>
              <div className="flex flex-col gap-3">
                {pendingOrders.map(ex => (
                  <OrderListItem key={ex.id} order={ex} />
                ))}
              </div>
            </section>
          )}

          {activeOrders.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-label text-text-secondary uppercase tracking-widest">Active</h2>
              <div className="flex flex-col gap-3">
                {activeOrders.map(ex => (
                  <OrderListItem key={ex.id} order={ex} />
                ))}
              </div>
            </section>
          )}

          {completedOrders.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-label text-text-secondary uppercase tracking-widest">Past</h2>
              <div className="flex flex-col gap-3">
                {completedOrders.map(ex => (
                  <OrderListItem key={ex.id} order={ex} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
