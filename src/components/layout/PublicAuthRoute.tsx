import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface PublicAuthRouteProps {
  children: React.ReactNode;
}

/**
 * Route wrapper for public auth pages (/signin, /signup, /auth).
 * 
 * Behavior:
 * - While AuthContext is loading the initial session: shows loading screen, preventing flash & premature redirect.
 * - When loading finishes and user has an active authenticated session/profile: redirects to /home (or previous target).
 * - When loading finishes and user is unauthenticated: renders the auth page (stays on /signin or /signup).
 */
export function PublicAuthRoute({ children }: PublicAuthRouteProps) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F3EC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#171719]" />
      </div>
    );
  }

  if (profile) {
    const from = location.state?.from?.pathname;
    const destination = (from && from !== '/signin' && from !== '/signup' && from !== '/auth')
      ? from
      : '/home';
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
}
