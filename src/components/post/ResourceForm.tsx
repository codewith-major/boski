import React, { useState } from 'react';
import { PostDraft } from '../../pages/Post';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { Divider } from '../ui/Divider';

interface ResourceFormProps {
  draft: PostDraft;
  onSubmit: (draft: PostDraft) => void;
  onDraftChange: (draft: PostDraft) => void;
}

export function ResourceForm({ draft, onSubmit, onDraftChange }: ResourceFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isOffer = draft.intent === 'offer';

  const handleChange = (field: keyof PostDraft, value: any) => {
    onDraftChange({ ...draft, [field]: value });
    // Clear error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!draft.title?.trim()) {
      newErrors.title = 'Required';
    }
    if (!draft.description?.trim()) {
      newErrors.description = 'Required';
    }

    if (!draft.availability?.trim()) {
      newErrors.availability = 'Required';
    }

    if (isOffer && (draft.price === undefined || draft.price === null || isNaN(draft.price) || draft.price <= 0)) {
      newErrors.price = 'Price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(draft);
    }
  };

  const renderFields = () => {
    if (isOffer) {
      if (draft.type === 'ITEM') {
        return (
          <>
            <Input label="Item Name" placeholder="e.g. Scientific Calculator" value={draft.title || ''} onChange={e => handleChange('title', e.target.value)} error={errors.title} />
            <Textarea label="Description" placeholder="Condition, details, etc." value={draft.description || ''} onChange={e => handleChange('description', e.target.value)} error={errors.description} />
            <Input label="Category" placeholder="e.g. Study, Electronics" value={draft.category || ''} onChange={e => handleChange('category', e.target.value)} />
            <Input label="Condition" placeholder="e.g. Like New, Good" value={draft.condition || ''} onChange={e => handleChange('condition', e.target.value)} />
            <Input label="Availability" placeholder="e.g. Available now, Weekends" value={draft.availability || ''} onChange={e => handleChange('availability', e.target.value)} error={errors.availability} />
            <Input label="Handover Area" placeholder="e.g. Library" value={draft.location || ''} onChange={e => handleChange('location', e.target.value)} />
            <Input type="number" label="Price (NGN)" placeholder="e.g. 1500" value={draft.price ?? ''} onChange={e => handleChange('price', parseInt(e.target.value) || undefined)} error={errors.price} />
            <div className="flex flex-col gap-1.5"><label className="text-label">Pricing Unit</label><select className="flex h-12 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={draft.pricingUnit || 'day'} onChange={e => handleChange('pricingUnit', e.target.value)}><option value="day">Per Day</option><option value="session">Per Session</option><option value="hour">Per Hour</option><option value="project">Per Project</option><option value="event">Per Event</option><option value="fixed">Fixed</option></select></div>
          </>
        );
      } else if (draft.type === 'SKILL') {
        return (
          <>
            <Input label="Skill" placeholder="e.g. Photography, React Coding" value={draft.title || ''} onChange={e => handleChange('title', e.target.value)} error={errors.title} />
            <Textarea label="What can you help with?" placeholder="Describe your skill and how you can help..." value={draft.description || ''} onChange={e => handleChange('description', e.target.value)} error={errors.description} />
            <Input label="Availability" placeholder="e.g. Friday evenings" value={draft.availability || ''} onChange={e => handleChange('availability', e.target.value)} error={errors.availability} />
            <Input label="Location / Format" placeholder="e.g. Online, Student Union" value={draft.location || ''} onChange={e => handleChange('location', e.target.value)} />
            <Input type="number" label="Price (NGN)" placeholder="e.g. 5000" value={draft.price ?? ''} onChange={e => handleChange('price', parseInt(e.target.value) || undefined)} error={errors.price} />
            <div className="flex flex-col gap-1.5"><label className="text-label">Pricing Unit</label><select className="flex h-12 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={draft.pricingUnit || 'session'} onChange={e => handleChange('pricingUnit', e.target.value)}><option value="session">Per Session</option><option value="hour">Per Hour</option><option value="project">Per Project</option><option value="fixed">Fixed</option></select></div>
          </>
        );
      }
    } else {
      // REQUESTS
      if (draft.type === 'ITEM') {
        return (
          <>
            <Input label="What do you need?" placeholder="e.g. Tripod, Calculator" value={draft.title || ''} onChange={e => handleChange('title', e.target.value)} error={errors.title} />
            <Textarea label="Description" placeholder="Why do you need it? Any specifics?" value={draft.description || ''} onChange={e => handleChange('description', e.target.value)} error={errors.description} />
            <Input label="When do you need it?" placeholder="e.g. Tomorrow, This weekend" value={draft.availability || ''} onChange={e => handleChange('availability', e.target.value)} error={errors.availability} />
            <Input label="How long do you need it?" placeholder="e.g. 2 days" value={draft.condition || ''} onChange={e => handleChange('condition', e.target.value)} />
            <Input type="number" label="Budget (NGN) - Optional" placeholder="e.g. 3000" value={draft.budget ?? ''} onChange={e => handleChange('budget', parseInt(e.target.value) || undefined)} />
            <Input label="Preferred Handover Area" placeholder="e.g. Faculty of Arts" value={draft.location || ''} onChange={e => handleChange('location', e.target.value)} />
          </>
        );
      } else if (draft.type === 'SKILL') {
        return (
          <>
            <Input label="What do you need help learning?" placeholder="e.g. MTH101, Video Editing" value={draft.title || ''} onChange={e => handleChange('title', e.target.value)} error={errors.title} />
            <Textarea label="Description" placeholder="What specifically are you stuck on?" value={draft.description || ''} onChange={e => handleChange('description', e.target.value)} error={errors.description} />
            <Input label="When do you need help?" placeholder="e.g. Before my test next week" value={draft.availability || ''} onChange={e => handleChange('availability', e.target.value)} error={errors.availability} />
            <Input label="Preferred format" placeholder="e.g. In person, Online" value={draft.location || ''} onChange={e => handleChange('location', e.target.value)} />
            <Input type="number" label="Budget (NGN) - Optional" placeholder="e.g. 3000" value={draft.budget ?? ''} onChange={e => handleChange('budget', parseInt(e.target.value) || undefined)} />
          </>
        );
      } else if (draft.type === 'HELP') {
        return (
          <>
            <Input label="Title" placeholder="e.g. Need a project partner" value={draft.title || ''} onChange={e => handleChange('title', e.target.value)} error={errors.title} />
            <Textarea label="Description" placeholder="What exactly do you need help with?" value={draft.description || ''} onChange={e => handleChange('description', e.target.value)} error={errors.description} />
            <Input label="When do you need help?" placeholder="e.g. This Saturday" value={draft.availability || ''} onChange={e => handleChange('availability', e.target.value)} error={errors.availability} />
            <Input label="Location / Format" placeholder="e.g. Tech Hub" value={draft.location || ''} onChange={e => handleChange('location', e.target.value)} />
            <Input type="number" label="Budget (NGN) - Optional" placeholder="e.g. 3000" value={draft.budget ?? ''} onChange={e => handleChange('budget', parseInt(e.target.value) || undefined)} />
          </>
        );
      }
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-6 sm:p-8 flex flex-col gap-6">
        <h2 className="text-h2 border-b border-border-subtle pb-4">
          Details
        </h2>
        
        <div className="flex flex-col gap-4">
          {renderFields()}
        </div>

        <div className="pt-4 border-t border-border-subtle">
          <Button type="submit" variant="primary" size="lg" fullWidth>
            REVIEW POST
          </Button>
        </div>
      </Card>
    </form>
  );
}
