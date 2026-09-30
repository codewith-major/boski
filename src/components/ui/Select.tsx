import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-label text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "h-11 w-full appearance-none rounded-sm border bg-surface px-3 pr-10 text-body text-text-primary transition-colors focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-error focus:border-error focus:ring-error" : "border-border",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-primary pointer-events-none" />
        </div>
        {error && <span className="text-caption text-error">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
