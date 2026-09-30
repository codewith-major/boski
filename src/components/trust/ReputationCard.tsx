import React from 'react';
import { User } from '../../types';
import { useTrust } from '../../contexts/TrustContext';
import { VerificationBadge } from '../ui/VerificationBadge';
import { Card } from '../ui/Card';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { RatingStars } from './RatingStars';

interface ReputationCardProps {
  user: User;
  className?: string;
}

export function ReputationCard({ user, className }: ReputationCardProps) {
  const { getUserReputation } = useTrust();
  const reputation = getUserReputation(user.id);

  return (
    <Card className={cn("p-6 flex flex-col gap-6 bg-surface", className)}>
      <div className="flex flex-col gap-2">
        <h3 className="text-h3">{user.name}</h3>
        {user.isVerified && <VerificationBadge />}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <RatingStars score={reputation.averageRating !== null ? Math.round(reputation.averageRating) : 0} />
          <span className="text-h2 leading-none">
            {reputation.isLoading ? '...' : (reputation.averageRating !== null ? reputation.averageRating : 'New to Boski')}
          </span>
        </div>
        <p className="text-body-sm text-text-secondary">
          {reputation.isLoading ? 'Loading ratings...' : `Based on ${reputation.totalRatings} ${reputation.totalRatings === 1 ? 'rating' : 'ratings'}`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border-subtle">
        <div className="flex flex-col gap-1">
          <span className="text-h3">{reputation.isLoading ? '...' : reputation.completedOrders}</span>
          <span className="text-body-sm text-text-secondary">
            Orders completed
          </span>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-h3">
            {reputation.isLoading ? '...' : (reputation.completionRate !== null ? `${reputation.completionRate}%` : '--')}
          </span>
          <span className="text-body-sm text-text-secondary">
            Completion rate
          </span>
        </div>
      </div>
    </Card>
  );
}
