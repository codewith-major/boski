import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, List, ShoppingBag, Flag, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const ADMIN_NAVIGATION = [
  { name: 'Analytics', path: '/admin/analytics', icon: LayoutDashboard },
  { name: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
  { name: 'Students', path: '/admin/students', icon: Users },
  { name: 'Listings', path: '/admin/listings', icon: List },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Reports', path: '/admin/reports', icon: Flag },
];

export default function AdminShell() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const role = profile?.role;

  if (role !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-subtle flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-background border-r border-border-subtle flex flex-col fixed inset-y-0 z-10">
        <div className="h-16 flex items-center px-6 border-b border-border-subtle gap-2 text-error shrink-0 cursor-pointer" onClick={() => navigate('/home')}>
          <ShieldAlert className="w-6 h-6" />
          <span className="font-bold tracking-widest text-sm uppercase">Admin Panel</span>
        </div>

        <nav className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
          {ADMIN_NAVIGATION.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-body-sm font-medium transition-colors",
                isActive 
                  ? "bg-surface-subtle text-text-primary" 
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle/50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border-subtle shrink-0">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-body-sm text-text-secondary hover:text-text-primary transition-colors px-4 py-2 w-full rounded-lg hover:bg-surface-subtle"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-w-0">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
