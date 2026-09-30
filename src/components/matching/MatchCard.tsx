import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { VerificationBadge } from '../ui/VerificationBadge';
import { Button } from '../ui/Button';
import { MatchResult } from '../../lib/matching';
import { cn } from '../../lib/utils';

export interface MatchCardProps {
  match: MatchResult;
  className?: string;
  key?: React.Key;
}

export function MatchCard({ match, className }: MatchCardProps) {
  const navigate = useNavigate();
  const { resource, reasons } = match;

  const handleAction = () => {
    navigate(`/resource/${resource.id}`);
  };

  const getActionText = () => {
    return 'VIEW →';
  };

  const getBadgeVariant = () => {
    if (resource.intent === 'NEED') return 'outline';
    switch (resource.type) {
      case 'ITEM': return 'neutral';
      case 'SKILL': return 'accent';
      default: return 'neutral';
    }
  };

  return (
    <Card className={cn("flex flex-col h-full bg-surface-subtle border-accent/20", className)}>
      <CardHeader className="flex flex-col gap-3 pb-2">
        <div className="flex justify-between items-start gap-2">
          <Badge variant={getBadgeVariant()} className="uppercase text-[10px]">
            {resource.intent === 'NEED' ? `REQ • ${resource.type}` : resource.type}
          </Badge>
          <div className="flex items-center gap-1 text-accent">
            <span className="text-caption font-bold">MATCH</span>
          </div>
        </div>
        <h3 className="text-h4 line-clamp-2" title={resource.title}>
          {resource.title}
        </h3>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar size="sm" initials={resource.provider.initials} />
            <div className="flex flex-col">
              <span className="text-body-sm font-bold text-text-primary">
                {resource.provider.name}
              </span>
              {resource.provider.rating && (
                <span className="text-caption text-text-secondary">
                  {resource.provider.rating} ★ · {resource.provider.completedOrders || 0} orders
                </span>
              )}
            </div>
          </div>
          {resource.provider.isVerified && <VerificationBadge />}
        </div>
        
        {reasons.length > 0 && (
          <div className="flex flex-col gap-1 mt-2">
            {reasons.map((reason, idx) => (
              <span key={idx} className="text-caption text-text-secondary flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent"></span>
                {reason}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button variant="secondary" fullWidth onClick={handleAction}>
          {getActionText()}
        </Button>
      </CardFooter>
    </Card>
  );
}
