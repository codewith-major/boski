import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { useActivity } from '../contexts/ActivityContext';
import { ActivityItem } from '../components/activity/ActivityItem';

export default function Activity() {
  const { activities, unreadCount, markAllAsRead } = useActivity();

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <PageHeader 
          title="Activity" 
          description="Updates on your orders and resources." 
        />
        {unreadCount > 0 && (
          <Button variant="tertiary" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {activities.length === 0 ? (
          <div className="bg-surface-subtle border border-dashed border-border-subtle rounded-xl p-8 text-center mt-4">
            <p className="text-body text-text-secondary">No recent activity.</p>
          </div>
        ) : (
          activities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </PageContainer>
  );
}
