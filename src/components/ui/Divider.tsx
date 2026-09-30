import React from 'react';
import { cn } from '../../lib/utils';

export const Divider = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn("w-full border-t border-border-subtle my-6", className)}
        {...props}
      />
    );
  }
);
Divider.displayName = "Divider";
