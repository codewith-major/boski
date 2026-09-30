import React from 'react';
import { OrderStatus } from '../../types';
import { cn } from '../../lib/utils';

interface OrderTimelineProps {
  currentState: OrderStatus;
  className?: string;
}

export function OrderTimeline({ currentState, className }: OrderTimelineProps) {
  const isCancelled = currentState === 'CANCELLED';
  
  const steps = [
    { id: 'REQUESTED', label: 'Requested' },
    { id: 'ACCEPTED', label: 'Accepted' },
    { id: 'ACTIVE', label: 'Active / In Progress' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  // Map historical or alternate statuses to standard step progression
  const normalizeStatus = (status: OrderStatus): string => {
    if (status === 'PAID') return 'ACCEPTED';
    if (status === 'IN_PROGRESS' || status === 'RETURNED') return 'ACTIVE';
    return status;
  };

  const normalizedCurrent = normalizeStatus(currentState);

  // Helper to determine if a step is "done" based on current state progression
  const isDone = (stepId: string) => {
    if (isCancelled) return stepId === 'REQUESTED'; // Only the first step is done if cancelled
    
    const currentIndex = steps.findIndex(s => s.id === normalizedCurrent);
    const stepIndex = steps.findIndex(s => s.id === stepId);
    
    // For normal progression
    if (currentIndex >= 0 && stepIndex >= 0) {
      return stepIndex < currentIndex;
    }
    
    // Special case: if currentState is 'completed', all steps are done
    return currentState === 'COMPLETED'; 
  };

  const isCurrent = (stepId: string) => {
    if (isCancelled) return false;
    return normalizedCurrent === stepId;
  };

  return (
    <div className={cn("flex flex-col gap-0", className)}>
      {steps.map((step, index) => {
        const done = isDone(step.id);
        const current = isCurrent(step.id);
        
        // Show cancelled on the 2nd step if it was cancelled
        const displayLabel = (isCancelled && index === 1) ? 'Cancelled' : step.label;
        
        // Hide remaining steps if cancelled
        if (isCancelled && index > 1) return null;

        return (
          <div key={step.id} className="flex flex-col">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-5 h-5">
                <div 
                  className={cn(
                    "w-3 h-3 rounded-full border-2 z-10",
                    done ? "bg-text-primary border-text-primary" : 
                    current ? "bg-surface-base border-accent" : 
                    (isCancelled && index === 1) ? "bg-error border-error" :
                    "bg-surface-base border-border-strong"
                  )}
                />
              </div>
              <span className={cn(
                "text-body-sm font-medium",
                (done || current) ? "text-text-primary" : 
                (isCancelled && index === 1) ? "text-error" : 
                "text-text-secondary"
              )}>
                {displayLabel}
              </span>
            </div>
            
            {/* The line connecting dots */}
            {index < steps.length - 1 && (!isCancelled || index < 1) && (
              <div className="flex w-5 justify-center h-8">
                <div className={cn(
                  "w-0.5 h-full",
                  done ? "bg-text-primary" : "bg-border-subtle"
                )} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
