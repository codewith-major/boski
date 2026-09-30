import React, { useEffect, useRef } from 'react';
import { Message, User } from '../../types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  otherUser?: User | null;
}

export function MessageList({ messages, otherUser }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-4">
        <p className="text-body font-medium text-text-primary">No messages yet.</p>
        <p className="text-body-sm text-text-secondary mt-1">
          Use this space to coordinate your order.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto px-1 py-2">
      {messages.map(message => (
        <MessageBubble key={message.id} message={message} otherUser={otherUser} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
