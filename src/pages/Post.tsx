import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { ResourceType, Resource } from '../types';
import { useResources } from '../contexts/ResourceContext';
import { useAuth } from '../contexts/AuthContext';
import { IntentSelector } from '../components/post/IntentSelector';
import { TypeSelector } from '../components/post/TypeSelector';
import { ResourceForm } from '../components/post/ResourceForm';
import { PostPreview } from '../components/post/PostPreview';
import { Card } from '../components/ui/Card';
import { useModeration } from '../contexts/ModerationContext';
import { AlertTriangle } from 'lucide-react';

export type PostIntent = 'offer' | 'request';
export type PostStep = 'intent' | 'type' | 'form' | 'preview' | 'success';

export interface PostDraft {
  id?: string;
  intent?: PostIntent;
  type?: ResourceType;
  title: string;
  description: string;
  location?: string;
  category?: string;
  condition?: string;
  availability?: string;
  price?: number;
  currency?: 'NGN';
  pricingUnit?: import('../types').PricingUnit;
  budget?: number;
}

export default function Post() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEdit = Boolean(editId);
  const { profile } = useAuth();
  
  const { addResource, getResourceById, updateResource } = useResources();
  const { allUsers } = useModeration();
  const isSuspended = profile?.accountStatus === 'SUSPENDED';

  const stepParam = searchParams.get('step') as PostStep | null;
  const intentParam = searchParams.get('intent') as PostIntent | null;
  const typeParam = searchParams.get('type') as ResourceType | null;

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [draft, setDraft] = useState<PostDraft>(() => ({
    title: '',
    description: '',
    location: '',
    category: '',
    condition: '',
    availability: '',
    intent: intentParam || undefined,
    type: typeParam || undefined,
  }));

  // Sync draft intent and type if URL search params change (e.g. browser back/forward)
  useEffect(() => {
    if (intentParam || typeParam) {
      setDraft(prev => ({
        ...prev,
        intent: intentParam || prev.intent,
        type: typeParam || prev.type,
      }));
    }
  }, [intentParam, typeParam]);

  // Determine current active step safely
  const activeIntent = draft.intent || intentParam;
  const activeType = draft.type || typeParam;

  const step: PostStep = (() => {
    if (stepParam === 'success') return 'success';
    if (isEdit) {
      if (stepParam === 'preview') return 'preview';
      return 'form';
    }
    if (stepParam === 'preview' && activeIntent && activeType) return 'preview';
    if (stepParam === 'form' && activeIntent && activeType) return 'form';
    if (stepParam === 'type' && activeIntent) return 'type';
    return 'intent';
  })();

  useEffect(() => {
    if (editId) {
      const existing = getResourceById(editId);
      if (existing && profile && existing.provider.id === profile.id) {
        setDraft({
          id: existing.id,
          intent: existing.intent,
          type: existing.type,
          title: existing.title,
          description: existing.description,
          location: existing.location || '',
          price: existing.price,
          currency: existing.currency,
          pricingUnit: existing.pricingUnit,
          budget: existing.budget,
          category: existing.category || '',
          condition: existing.condition || '',
          availability: existing.availability || '',
        });
      }
    }
  }, [editId, getResourceById, profile]);

  const handleIntentSelect = (intent: PostIntent) => {
    setDraft(prev => ({ ...prev, intent }));
    setSearchParams({ step: 'type', intent });
  };

  const handleTypeSelect = (type: ResourceType) => {
    const intent = draft.intent || intentParam || 'offer';
    setDraft(prev => ({
      ...prev,
      type,
      pricingUnit: prev.pricingUnit || (type === 'SKILL' ? 'session' : 'day')
    }));
    setSearchParams({ step: 'form', intent, type });
  };

  const handleDraftChange = (updatedDraft: PostDraft) => {
    setDraft(updatedDraft);
  };

  const handleFormSubmit = (updatedDraft: PostDraft) => {
    setDraft(updatedDraft);
    if (isEdit) {
      setSearchParams({ edit: editId!, step: 'preview' });
    } else {
      const intent = updatedDraft.intent || draft.intent || intentParam || 'offer';
      const type = updatedDraft.type || draft.type || typeParam || 'ITEM';
      setSearchParams({ step: 'preview', intent, type });
    }
  };

  const handleBack = () => {
    if (isEdit) {
      if (step === 'preview') {
        setSearchParams({ edit: editId!, step: 'form' });
      } else {
        navigate('/profile');
      }
      return;
    }

    const currentIntent = draft.intent || intentParam || 'offer';

    if (step === 'preview') {
      const currentType = draft.type || typeParam || 'ITEM';
      setSearchParams({ step: 'form', intent: currentIntent, type: currentType });
    } else if (step === 'form') {
      setSearchParams({ step: 'type', intent: currentIntent });
    } else if (step === 'type') {
      setSearchParams({});
    } else {
      if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate('/home');
      }
    }
  };

  const handlePublish = async () => {
    setPublishError(null);
    setPublishing(true);

    try {
      if (draft.id) {
        await updateResource(draft.id, {
          title: draft.title,
          description: draft.description,
          location: draft.location || undefined,
          price: draft.price,
          currency: draft.currency,
          pricingUnit: draft.pricingUnit,
          budget: draft.budget,
          category: draft.category || undefined,
          condition: draft.condition || undefined,
          availability: draft.availability || undefined,
        });
        if (isEdit) {
          setSearchParams({ edit: editId!, step: 'success' }, { replace: true });
        } else {
          setSearchParams({ step: 'success' }, { replace: true });
        }
      } else {
        if (!profile) {
          setPublishError('You must be logged in to post.');
          setPublishing(false);
          return;
        }

        const newResource: Resource = {
          id: `r_${Date.now()}`,
          type: draft.type as ResourceType,
          intent: draft.intent,
          title: draft.title,
          description: draft.description,
          provider: profile,
          status: 'available',
          createdAt: new Date().toISOString(),
          location: draft.location || undefined,
          price: draft.price,
          currency: draft.currency,
          pricingUnit: draft.pricingUnit,
          budget: draft.budget,
          category: draft.category || undefined,
          condition: draft.condition || undefined,
          availability: draft.availability || undefined,
        };
        
        const res = await addResource(newResource);
        if (res && res.error) {
          setPublishError(res.error.message || 'Failed to create listing. Please try again.');
          setPublishing(false);
          return;
        }

        setSearchParams({ step: 'success' }, { replace: true });
      }
    } catch (err: any) {
      console.error('Failed to publish listing:', err);
      setPublishError(err.message || 'Failed to publish post. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  if (step === 'success') {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <Card className="flex flex-col items-center justify-center p-12 text-center gap-6 max-w-lg w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-display text-accent">
              {draft.id ? 'Changes saved ✓' : (draft.intent === 'NEED' ? 'Request posted ✓' : 'Posted ✓')}
            </h1>
            <p className="text-body text-text-secondary">
              {draft.id ? 'Your updates are now live.' : "You're live. Your post is now visible on Boski."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <Button variant="primary" className="flex-1" onClick={() => navigate(draft.id ? `/resource/${draft.id}` : '/explore')}>
              {draft.id ? 'VIEW POST' : 'GO TO EXPLORE'}
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => navigate(draft.id ? '/profile' : '/home')}>
              {draft.id ? 'BACK TO PROFILE' : 'BACK TO HOME'}
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  if (isSuspended) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <Card className="flex flex-col items-center justify-center p-12 text-center gap-6 max-w-lg w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-display text-red-600">Account Suspended</h1>
            <p className="text-body text-text-secondary">
              Your account is currently suspended. You cannot create new listings or modify existing ones until your account is restored.
            </p>
          </div>
          <Button onClick={() => navigate('/home')} variant="primary" size="lg" className="w-full sm:w-auto">
            Return Home
          </Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-2xl mx-auto flex flex-col gap-8">
      {step !== 'intent' && (
        <div>
          <Button 
            variant="tertiary" 
            size="sm" 
            onClick={handleBack} 
            className="px-0 hover:bg-transparent"
          >
            ← {isEdit && step === 'form' ? 'Cancel Edit' : 'Back'}
          </Button>
        </div>
      )}

      {step === 'intent' && <IntentSelector onSelect={handleIntentSelect} />}
      {step === 'type' && draft.intent && (
        <TypeSelector intent={draft.intent} onSelect={handleTypeSelect} />
      )}
      {step === 'form' && draft.intent && draft.type && (
        <ResourceForm 
          draft={draft} 
          onSubmit={handleFormSubmit} 
          onDraftChange={handleDraftChange}
        />
      )}
      {step === 'preview' && (
        <PostPreview 
          draft={draft} 
          onPublish={handlePublish} 
          isPublishing={publishing}
          error={publishError}
        />
      )}
    </PageContainer>
  );
}
