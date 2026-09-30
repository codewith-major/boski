import React from 'react';
import { cn } from '../../lib/utils';
import { ButtonVariant } from '../../types';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'tertiary', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none h-11 w-11";
    
    const variants = {
      primary: "bg-accent text-text-primary border border-text-primary hover:-translate-y-px hover:-translate-x-px hover:shadow-[2px_2px_0px_var(--color-boski-ink)] active:translate-y-0 active:translate-x-0 active:shadow-none",
      secondary: "bg-text-primary text-surface hover:bg-opacity-90",
      tertiary: "bg-transparent border border-border text-text-primary hover:bg-surface hover:border-text-primary",
      destructive: "bg-error text-surface hover:bg-opacity-90 border border-transparent",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";
