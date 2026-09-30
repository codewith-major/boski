import React from 'react';
import { User, Resource } from '../../types';
import { VerificationBadge } from '../ui/VerificationBadge';

interface ConversationHeaderProps {
  otherUser: User;
  resource: Resource;
}

export function ConversationHeader({ otherUser, resource }: ConversationHeaderProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-border-subtle pb-4">
      <div className="flex items-center gap-2">
        <h3 className="text-h4">{otherUser.name}</h3>
        {otherUser.isVerified && <VerificationBadge />}
      </div>
      <p className="text-body-sm text-text-secondary line-clamp-1">
        Re: {resource.title}
      </p>
    </div>
  );
}
