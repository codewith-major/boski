import React from 'react';

interface UnreadIndicatorProps {
  count?: number;
  label?: string;
}

export function UnreadIndicator({ count, label }: UnreadIndicatorProps) {
  const displayLabel = label || (count ? `${count} unread` : 'New message');
  
  return (
    <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-caption font-bold text-cream">
      {displayLabel}
    </span>
  );
}
