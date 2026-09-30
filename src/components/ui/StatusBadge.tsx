import React from 'react';
import { cn } from '../../lib/utils';
import { OrderStatus } from '../../types';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, ...props }, ref) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      REQUESTED: { color: "bg-warning", label: "Pending" },
      ACCEPTED: { color: "bg-info", label: "Accepted" },
      ACTIVE: { color: "bg-accent", label: "Active" },
      COMPLETED: { color: "bg-success", label: "Completed" },
      CANCELLED: { color: "bg-error", label: "Cancelled" },
      available: { color: "bg-accent", label: "Available" },
      unavailable: { color: "bg-border", label: "Unavailable" },
    };

    const config = statusConfig[status];

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border border-border bg-surface text-caption uppercase font-bold tracking-wider",
          className
        )}
        {...props}
      >
        <span className={cn("h-2 w-2 rounded-full", config.color)} />
        {config.label}
      </span>
    );
  }
);
StatusBadge.displayName = "StatusBadge";
