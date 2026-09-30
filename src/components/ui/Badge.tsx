import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'outline';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', ...props }, ref) => {
    const variants = {
      neutral: "bg-surface-subtle text-text-primary border border-border-subtle",
      accent: "bg-text-primary text-accent border border-text-primary",
      outline: "bg-transparent text-text-primary border border-text-primary",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-sm text-label",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
