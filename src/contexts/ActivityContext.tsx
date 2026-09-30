import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { Activity, ActivityType } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ActivityContextType {
  activities: Activity[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  const fetchActivities = useCallback(async () => {
    if (!profile) {
      setActivities([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setActivities(
          data.map((a) => ({
            id: a.id,
            userId: a.user_id,
            type: a.type as ActivityType,
            actorId: a.actor_id || undefined,
            resourceId: a.listing_id || undefined,
            orderId: a.order_id || undefined,
            messageId: a.message_id || undefined,
            ratingId: a.rating_id || undefined,
            title: a.title,
            description: a.description || undefined,
            readAt: a.read_at || undefined,
            createdAt: a.created_at,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  }, [profile]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const unreadCount = useMemo(() => {
    return activities.filter((a) => !a.readAt).length;
  }, [activities]);

  const markAsRead = async (id: string) => {
    if (!profile) return;
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('activities')
        .update({ read_at: now })
        .eq('id', id)
        .eq('user_id', profile.id);

      if (error) throw error;

      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, readAt: now } : a))
      );
    } catch (err) {
      console.error('Error marking activity as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!profile) return;
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('activities')
        .update({ read_at: now })
        .eq('user_id', profile.id)
        .is('read_at', null);

      if (error) throw error;

      setActivities((prev) =>
        prev.map((a) => (!a.readAt ? { ...a, readAt: now } : a))
      );
    } catch (err) {
      console.error('Error marking all activities as read:', err);
    }
  };

  const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: activityData.userId,
          type: activityData.type,
          actor_id: activityData.actorId,
          listing_id: activityData.resourceId,
          order_id: activityData.orderId,
          message_id: activityData.messageId,
          rating_id: activityData.ratingId,
          title: activityData.title,
          description: activityData.description,
        })
        .select()
        .single();

      if (error) throw error;

      if (data && profile && data.user_id === profile.id) {
        const newActivity: Activity = {
          id: data.id,
          userId: data.user_id,
          type: data.type as ActivityType,
          actorId: data.actor_id || undefined,
          resourceId: data.listing_id || undefined,
          orderId: data.order_id || undefined,
          messageId: data.message_id || undefined,
          ratingId: data.rating_id || undefined,
          title: data.title,
          description: data.description || undefined,
          readAt: data.read_at || undefined,
          createdAt: data.created_at,
        };
        setActivities((prev) => [newActivity, ...prev]);
      }
    } catch (err) {
      console.error('Error adding activity:', err);
    }
  };

  return (
    <ActivityContext.Provider
      value={{
        activities,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addActivity,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
