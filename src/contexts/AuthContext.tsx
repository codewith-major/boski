import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User as BoskiUser, VerificationStatus, AccountStatus, UserRole } from '../types';

interface AuthContextType {
  user: SupabaseUser | null;
  profile: BoskiUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ data: { user: SupabaseUser | null; session: Session | null } | null; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Adapter for real profile to BoskiUser
function adaptProfileToUser(supabaseUser: SupabaseUser, profileRecord: any | null): BoskiUser {
  // If profile doesn't exist yet (e.g. trigger hasn't run), use metadata fallback
  const fallbackName = supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || 'Unknown';
  const name = profileRecord?.display_name || fallbackName;
  const names = name.split(' ');
  const initials = names.length > 1 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();

  return {
    id: supabaseUser.id,
    name: name,
    initials: initials,
    isVerified: profileRecord?.verification_status === 'VERIFIED',
    verificationStatus: (profileRecord?.verification_status as VerificationStatus) || 'UNVERIFIED',
    accountStatus: (profileRecord?.account_status as AccountStatus) || 'ACTIVE',
    role: (profileRecord?.role as UserRole) || 'STUDENT',
    schoolId: profileRecord?.school_id || 'OAU-001', 
    avatarUrl: profileRecord?.avatar_url,
    rating: 0,
    totalRatings: 0,
    completedOrders: 0,
    completionRate: 100,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<BoskiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, sessionUser?: SupabaseUser | null) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error && (error.code === 'PGRST303' || error.message?.includes('JWT issued at future'))) {
        console.warn('Clock skew detected in fetchProfile (PGRST303). Retrying...');
        await new Promise((res) => setTimeout(res, 1200));
        const retry = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error('Error fetching profile:', error.message);
      }

      if (data) {
        return data;
      }

      // If profile does not exist yet, attempt to self-provision via secure RPC
      if (sessionUser && sessionUser.id === userId) {
        const displayName = sessionUser.user_metadata?.display_name || sessionUser.email?.split('@')[0] || 'User';

        try {
          const { data: rpcProfile, error: rpcErr } = await supabase.rpc('ensure_user_profile', {
            user_display_name: displayName
          });
          if (!rpcErr && rpcProfile) {
            return rpcProfile;
          }
        } catch (rpcCatch) {
          console.warn('ensure_user_profile RPC in fetchProfile:', rpcCatch);
        }
      }

      return null;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  const loadUser = async (sessionUser: SupabaseUser | null) => {
    setUser(sessionUser);
    if (sessionUser) {
      const profileData = await fetchProfile(sessionUser.id, sessionUser);
      setProfile(adaptProfileToUser(sessionUser, profileData));
    } else {
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      loadUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      loadUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    if (!res.error && res.data?.user && res.data?.session) {
      // Ensure profile row exists immediately via secure RPC
      try {
        await supabase.rpc('ensure_user_profile', {
          user_display_name: name
        });
      } catch (e) {
        // Ignore duplicate or RPC race
      }
    }

    return { data: res.data, error: res.error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id, user);
      setProfile(adaptProfileToUser(user, profileData));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
