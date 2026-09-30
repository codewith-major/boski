import React from 'react';
import { cn } from '../../lib/utils';
import { ButtonVariant, Size } from '../../types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: Size;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none rounded-sm";
    
    // Minimal Premium x Bold Youthful styling rules
    const variants = {
      primary: "bg-accent text-text-primary border border-text-primary hover:-translate-y-px hover:-translate-x-px hover:shadow-[2px_2px_0px_var(--color-boski-ink)] active:translate-y-0 active:translate-x-0 active:shadow-none",
      secondary: "bg-text-primary text-surface hover:bg-opacity-90",
      tertiary: "bg-transparent border border-border text-text-primary hover:bg-surface hover:border-text-primary",
      destructive: "bg-error text-surface hover:bg-opacity-90 border border-transparent",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-5 text-base",
      lg: "h-14 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
