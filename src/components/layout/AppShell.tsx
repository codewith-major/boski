import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { DesktopNavigation } from './DesktopNavigation';
import { MobileNavigation } from './MobileNavigation';
import { MobileHeader } from './MobileHeader';

export function AppShell() {
  const location = useLocation();

  // Redirect root to /home
  if (location.pathname === '/') {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative selection:bg-accent selection:text-text-primary pb-16 md:pb-0">
      <DesktopNavigation />
      <MobileHeader />
      
      {/* Outlet renders the matched child route */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>

      <MobileNavigation />
    </div>
  );
}
