import React from 'react';
import { User } from '../../types';
import { useTrust } from '../../contexts/TrustContext';
import { VerificationBadge } from '../ui/VerificationBadge';
import { Card } from '../ui/Card';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TrustCardProps {
  user: User;
  className?: string;
  showReliability?: boolean;
}

export function TrustCard({ user, className, showReliability = false }: TrustCardProps) {
  const { getUserReputation } = useTrust();
  const reputation = getUserReputation(user.id);

  return (
    <Card className={cn("p-4 md:p-5 flex flex-col gap-4 bg-surface", className)}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-text-primary text-surface rounded-full flex items-center justify-center text-body font-bold shrink-0">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            user.initials || user.name.charAt(0)
          )}
        </div>
        
        <div className="flex flex-col">
          <span className="text-body font-bold text-text-primary leading-tight">
            {user.name}
          </span>
          {user.isVerified && <VerificationBadge className="mt-1" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-subtle">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-body font-bold">
            <Star className="w-4 h-4 fill-text-primary text-text-primary" />
            {reputation.isLoading ? '...' : (reputation.averageRating !== null ? reputation.averageRating : 'New')}
          </div>
          <span className="text-caption text-text-secondary">
            {reputation.isLoading ? 'Loading...' : (reputation.averageRating !== null ? `${reputation.totalRatings} ratings` : 'No ratings yet')}
          </span>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <div className="text-body font-bold">
            {reputation.isLoading ? '...' : reputation.completedOrders}
          </div>
          <span className="text-caption text-text-secondary">
            Orders
          </span>
        </div>
      </div>

      {showReliability && !reputation.isLoading && reputation.completionRate !== null && reputation.completionRate > 0 && (
        <div className="pt-3 flex items-center justify-between text-caption border-t border-border-subtle">
          <span className="text-text-secondary">Reliability</span>
          <span className="font-bold text-text-primary">{reputation.completionRate}% completion</span>
        </div>
      )}
    </Card>
  );
}
