import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../types';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import { useTrust } from '../../contexts/TrustContext';
import { useResources } from '../../contexts/ResourceContext';
import { useMessages } from '../../contexts/MessageContext';
import { UnreadIndicator } from '../messaging/UnreadIndicator';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface OrderListItemProps {
  order: Order;
  className?: string;
  key?: React.Key;
}

export function OrderListItem({ order, className, ...props }: OrderListItemProps) {
  const { profile } = useAuth();
  const [otherUser, setOtherUser] = useState<any>(null);
  const navigate = useNavigate();
  const { hasRatedOrder } = useTrust();
  const { getResourceById } = useResources();
  const { hasUnreadMessages } = useMessages();

  // Normally this would be populated from the backend. 
  // We'll look it up in ResourceContext for now.
  const resource = getResourceById(order.resourceId);

  if (!resource) return null;

  const isProvider = order.providerId === profile?.id;
  const otherUserId = isProvider ? order.customerId : order.providerId;
  useEffect(() => {
    if (otherUserId) {
      supabase.from("profiles").select("*").eq("id", otherUserId).single().then(({ data }) => {
        if (data) setOtherUser(data);
      });
    }
  }, [otherUserId]);

  const hasRated = profile ? hasRatedOrder(order.id, profile.id) : false;
  const isUnread = profile ? hasUnreadMessages(order.id, profile.id) : false;

  let nextActionLabel = 'Updates available';
  if (order.status === 'REQUESTED') {
    nextActionLabel = isProvider ? 'Review request' : 'Waiting for response';
  } else if (order.status === 'COMPLETED') {
    nextActionLabel = hasRated ? 'Reviewed ✓' : 'Review';
  }

  return (
    <Card className={cn("p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between", className)} {...props}>
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          {isUnread && <UnreadIndicator />}
          <span className="text-caption text-text-secondary">
            {new Date(order.requestedAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-h4">{resource.title}</h3>
        <p className="text-body-sm text-text-secondary">
          with <span className="font-bold text-text-primary">{otherUser?.name || '...'}</span>
        </p>
      </div>

      <div className="flex flex-col sm:items-end gap-2 shrink-0">
        <p className="text-caption text-text-secondary">
          {nextActionLabel}
        </p>
        <Button variant="secondary" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
          View Details
        </Button>
      </div>
    </Card>
  );
}
