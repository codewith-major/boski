import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';
import { Rating } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface UserReputation {
  averageRating: number | null;
  totalRatings: number;
  completedOrders: number;
  completionRate: number | null;
  isLoading?: boolean;
}

interface TrustContextType {
  submitRating: (rating: Omit<Rating, 'id' | 'createdAt'>) => Promise<void>;
  getUserReputation: (userId: string) => UserReputation;
  hasRatedOrder: (orderId: string, fromUserId: string) => boolean;
  getRatingForOrder: (orderId: string, fromUserId: string) => Rating | undefined;
}

const TrustContext = createContext<TrustContextType | undefined>(undefined);

// Adapt DB to frontend model
function adaptRowToRating(row: any): Rating {
  return {
    id: row.id,
    orderId: row.order_id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    score: row.score,
    feedback: row.feedback,
    createdAt: row.created_at
  };
}

export function TrustProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  
  // Track ratings given by current user to quickly answer `hasRatedOrder` synchronously.
  const [givenRatings, setGivenRatings] = useState<Rating[]>([]);
  
  // Cache user reputations
  const [reputations, setReputations] = useState<Record<string, UserReputation>>({});
  
  // Track inflight requests to avoid spamming
  const fetchingReputations = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (profile) {
      supabase.from('ratings').select('*').eq('from_user_id', profile.id).then(({ data }) => {
        if (data) {
          setGivenRatings(data.map(adaptRowToRating));
        }
      });
    } else {
      setGivenRatings([]);
    }
  }, [profile]);

  const submitRating = async (ratingData: Omit<Rating, 'id' | 'createdAt'>) => {
    if (!profile) throw new Error("Must be logged in to rate");
    if (hasRatedOrder(ratingData.orderId, profile.id)) return;
    
    try {
      const { data, error } = await supabase.from('ratings').insert({
        order_id: ratingData.orderId,
        from_user_id: profile.id, // Always use auth profile ID for security
        to_user_id: ratingData.toUserId,
        score: ratingData.score,
        feedback: ratingData.feedback || null
      }).select().single();
      
      if (error) throw error;
      
      if (data) {
        const newRating = adaptRowToRating(data);
        setGivenRatings(prev => [...prev, newRating]);
        
        // Invalidate reputation cache for the rated user so it refreshes next time it's requested
        setReputations(prev => {
          const updated = { ...prev };
          delete updated[ratingData.toUserId];
          return updated;
        });
        fetchingReputations.current.delete(ratingData.toUserId);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      throw error;
    }
  };

  const fetchReputation = useCallback(async (userId: string) => {
    try {
      // 1. Fetch ratings received
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('score')
        .eq('to_user_id', userId);
        
      if (ratingsError) throw ratingsError;

      let totalRatings = 0;
      let sumScore = 0;
      
      if (ratingsData) {
        totalRatings = ratingsData.length;
        sumScore = ratingsData.reduce((acc, row) => acc + row.score, 0);
      }

      const averageRating = totalRatings > 0 ? Number((sumScore / totalRatings).toFixed(1)) : null;

      // 2. Fetch completed orders count
      const { count: completedCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .or(`customer_id.eq.${userId},provider_id.eq.${userId}`)
        .in('status', ['COMPLETED', 'RETURNED']); // Or whatever the valid completion statuses are
        
      if (ordersError) throw ordersError;

      setReputations(prev => ({
        ...prev,
        [userId]: {
          averageRating,
          totalRatings,
          completedOrders: completedCount || 0,
          completionRate: null, // Simplified
          isLoading: false
        }
      }));
    } catch (err) {
      console.error("Error fetching reputation:", err);
    } finally {
      fetchingReputations.current.delete(userId);
    }
  }, []);

  const hasRatedOrder = (orderId: string, fromUserId: string) => {
    if (profile && fromUserId === profile.id) {
      return givenRatings.some(r => r.orderId === orderId);
    }
    return false; 
  };

  const getRatingForOrder = (orderId: string, fromUserId: string) => {
    if (profile && fromUserId === profile.id) {
      return givenRatings.find(r => r.orderId === orderId);
    }
    return undefined;
  };

  const getUserReputation = (userId: string): UserReputation => {
    if (reputations[userId]) {
      return reputations[userId];
    }
    
    // Fire and forget fetch
    if (!fetchingReputations.current.has(userId)) {
      fetchingReputations.current.add(userId);
      fetchReputation(userId);
    }
    
    // Return loading placeholder
    return {
      averageRating: null,
      totalRatings: 0,
      completedOrders: 0,
      completionRate: null,
      isLoading: true
    };
  };

  return (
    <TrustContext.Provider value={{
      submitRating,
      getUserReputation,
      hasRatedOrder,
      getRatingForOrder
    }}>
      {children}
    </TrustContext.Provider>
  );
}

export function useTrust() {
  const context = useContext(TrustContext);
  if (context === undefined) {
    throw new Error('useTrust must be used within a TrustProvider');
  }
  return context;
}
