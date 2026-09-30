import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Divider } from '../components/ui/Divider';
import { StatusBadge } from '../components/ui/StatusBadge';
import { TrustCard } from '../components/trust/TrustCard';
import { RatingForm } from '../components/trust/RatingForm';
import { OrderTimeline } from '../components/order/OrderTimeline';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useOrders } from '../contexts/OrderContext';
import { useTrust } from '../contexts/TrustContext';
import { useResources } from '../contexts/ResourceContext';
import { useMessages } from '../contexts/MessageContext';
import { MessageList } from '../components/messaging/MessageList';
import { MessageComposer } from '../components/messaging/MessageComposer';
import { ConversationHeader } from '../components/messaging/ConversationHeader';
import { ResourceType } from '../types';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getOrderById, 
    acceptOrder, 
    declineOrder, 
    activateOrder, 
    completeOrder, 
    cancelOrder 
  } = useOrders();
  const { hasRatedOrder } = useTrust();
  const { getResourceById } = useResources();
  const { getMessagesForOrder, sendMessage, markOrderMessagesRead, loadAndSubscribeToOrder } = useMessages();

  const [confirmDecline, setConfirmDecline] = useState(false);

  const { profile } = useAuth();
  const [otherUser, setOtherUser] = useState<any>(null);
  const isSuspended = profile?.accountStatus === "SUSPENDED";

  const order = id ? getOrderById(id) : undefined;
  const resource = order ? getResourceById(order.resourceId) : undefined;

  useEffect(() => {
    if (order) {
      if (profile) markOrderMessagesRead(order.id, profile.id);
      return loadAndSubscribeToOrder(order.id);
    }
  }, [order, markOrderMessagesRead]);

  if (!order || !resource) {
    return (
      <PageContainer>
        <Card className="flex flex-col items-center justify-center p-12 border-dashed bg-transparent text-center gap-6 mt-8">
          <h1 className="text-display">Order Not Found</h1>
          <p className="text-body text-text-secondary max-w-md">
            This order request might have been removed or doesn't exist.
          </p>
          <Button variant="secondary" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </Card>
      </PageContainer>
    );
  }

  const isProvider = profile?.id === order.providerId;
  const isCustomer = profile?.id === order.customerId;
  const isParticipant = isProvider || isCustomer;

  if (!isParticipant) {
    return (
      <PageContainer>
        <Card className="flex flex-col items-center justify-center p-12 border-dashed bg-transparent text-center gap-6 mt-8">
          <h1 className="text-display text-error">Unauthorized</h1>
          <p className="text-body text-text-secondary max-w-md">
            You do not have permission to view this order.
          </p>
          <Button variant="secondary" onClick={() => navigate('/home')}>
            Return Home
          </Button>
        </Card>
      </PageContainer>
    );
  }
  
  // To show the "other" person in the order
  const otherUserId = isProvider ? order.customerId : order.providerId;
  // Get other user from our mock map (since it's a small app, this works. In reality, would be fetched)
  useEffect(() => {
    if (otherUserId) {
      supabase.from("profiles").select("*").eq("id", otherUserId).single().then(({ data }) => {
        if (data) setOtherUser(data);
      });
    }
  }, [otherUserId]);

  const getRoleLabel = () => {
    if (isProvider) {
      return resource.intent === 'NEED' ? 'Offered By' : 'Requested By';
    } else {
      return resource.intent === 'NEED' ? 'Requested By' : 'Provided By';
    }
  };

  const handleDeclineConfirm = () => {
    declineOrder(order.id);
    setConfirmDecline(false);
  };

  const renderActions = () => {
    if (order.status === 'REQUESTED') {
      if (isProvider) {
        if (confirmDecline) {
          return (
            <div className="flex flex-col gap-4 p-4 border border-border-subtle rounded-md bg-surface-subtle">
              <p className="text-body-sm font-medium">Decline this request?</p>
              <p className="text-caption text-text-secondary">
                {otherUser?.name} will be notified that you can't complete this order.
              </p>
              <div className="flex gap-3 mt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setConfirmDecline(false)}>
                  KEEP REQUEST
                </Button>
                <Button variant="tertiary" className="flex-1 text-error" onClick={handleDeclineConfirm}>
                  DECLINE
                </Button>
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-3">
            <Button variant="primary" fullWidth size="lg" onClick={() => acceptOrder(order.id)}>
              ACCEPT
            </Button>
            <Button variant="tertiary" fullWidth onClick={() => setConfirmDecline(true)}>
              DECLINE
            </Button>
          </div>
        );
      } else if (isCustomer) {
        return (
          <div className="flex flex-col gap-3">
            <Button variant="tertiary" fullWidth onClick={() => cancelOrder(order.id)}>
              CANCEL REQUEST
            </Button>
          </div>
        );
      }
    }

    if (order.status === 'ACCEPTED') {
      const getActionLabel = () => {
        if (resource.type === 'ITEM') return 'CONFIRM HANDOVER';
        if (resource.type === 'SKILL') return 'START SESSION';
        return 'START TASK';
      };

      const getActionDescription = () => {
        if (resource.type === 'ITEM') return 'Confirm when the item has been handed over.';
        if (resource.type === 'SKILL') return 'Confirm when the session has started.';
        return 'Confirm when the task has started.';
      };

      return (
        <div className="flex flex-col gap-3">
          <Button variant="primary" fullWidth size="lg" onClick={() => activateOrder(order.id)}>
            {getActionLabel()}
          </Button>
          <p className="text-caption text-text-secondary text-center">
            {getActionDescription()}
          </p>
        </div>
      );
    }

    if (order.status === 'PAID') {
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
  };

  const getBadgeVariant = (type: ResourceType) => {
    switch (type) {
      case 'ITEM': return 'neutral';
      case 'SKILL': return 'accent';
       return 'outline';
      default: return 'neutral';
    }
  };

  return (
    <PageContainer className="flex flex-col gap-6 md:gap-8 max-w-5xl mx-auto">
      <div>
        <Button variant="tertiary" size="sm" onClick={() => navigate('/orders')} className="px-0 hover:bg-transparent">
          ← Back to Orders
        </Button>
      </div>

      <div className="boski-grid">
        {/* Left Column: Details */}
        <div className="col-span-4 md:col-span-5 lg:col-span-8 flex flex-col gap-8">
          <header className="flex flex-col items-start gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getBadgeVariant(resource.type)} className="uppercase">
                {resource.type}
              </Badge>
              <span className="text-border-subtle">•</span>
              <StatusBadge status={order.status} />
            </div>
            
            <h1 className="text-h1">{resource.title}</h1>
            
            <p className="text-body-sm text-text-secondary">
              Requested on {new Date(order.requestedAt).toLocaleDateString()}
            </p>
          </header>

          <Divider className="my-0" />

          {/* Order Terms & Data */}
          <section className="flex flex-col gap-6">
            <h2 className="text-h4">Order Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              {order.startDate && (
                <div>
                  <h3 className="text-label text-text-secondary uppercase mb-1">Start Date</h3>
                  <p className="text-body font-medium">{order.startDate}</p>
                </div>
              )}
              {order.endDate && (
                <div>
                  <h3 className="text-label text-text-secondary uppercase mb-1">Return Date</h3>
                  <p className="text-body font-medium">{order.endDate}</p>
                </div>
              )}
              {order.timing && (
                <div>
                  <h3 className="text-label text-text-secondary uppercase mb-1">Timing</h3>
                  <p className="text-body font-medium">{order.timing}</p>
                </div>
              )}
              <div>
                <h3 className="text-label text-text-secondary uppercase mb-1">Pricing</h3>
                <p className="text-body font-medium">
                  {order.price !== undefined ? `₦${order.price} / ${order.pricingUnit || 'fixed'}` : (resource.budget ? `₦${resource.budget}` : 'N/A')}
                </p>
              </div>
            </div>

            {order.message && (
              <div className="mt-2">
                <h3 className="text-label text-text-secondary uppercase mb-2">Message</h3>
                <div className="bg-surface-subtle border border-border-subtle p-4 rounded-md">
                  <p className="text-body-sm whitespace-pre-wrap">{order.message}</p>
                </div>
              </div>
            )}
          </section>

          <Divider className="my-0" />

          {/* Role Aware Prompts */}
          <section className="flex flex-col gap-4">
            {order.status === 'REQUESTED' && isProvider && (
              <p className="text-body-sm text-text-secondary">
                Review the request details above. {otherUser?.name} is waiting for your response.
              </p>
            )}
            {order.status === 'REQUESTED' && isCustomer && (
              <p className="text-body-sm text-text-secondary">
                You've sent this request. Waiting for {otherUser?.name} to respond.
              </p>
            )}
            {order.status === 'ACCEPTED' && (
              <div className="bg-accent/10 border border-accent/20 p-5 rounded-md flex flex-col gap-2">
                <h3 className="text-h4">Order Accepted</h3>
                <p className="text-body-sm text-text-primary">
                  Order accepted! Message each other to arrange the exchange or session. When you're ready, mark the order as active.
                </p>
                <p className="text-caption text-text-secondary border-t border-accent/20 pt-2 mt-1">
                  Boski is free to use. Boski does not process payments. Any agreed payment is settled directly between the customer and provider.
                </p>
              </div>
            )}
            {order.status === 'PAID' && (
              <div className="bg-surface-subtle border border-border-subtle p-5 rounded-md flex flex-col gap-2">
                <h3 className="text-h4">Order In Preparation</h3>
                <p className="text-body-sm">
                  Arrange the handover or session with {otherUser?.name}. 
                  Once ready, mark this order as active below.
                </p>
              </div>
            )}
            {order.status === 'ACTIVE' && (
              <div className="bg-success/10 border border-success/20 p-5 rounded-md">
                <h3 className="text-h4 mb-2">Active Order</h3>
                <p className="text-body-sm">
                  This order is currently active. Please remember to mark it as complete when finished.
                </p>
              </div>
            )}
            {order.status === 'COMPLETED' && (
              <div className="bg-surface-subtle border border-border-subtle p-5 rounded-md flex items-center justify-between">
                <div>
                  <h3 className="text-h4 mb-1">Order Complete ✓</h3>
                  <p className="text-body-sm text-text-secondary">
                    This exchange is complete.
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <Button variant="tertiary" size="sm" onClick={() => {}} className="px-0 text-text-secondary hover:text-text-primary hover:bg-transparent">
                Report a problem
              </Button>
            </div>
          </section>

          <Divider className="my-0" />

          {/* Messaging Section */}
          <section className="flex flex-col gap-6" id="messages">
            <h2 className="text-h4 uppercase tracking-widest text-text-secondary">Messages</h2>
            <Card className="flex flex-col h-[500px] overflow-hidden p-0 border-border-subtle bg-surface">
              <div className="p-4 sm:p-6 bg-surface-subtle">
                {otherUser && <ConversationHeader otherUser={otherUser} resource={resource} />}
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <MessageList messages={getMessagesForOrder(order.id)} />
              </div>
              <div className="p-4 sm:p-6 border-t border-border-subtle bg-surface-subtle flex flex-col gap-3">
                {(order.status === 'DECLINED' || order.status === 'CANCELLED' || order.status === 'COMPLETED' || isSuspended) && (
                  <div className="p-3 bg-surface border border-border-subtle rounded-md text-caption text-text-secondary">
                    {isSuspended
                      ? "Messaging is unavailable because your account is suspended."
                      : order.status === 'DECLINED'
                      ? "Messaging is closed because this order was declined."
                      : order.status === 'CANCELLED'
                      ? "Messaging is closed because this order was cancelled."
                      : "Messaging is closed because this order is complete."}
                  </div>
                )}
                <MessageComposer 
                  onSend={async (body) => {
                    if (profile) await sendMessage(order.id, profile.id, body);
                  }}
                  disabled={order.status === 'DECLINED' || order.status === 'CANCELLED' || order.status === 'COMPLETED' || isSuspended}
                />
              </div>
            </Card>
          </section>
        </div>

        {/* Right Column: Trust, Timeline, Actions */}
        <div className="col-span-4 md:col-span-3 lg:col-span-4 flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="text-label text-text-secondary uppercase tracking-widest mb-6">
              {getRoleLabel()}
            </h2>
            {otherUser && <TrustCard user={otherUser} className="p-0 bg-transparent shadow-none" />}
          </Card>

          <Card className="p-6">
            <h2 className="text-label text-text-secondary uppercase tracking-widest mb-6">
              Timeline
            </h2>
            <OrderTimeline currentState={order.status} />
          </Card>
          
          {(order.status !== 'CANCELLED' && order.status !== 'COMPLETED') && (
            <Card className="p-6">
              <h2 className="text-label text-text-secondary uppercase tracking-widest mb-6">
                Action
              </h2>
              {renderActions()}
            </Card>
          )}

          {order.status === 'COMPLETED' && (
             <div className="flex flex-col gap-6 mt-2">
               {renderActions()}
             </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
