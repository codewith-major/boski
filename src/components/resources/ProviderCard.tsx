import { User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { VerificationBadge } from '../ui/VerificationBadge';
import { Star, Flag } from 'lucide-react';
import { useState } from 'react';
import { ReportModal } from '../moderation/ReportModal';
import { cn } from '../../lib/utils';

interface ProviderCardProps {
  user: User;
  className?: string;
}

export function ProviderCard({ user, className }: ProviderCardProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ReportModal targetType="USER" targetId={user.id} isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <div className="flex items-center gap-4">
        <Avatar size="lg" initials={user.initials} />
        <div className="flex flex-col gap-1">
          <span className="text-h4">{user.name}</span>
          {user.isVerified && <VerificationBadge className="w-fit" />}
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-body-sm text-text-secondary">
        {user.rating && (
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-bold text-text-primary">{user.rating.toFixed(1)}</span>
            <span>Rating</span>
          </div>
        )}
        
        {user.rating && user.completedOrders !== undefined && (
          <span className="text-border-subtle">•</span>
        )}
        
        {user.completedOrders !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-text-primary">{user.completedOrders}</span>
            <span>Orders</span>
          </div>
        )}
      </div>
        <button onClick={() => setIsReportOpen(true)} className="mt-2 flex items-center space-x-1 text-xs text-stone-400 hover:text-red-500 transition-colors w-fit">
          <Flag className="w-3 h-3" />
          <span>Report User</span>
        </button>
    </div>
  );
}
