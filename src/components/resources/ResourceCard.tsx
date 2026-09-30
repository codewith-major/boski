import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Resource } from '../../types';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { VerificationBadge } from '../ui/VerificationBadge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export interface ResourceCardProps {
  resource: Resource;
  className?: string;
  key?: React.Key;
}

export function ResourceCard({ resource, className, ...props }: ResourceCardProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    navigate(`/resource/${resource.id}`);
  };

  const getActionText = () => {
    if (resource.intent === 'NEED') return 'Offer this';
    switch (resource.type) {
      case 'ITEM': return 'Rent';
      case 'SKILL': return 'Request help';
      case 'HELP': return 'I can help';
      default: return 'Connect';
    }
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
    <Card className={cn("flex flex-col h-full", className)} {...props}>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <Badge variant={getBadgeVariant()} className="uppercase">
            {resource.intent === 'NEED' ? `REQ • ${resource.type}` : resource.type}
          </Badge>
          <span className="text-caption text-text-muted capitalize">
            {resource.status}
          </span>
        </div>
        <h3 className="text-h4 line-clamp-2" title={resource.title}>
          {resource.title}
        </h3>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <Avatar size="md" initials={resource.provider.initials} />
            <div className="flex flex-col">
              <span className="text-body font-bold text-text-primary">
                {resource.provider.name}
              </span>
            </div>
          </div>
          {resource.provider.isVerified && <VerificationBadge />}
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="primary" fullWidth onClick={handleAction}>
          {getActionText()}
        </Button>
      </CardFooter>
    </Card>
  );
}
