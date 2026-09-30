import { NavLink, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useActivity } from '../../contexts/ActivityContext';

export const NAVIGATION_ITEMS = [
  { name: 'Home', path: '/home' },
  { name: 'Explore', path: '/explore' },
  { name: 'Post', path: '/post' },
  { name: 'Orders', path: '/orders' },
  { name: 'Profile', path: '/profile' },
];

export function DesktopNavigation() {
  const { unreadCount } = useActivity();
  const navigate = useNavigate();

  return (
    <header className="hidden md:block sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border-subtle">
      <div className="boski-container h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Minimal typographic logo with the DOT metaphor */}
          <div className="font-extrabold text-xl tracking-[0.15em] uppercase flex items-baseline cursor-pointer" onClick={() => navigate('/home')}>
            BOSKI<span className="text-accent text-3xl leading-none">.</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <nav className="flex items-center gap-8">
            {NAVIGATION_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "text-label relative py-2 transition-colors",
                  isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {({ isActive }) => (
                  <>
                    {item.name}
                    {/* Subtle DOT visual metaphor for active state */}
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 bg-accent rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="w-px h-6 bg-border-subtle"></div>
          <button 
            onClick={() => navigate('/activity')}
            className="relative text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-subtle"
            aria-label="Activity notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border border-background"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
