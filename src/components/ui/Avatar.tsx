import React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, initials, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-lg",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface border border-border",
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="font-bold text-text-secondary uppercase">{initials?.slice(0, 2)}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";
