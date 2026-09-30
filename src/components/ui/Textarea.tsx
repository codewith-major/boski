import React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "min-h-[100px] w-full rounded-sm border bg-surface p-3 text-body text-text-primary transition-colors placeholder:text-text-muted focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y",
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
Textarea.displayName = "Textarea";
