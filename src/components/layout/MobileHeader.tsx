import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useActivity } from '../../contexts/ActivityContext';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

export function MobileHeader() {
  const { unreadCount } = useActivity();
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="md:hidden sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border-subtle">
      <div className="boski-container h-14 flex items-center justify-between">
        <div className="font-extrabold text-xl tracking-[0.15em] uppercase flex items-baseline cursor-pointer" onClick={() => navigate('/home')}>
          BOSKI<span className="text-accent text-3xl leading-none">.</span>
        </div>
        
        {profile?.role === 'ADMIN' && (
          <button 
            onClick={() => navigate('/admin')}
            className="relative text-text-secondary hover:text-text-primary p-2 rounded-full mr-2"
            aria-label="Admin"
          >
            <ShieldAlert className="w-5 h-5" />
          </button>
        )}

        <button 
          onClick={() => navigate('/activity')}
          className="relative text-text-secondary hover:text-text-primary p-2 rounded-full"
          aria-label="Activity notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border border-background"></span>
          )}
        </button>
      </div>
    </header>
  );
}
