import React from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8", className)} {...props}>
      <div>
        <h1 className="text-h1">{title}</h1>
        {description && (
          <p className="text-body text-text-secondary mt-2 max-w-xl">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </header>
  );
}
