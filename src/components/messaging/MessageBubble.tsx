import React from 'react';
import { Message, User } from '../../types';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface MessageBubbleProps {
  message: Message;
  otherUser?: User | null;
  key?: React.Key;
}

export function MessageBubble({ message, otherUser }: MessageBubbleProps) {
  const { profile } = useAuth();
  const isCurrentUser = message.senderId === profile?.id;
  
  // Fallback if sender is not found
  const senderName = isCurrentUser ? 'You' : (otherUser?.name || 'Unknown');

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className={cn(
      "flex flex-col max-w-[80%] gap-1",
      isCurrentUser ? "self-end items-end" : "self-start items-start"
    )}>
      <span className="text-caption text-text-muted px-1">
        {senderName}
      </span>
      <div className={cn(
        "px-4 py-3 rounded-2xl",
        isCurrentUser ? "bg-ink text-cream rounded-tr-sm" : "bg-surface-subtle text-text-primary border border-border-subtle rounded-tl-sm"
      )}>
        <p className="text-body-sm whitespace-pre-wrap break-words">
          {message.body}
        </p>
      </div>
      <span className="text-caption text-text-muted px-1">
        {formattedTime}
      </span>
    </div>
  );
}
