import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-label text-text-primary">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "h-11 w-full rounded-sm border bg-surface px-3 text-body text-text-primary transition-colors placeholder:text-text-muted focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-error focus:border-error focus:ring-error" : "border-border",
            className
          )}
          {...props}
        />
        {error && <span className="text-caption text-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
