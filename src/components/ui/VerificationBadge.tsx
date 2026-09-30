import React from 'react';
import { cn } from '../../lib/utils';

export const VerificationBadge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-text-primary text-accent",
          className
        )}
        {...props}
      >
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="text-[10px] uppercase font-bold tracking-[0.08em] leading-none mt-0.5">
          Verified STU // .EDU
        </span>
      </span>
    );
  }
);
VerificationBadge.displayName = "VerificationBadge";
