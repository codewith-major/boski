import React from 'react';
import { cn } from '../../lib/utils';

interface PageContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <main 
      className={cn("flex-1 w-full pb-24 pt-6 md:pb-12 md:pt-10", className)} 
      {...props}
    >
      <div className="boski-container">
        {children}
      </div>
    </main>
  );
}
