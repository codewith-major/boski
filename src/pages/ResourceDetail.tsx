import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Divider } from '../components/ui/Divider';
import { StatusBadge } from '../components/ui/StatusBadge';
import { TrustCard } from '../components/trust/TrustCard';
import { MatchSection } from '../components/matching/MatchSection';
import { getMatchesForResource } from '../lib/matching';
import { useResources } from '../contexts/ResourceContext';
import { useAuth } from '../contexts/AuthContext';
import { useModeration } from '../contexts/ModerationContext';
import { ResourceType } from '../types';
import { ShieldAlert, Flag, MessageSquare } from 'lucide-react';
import { ReportModal } from '../components/moderation/ReportModal';

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getResourceById, resources } = useResources();
  const { profile } = useAuth();
  
  const resource = id ? getResourceById(id) : undefined;
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { deactivatedResourceIds } = useModeration();
  const isDeactivated = resource ? deactivatedResourceIds.includes(resource.id) : false;

  if (isDeactivated) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <Card className="flex flex-col items-center justify-center p-12 text-center gap-6 max-w-lg w-full">
          <ShieldAlert className="w-12 h-12 text-red-500" />
          <h1 className="text-display text-red-600">Listing Unavailable</h1>
          <p className="text-body text-text-secondary">This listing has been deactivated by moderation.</p>
          <Button onClick={() => navigate('/explore')} variant="secondary">
            Back to Explore
          </Button>
        </Card>
      </PageContainer>
    );
  }

  if (!resource) {
    return (
      <PageContainer>
        <Card className="flex flex-col items-center justify-center p-12 border-dashed bg-transparent text-center gap-6 mt-8">
          <h1 className="text-display">Not Found</h1>
          <p className="text-body text-text-secondary max-w-md">
            The resource you are looking for doesn't exist or has been removed.
          </p>
          <Button variant="secondary" onClick={() => navigate('/explore')}>
            Browse Explore
          </Button>
        </Card>
      </PageContainer>
    );
  }

  const getBadgeVariant = (type: ResourceType) => {
    switch (type) {
      case 'ITEM': return 'neutral';
      case 'SKILL': return 'accent';
       return 'outline';
      case 'HELP': return 'outline';
      default: return 'neutral';
    }
  };

  const getCTA = (type: ResourceType) => {
    switch (type) {
      case 'ITEM': return 'REQUEST TO RENT';
      case 'SKILL': return 'REQUEST HELP';
      case 'HELP': return 'I CAN HELP';
       return 'OFFER RESOURCE';
      default: return 'CONNECT';
    }
  };

  const handleAction = () => {
    navigate(`/resource/${resource.id}/request`);
  };

  const isOwner = profile ? resource.provider.id === profile.id : false;

  return (
    <PageContainer className="flex flex-col gap-6 md:gap-8">
      <div>
        <Button variant="tertiary" size="sm" onClick={() => navigate(-1)} className="px-0 hover:bg-transparent">
          ← Back
        </Button>
      </div>

      <div className="boski-grid">
        {/* Left Column: What */}
        <div className="col-span-4 md:col-span-4 lg:col-span-8 flex flex-col gap-8">
          <header className="flex flex-col items-start gap-4">
            <Badge variant={getBadgeVariant(resource.type)} className="uppercase">
              {resource.type}
            </Badge>
            <h1 className="text-h1">{resource.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-caption text-text-secondary">
              <span>Posted {new Date(resource.createdAt).toLocaleDateString()}</span>
              {resource.location && (
                <>
                  <span className="text-border-subtle">•</span>
                  <span>Location: {resource.location}</span>
                </>
              )}
            </div>
          </header>

          <Divider className="my-0" />

          <section className="flex flex-col gap-4">
            <h2 className="text-label text-text-secondary uppercase tracking-widest">
              Description
            </h2>
            <p className="text-body max-w-3xl whitespace-pre-wrap">
              {resource.description}
            </p>
          </section>

          {(resource.price !== undefined || resource.budget !== undefined) && (
            <section className="flex flex-col gap-4">
              <h2 className="text-label text-text-secondary uppercase tracking-widest">
                {resource.intent === 'HAVE' ? 'Price' : 'Budget'}
              </h2>
              <div className="bg-surface-subtle border border-border-subtle p-5 rounded-md max-w-3xl">
                <p className="text-h3 text-text-primary">
                  {resource.intent === 'HAVE' 
                    ? `₦${resource.price} / ${resource.pricingUnit}` 
                    : `₦${resource.budget}`}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Who, Trust, Availability, Action */}
        <div className="col-span-4 md:col-span-4 lg:col-span-4">
          <Card className="p-6 sticky top-24">
            <h2 className="text-label text-text-secondary uppercase tracking-widest mb-6">
              {isOwner ? 'YOUR POST' : (resource.intent === 'NEED' ? 'Requested By' : 'Provider')}
            </h2>
            
            <TrustCard user={resource.provider} showReliability={true} className="p-0 bg-transparent shadow-none" />
            
            <Divider className="my-6" />
            
            <div className="flex justify-between items-center mb-8">
              <span className="text-body-sm font-bold">Status</span>
              <StatusBadge status={resource.status} />
            </div>

            {!isOwner ? (
              <div className="flex flex-col gap-3">
                <Button variant="primary" fullWidth size="lg" onClick={handleAction}>
                  {getCTA(resource.type)}
                </Button>
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => {}}>
                    Message
                  </Button>
                  <Button variant="tertiary" className="flex-1" onClick={() => {}}>
                    Report
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button variant="secondary" fullWidth size="lg" onClick={() => navigate(`/post?edit=${resource.id}`)}>
                  EDIT POST
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {isOwner && (
        <div className="mt-8">
          <MatchSection 
            title={resource.intent === 'NEED' || resource.intent === 'NEED' ? 'Potential matches' : 'People who may need this'}
            matches={getMatchesForResource(resource, resources)}
            emptyMessage="We'll show relevant matches when they appear."
          />
        </div>
      )}
    </PageContainer>
  );
}
