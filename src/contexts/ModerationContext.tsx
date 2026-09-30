import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Report, User, ReportStatus } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useResources } from './ResourceContext';

interface ModerationContextType {
  reports: Report[];
  allUsers: User[];
  deactivatedResourceIds: string[];
  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateReportStatus: (reportId: string, status: ReportStatus, note?: string) => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
  restoreUser: (userId: string) => Promise<void>;
  deactivateResource: (resourceId: string) => Promise<void>;
  restoreResource: (resourceId: string) => Promise<void>;
  isLoading: boolean;
}

const ModerationContext = createContext<ModerationContextType | null>(null);

export function ModerationProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const { resources, fetchResources } = useResources();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate deactivated resources from the live resources list
  const deactivatedResourceIds = useMemo(() => 
    resources.filter(r => r.status === 'unavailable').map(r => r.id),
  [resources]);

  const fetchModerationData = useCallback(async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      // Fetch reports
      // If admin, they see all reports (via RLS). If not, they see their own.
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      if (reportsData) {
        setReports(reportsData.map(r => ({
          id: r.id,
          reporterId: r.reporter_id,
          targetType: r.target_type as any,
          targetId: r.target_id,
          reason: r.reason as any,
          description: r.description,
          status: r.status as any,
          adminNote: r.admin_note,
          resolvedAt: r.resolved_at,
          createdAt: r.created_at,
        })));
      }

      // If user is admin, they need to see all users in the admin dashboard
      if (profile.role === 'ADMIN') {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profilesError) throw profilesError;
        
        if (profilesData) {
          setAllUsers(profilesData.map(p => {
            const name = p.display_name || 'Unknown';
            const parts = name.split(' ');
            const initials = parts.length > 1 
              ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
              : name.substring(0, 2).toUpperCase();

            return {
              id: p.id,
              name: name,
              initials,
              role: p.role as any,
              accountStatus: p.account_status as any,
              verificationStatus: p.verification_status as any,
              // We'll leave rating/completedOrders as defaults for now in admin UI
              rating: 5.0, 
              completedOrders: 0
            };
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching moderation data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchModerationData();
  }, [fetchModerationData]);

  const addReport = async (reportData: Omit<Report, 'id' | 'createdAt' | 'status'>) => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase.from('reports').insert({
        reporter_id: profile.id,
        target_type: reportData.targetType,
        target_id: reportData.targetId,
        reason: reportData.reason,
        description: reportData.description
      }).select().single();

      if (error) throw error;
      
      if (data) {
        setReports(prev => [{
          id: data.id,
          reporterId: data.reporter_id,
          targetType: data.target_type as any,
          targetId: data.target_id,
          reason: data.reason as any,
          description: data.description,
          status: data.status as any,
          adminNote: data.admin_note,
          resolvedAt: data.resolved_at,
          createdAt: data.created_at,
        }, ...prev]);
      }
    } catch (err) {
      console.error('Error adding report:', err);
      throw err;
    }
  };

  const updateReportStatus = async (reportId: string, status: ReportStatus, note?: string) => {
    try {
      const { data, error } = await supabase.from('reports').update({
        status,
        admin_note: note,
        resolved_at: (status === 'RESOLVED' || status === 'DISMISSED') ? new Date().toISOString() : null
      }).eq('id', reportId).select().single();

      if (error) throw error;
      
      if (data) {
        setReports(prev => prev.map(r => r.id === reportId ? {
          ...r,
          status: data.status as any,
          adminNote: data.admin_note,
          resolvedAt: data.resolved_at
        } : r));
      }
    } catch (err) {
      console.error('Error updating report status:', err);
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ account_status: 'SUSPENDED' }).eq('id', userId);
      if (error) throw error;
      
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, accountStatus: 'SUSPENDED' } : u));
    } catch (err) {
      console.error('Error suspending user:', err);
    }
  };

  const restoreUser = async (userId: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ account_status: 'ACTIVE' }).eq('id', userId);
      if (error) throw error;
      
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, accountStatus: 'ACTIVE' } : u));
    } catch (err) {
      console.error('Error restoring user:', err);
    }
  };

  const deactivateResource = async (resourceId: string) => {
    try {
      const { error } = await supabase.from('listings').update({ status: 'unavailable' }).eq('id', resourceId);
      if (error) throw error;
      await fetchResources(); // Refresh resources
    } catch (err) {
      console.error('Error deactivating resource:', err);
    }
  };

  const restoreResource = async (resourceId: string) => {
    try {
      const { error } = await supabase.from('listings').update({ status: 'available' }).eq('id', resourceId);
      if (error) throw error;
      await fetchResources(); // Refresh resources
    } catch (err) {
      console.error('Error restoring resource:', err);
    }
  };

  const value = useMemo(() => ({
    reports,
    allUsers,
    deactivatedResourceIds,
    addReport,
    updateReportStatus,
    suspendUser,
    restoreUser,
    deactivateResource,
    restoreResource,
    isLoading
  }), [reports, allUsers, deactivatedResourceIds, isLoading]);

  return (
    <ModerationContext.Provider value={value}>
      {children}
    </ModerationContext.Provider>
  );
}

export function useModeration() {
  const context = useContext(ModerationContext);
  if (!context) {
    throw new Error('useModeration must be used within a ModerationProvider');
  }
  return context;
}

