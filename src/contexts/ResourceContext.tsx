import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Resource, User, ResourceType, VerificationStatus, AccountStatus, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ResourceContextType {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  addResource: (resource: any) => Promise<{ success: boolean; error?: any }>;
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  getResourceById: (id: string) => Resource | undefined;
  getUserResources: (userId: string) => Resource[];
  refreshResources: () => Promise<void>;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

function adaptListingToResource(row: any): Resource {
  const profile = row.profiles || {};
  
  const provider: User = {
    id: profile.id || row.owner_id,
    name: profile.display_name || 'Unknown User',
    initials: (profile.display_name || 'U').substring(0, 2).toUpperCase(),
    isVerified: profile.verification_status === 'VERIFIED',
    verificationStatus: (profile.verification_status as VerificationStatus) || 'UNVERIFIED',
    accountStatus: (profile.account_status as AccountStatus) || 'ACTIVE',
    role: (profile.role as UserRole) || 'STUDENT',
    avatarUrl: profile.avatar_url,
    rating: 0,
    totalRatings: 0,
    completedOrders: 0,
    completionRate: 100
  };

  return {
    id: row.id,
    type: row.type as ResourceType,
    intent: row.intent as 'HAVE' | 'NEED',
    title: row.title,
    description: row.description,
    provider,
    status: row.status as 'available' | 'unavailable' | 'active',
    createdAt: row.created_at,
    imageUrl: row.image_url,
    location: row.location,
    category: row.category,
    condition: row.condition,
    availability: row.availability,
    price: row.price,
    currency: row.currency || 'NGN',
    pricingUnit: row.pricing_unit,
    budget: row.budget
  };
}

export function ResourceProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let { data, error: fetchError } = await supabase
        .from('listings')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });
        
      // PGRST303 indicates "JWT issued at future" caused by client-server clock skew or stale auth session.
      // In this case, refresh/recover the session or wait briefly for clock skew to pass and retry.
      if (fetchError && (fetchError.code === 'PGRST303' || fetchError.message?.includes('JWT issued at future'))) {
        console.warn('Clock skew or JWT issued in future detected (PGRST303). Attempting session refresh & retry...');
        try {
          await supabase.auth.refreshSession();
        } catch (refreshErr) {
          // If refresh fails, try signing out to clear invalid clock token
          await supabase.auth.signOut({ scope: 'local' });
        }
        // Small delay to allow clock skew buffer (usually 1-2 seconds)
        await new Promise((res) => setTimeout(res, 1200));

        const retryResult = await supabase
          .from('listings')
          .select('*, profiles(*)')
          .order('created_at', { ascending: false });
        data = retryResult.data;
        fetchError = retryResult.error;
      }

      if (fetchError) throw fetchError;
      
      if (data) {
        setResources(data.map(adaptListingToResource));
      }
    } catch (err: any) {
      console.error("Error fetching listings:", err);
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const addResource = async (resource: any) => {
    if (!profile) {
      console.error("Must be logged in to post");
      return { success: false, error: new Error("Must be logged in to post") };
    }
    
    const intent = (resource.intent === 'offer' || resource.intent === 'HAVE') ? 'HAVE' : 'NEED';
    
    try {
      // 1. Confirm authenticated user session
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || profile.id;

      if (!session?.user) {
        throw new Error("Your session has expired. Please sign in again to post a listing.");
      }

      // 2. Call the secure RPC to ensure profile exists with safe STUDENT defaults
      const displayName = profile.name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User';
      const { error: rpcError } = await supabase.rpc('ensure_user_profile', {
        user_display_name: displayName
      });

      if (rpcError) {
        console.error("Failed to ensure profile via RPC:", rpcError);
        throw new Error("Unable to set up your user profile for listing creation: " + rpcError.message);
      }

      // 3. Insert the listing with the verified owner_id
      const { data, error: insertError } = await supabase.from('listings').insert({
        owner_id: currentUserId,
        intent,
        type: resource.type,
        title: resource.title,
        description: resource.description,
        category: resource.category,
        price: resource.price,
        currency: resource.currency || 'NGN',
        pricing_unit: resource.pricingUnit,
        budget: resource.budget,
        availability: resource.availability,
        location: resource.location,
        condition: resource.condition,
        status: resource.status || 'available',
        image_url: resource.imageUrl
      }).select('*, profiles(*)').single();

      if (insertError) throw insertError;
      
      if (data) {
        setResources(prev => [adaptListingToResource(data), ...prev]);
      }
      return { success: true };
    } catch (err: any) {
      console.error("Error creating listing:", err);
      return { success: false, error: err };
    }
  };

  const updateResource = async (id: string, updates: Partial<Resource>) => {
    if (!profile) return;
    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.pricingUnit !== undefined) dbUpdates.pricing_unit = updates.pricingUnit;
      if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
      if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      
      const { data, error: updateError } = await supabase
        .from('listings')
        .update(dbUpdates)
        .eq('id', id)
        .eq('owner_id', profile.id)
        .select('*, profiles(*)').single();
        
      if (updateError) throw updateError;
      if (data) {
        setResources(prev => prev.map(r => r.id === id ? adaptListingToResource(data) : r));
      }
    } catch (err) {
      console.error("Error updating listing:", err);
    }
  };

  const deleteResource = async (id: string) => {
    if (!profile) return;
    try {
      // Instead of relying purely on delete (which could fail due to FKs from orders),
      // let's try delete, and if it fails due to a foreign key constraint, fallback to status update.
      const { error: deleteError } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)
        .eq('owner_id', profile.id);
        
      if (deleteError) {
        if (deleteError.code === '23503') { // Foreign key violation
          console.warn("Listing has associated orders. Deactivating instead.");
          await updateResource(id, { status: 'unavailable' });
          return;
        }
        throw deleteError;
      }
      
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Error deleting listing:", err);
    }
  };

  const getResourceById = (id: string) => resources.find(r => r.id === id);
  const getUserResources = (userId: string) => resources.filter(r => r.provider.id === userId);

  return (
    <ResourceContext.Provider value={{
      resources,
      loading,
      error,
      addResource,
      updateResource,
      deleteResource,
      getResourceById,
      getUserResources,
      refreshResources: fetchResources
    }}>
      {children}
    </ResourceContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
}
