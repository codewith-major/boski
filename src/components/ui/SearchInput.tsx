import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input, InputProps } from './Input';

export const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Search className="absolute left-3 top-[1.3rem] -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" />
        <Input 
          ref={ref}
          type="search"
          className={cn("pl-10", className)}
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
