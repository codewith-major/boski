import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusSquare, ArrowRightLeft, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const MOBILE_NAV_ITEMS = [
  { name: 'Home', path: '/home', icon: Home },
  { name: 'Explore', path: '/explore', icon: Compass },
  { name: 'Post', path: '/post', icon: PlusSquare },
  { name: 'Orders', path: '/orders', icon: ArrowRightLeft },
  { name: 'Profile', path: '/profile', icon: User },
];

export function MobileNavigation() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border-subtle pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isPost = item.name === 'Post';
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isPost ? "" : (isActive ? "text-text-primary" : "text-text-muted hover:text-text-primary")
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "flex items-center justify-center rounded-sm transition-all",
                    isPost 
                      ? "h-8 w-12 bg-text-primary text-accent shadow-[2px_2px_0px_var(--color-boski-lime)]" 
                      : "h-8 w-8"
                  )}>
                    <Icon 
                      className={cn("h-5 w-5", isPost && "h-5 w-5")} 
                      strokeWidth={isActive || isPost ? 2.5 : 2} 
                    />
                  </div>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-widest",
                    isPost ? "text-text-primary mt-0.5" : ""
                  )}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
