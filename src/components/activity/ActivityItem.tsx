import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from '../../types';
import { useActivity } from '../../contexts/ActivityContext';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { Users, BookOpen, MessageSquare, Star, ArrowRightLeft } from 'lucide-react';

export interface ActivityItemProps {
  activity: Activity;
  key?: React.Key;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const navigate = useNavigate();
  const { markAsRead } = useActivity();

  const isUnread = !activity.readAt;

  const handleClick = () => {
    if (isUnread) markAsRead(activity.id);

    if (activity.orderId && activity.type !== 'RESOURCE_REQUESTED') {
      navigate(`/orders/${activity.orderId}`);
    } else if (activity.resourceId) {
      navigate(`/resource/${activity.resourceId}`);
    } else if (activity.ratingId) {
      navigate('/profile');
    }
  };

  const getIcon = () => {
    switch (activity.type) {
      case 'ORDER_REQUEST_RECEIVED':
      case 'ORDER_REQUEST_ACCEPTED':
      case 'ORDER_REQUEST_DECLINED':
      case 'ORDER_STARTED':
      case 'ORDER_COMPLETED':
        return <ArrowRightLeft className="w-5 h-5" />;
      case 'NEW_ORDER_MESSAGE':
        return <MessageSquare className="w-5 h-5" />;
      case 'RATING_RECEIVED':
        return <Star className="w-5 h-5" />;
      case 'RESOURCE_REQUESTED':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const timeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000); // mins
    if (diff < 60) return `${diff}m ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Card 
      onClick={handleClick}
      className={cn(
        "flex items-start gap-4 p-4 cursor-pointer transition-colors border-l-4",
        isUnread ? "bg-surface-subtle border-l-accent" : "bg-transparent border-l-transparent hover:bg-surface-subtle/50 border",
        isUnread && "shadow-sm"
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full",
        isUnread ? "bg-accent/10 text-accent" : "bg-surface-subtle text-text-muted"
      )}>
        {getIcon()}
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-2">
          <span className={cn("text-body-sm truncate", isUnread ? "font-bold text-text-primary" : "text-text-primary")}>
            {activity.title}
          </span>
          <span className="text-caption text-text-muted whitespace-nowrap">
            {timeAgo(activity.createdAt)}
          </span>
        </div>
        
        {activity.description && (
          <p className="text-caption text-text-secondary mt-1 line-clamp-2">
            {activity.description}
          </p>
        )}
      </div>
    </Card>
  );
}
