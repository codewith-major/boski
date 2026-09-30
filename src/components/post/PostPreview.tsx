import React from 'react';
import { PostDraft } from '../../pages/Post';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Divider } from '../ui/Divider';
import { Badge } from '../ui/Badge';

interface PostPreviewProps {
  draft: PostDraft;
  onPublish: () => void;
  isPublishing?: boolean;
  error?: string | null;
}

export function PostPreview({ draft, onPublish, isPublishing = false, error = null }: PostPreviewProps) {
  const isOffer = draft.intent === 'offer';

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}
      <Card className="p-6 sm:p-8 flex flex-col gap-6">
        <header className="flex flex-col items-start gap-4 border-b border-border-subtle pb-6">
          <Badge variant={isOffer ? 'accent' : 'outline'} className="uppercase">
            {isOffer ? 'OFFER' : 'REQUEST'} • {draft.type}
          </Badge>
          <h1 className="text-h2">{draft.title}</h1>
        </header>

        <section className="flex flex-col gap-4">
          <h3 className="text-label text-text-secondary uppercase">Description</h3>
          <p className="text-body whitespace-pre-wrap">{draft.description}</p>
        </section>

        <Divider className="my-0" />

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
          {draft.category && (
            <div>
              <h3 className="text-label text-text-secondary uppercase">Category</h3>
              <p className="text-body font-medium">{draft.category}</p>
            </div>
          )}
          
          {draft.condition && (
            <div>
              <h3 className="text-label text-text-secondary uppercase">
                {draft.type === 'ITEM' && isOffer ? 'Condition' : 'Duration'}
              </h3>
              <p className="text-body font-medium">{draft.condition}</p>
            </div>
          )}

          {draft.availability && (
            <div>
              <h3 className="text-label text-text-secondary uppercase">
                {isOffer ? 'Availability' : 'When needed'}
              </h3>
              <p className="text-body font-medium">{draft.availability}</p>
            </div>
          )}

          {draft.location && (
            <div>
              <h3 className="text-label text-text-secondary uppercase">Location / Format</h3>
              <p className="text-body font-medium">{draft.location}</p>
            </div>
          )}

          {(draft.price !== undefined || draft.budget !== undefined) && (
            <div className="sm:col-span-2">
              <h3 className="text-label text-text-secondary uppercase">
                {isOffer ? 'Price' : 'Budget'}
              </h3>
              <div className="bg-surface-subtle p-4 border border-border-subtle rounded-md mt-2">
                <p className="text-body-sm font-bold">
                  {isOffer ? `₦${draft.price} / ${draft.pricingUnit}` : `₦${draft.budget}`}
                </p>
              </div>
            </div>
          )}
        </section>

        <div className="pt-6 border-t border-border-subtle mt-2 flex flex-col sm:flex-row gap-3">
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth 
            onClick={onPublish}
            disabled={isPublishing}
          >
            {isPublishing ? 'POSTING...' : 'POST →'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
