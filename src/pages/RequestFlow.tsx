import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Divider } from '../components/ui/Divider';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { ProviderCard } from '../components/resources/ProviderCard';
import { useResources } from '../contexts/ResourceContext';
import { ResourceType } from '../types';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

type Step = 'form' | 'review' | 'success';

export default function RequestFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  const { getResourceById } = useResources();
  const { profile } = useAuth();

  const isSuspended = profile?.accountStatus === 'SUSPENDED';

  const resource = id ? getResourceById(id) : undefined;

  const [step, setStep] = useState<Step>('form');
  
  // Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timing, setTiming] = useState('');
  const [message, setMessage] = useState('');

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!resource) {
    return (
      <PageContainer>
        <Card className="flex flex-col items-center justify-center p-12 border-dashed bg-transparent text-center gap-6 mt-8">
          <h1 className="text-display">Not Found</h1>
          <p className="text-body text-text-secondary max-w-md">
            The resource you are trying to request doesn't exist.
          </p>
          <Button variant="secondary" onClick={() => navigate('/explore')}>
            Back to Explore
          </Button>
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
              Your account is currently suspended. You cannot make new requests until your account is restored.
            </p>
          </div>
          <Button onClick={() => navigate(-1)} variant="primary" size="lg" className="w-full sm:w-auto">
            Go Back
          </Button>
        </Card>
      </PageContainer>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (resource.type === 'ITEM') {
      if (!startDate) newErrors.startDate = 'Start date is required';
      if (!endDate) newErrors.endDate = 'Return date is required';
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        newErrors.endDate = 'Return date cannot be before start date';
      }
    } else if (resource.type === 'SKILL') {
      if (!message.trim()) newErrors.message = 'Description is required';
      if (!timing.trim()) newErrors.timing = 'Preferred timing is required';
    } else if (resource.intent === 'NEED') {
      if (!message.trim()) newErrors.message = 'A message is required';
    }

    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReview = () => {
    if (validateForm()) {
      setStep('review');
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      await addOrder({
        resourceId: resource.id,
        providerId: resource.provider.id,
        resourceType: resource.type,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        message: message || undefined,
      });
      setStep('success');
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const getFormTitle = (type: ResourceType) => {
    switch (type) {
      case 'ITEM': return 'REQUEST TO RENT';
      case 'SKILL': return 'REQUEST HELP';
       return 'OFFER HELP';
      default: return 'REQUEST';
    }
  };

  const renderFormFields = () => {
    switch (resource.type) {
      case 'ITEM':
        return (
          <>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                error={errors.startDate}
              />
              <Input
                label="Return Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                error={errors.endDate}
              />
            </div>
            <Textarea
              label="Message (Optional)"
              placeholder="What do you need it for?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </>
        );
      case 'SKILL':
        return (
          <>
            <Textarea
              label="What do you need help with?"
              placeholder="Describe your request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              error={errors.message}
            />
            <Input
              label="When do you need help?"
              placeholder="e.g. This weekend, Tomorrow afternoon"
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              error={errors.timing}
            />
          </>
        );
      
        return (
          <>
            <Textarea
              label="Your Message"
              placeholder="How can you help?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              error={errors.message}
            />
          </>
        );
      default:
        return null;
    }
  };

  if (step === 'success') {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <Card className="flex flex-col items-center justify-center p-12 text-center gap-6 max-w-lg w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-display text-accent">REQUEST SENT</h1>
            <p className="text-body text-text-secondary">
              {resource.provider.name} has received your request. You'll see updates here when they respond.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <Button variant="primary" className="flex-1" onClick={() => navigate('/orders')}> VIEW ORDERS </Button>
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/explore')}>
              BACK TO EXPLORE
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  if (step === 'review') {
    return (
      <PageContainer className="flex flex-col gap-6 md:gap-8 max-w-3xl mx-auto">
        <div>
          <Button variant="tertiary" size="sm" onClick={() => setStep('form')} className="px-0 hover:bg-transparent">
            ← Edit Request
          </Button>
        </div>

        <Card className="flex flex-col gap-6 p-6 sm:p-8">
          <header className="flex flex-col gap-2 border-b border-border-subtle pb-6">
            <h1 className="text-h2">{getFormTitle(resource.type)}</h1>
            <p className="text-body font-medium">{resource.title}</p>
          </header>

          <section className="flex flex-col gap-4">
            <h3 className="text-label text-text-secondary uppercase">From</h3>
            <ProviderCard user={resource.provider} />
          </section>

          <Divider className="my-2" />

          <section className="flex flex-col gap-4">
            {resource.type === 'ITEM' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-label text-text-secondary uppercase">Start Date</h3>
                  <p className="text-body font-medium">{startDate}</p>
                </div>
                <div>
                  <h3 className="text-label text-text-secondary uppercase">Return Date</h3>
                  <p className="text-body font-medium">{endDate}</p>
                </div>
              </div>
            )}
            
            {resource.type === 'SKILL' && (
              <div>
                <h3 className="text-label text-text-secondary uppercase">Timing</h3>
                <p className="text-body font-medium">{timing}</p>
              </div>
            )}

            <div>
              <h3 className="text-label text-text-secondary uppercase">Message</h3>
              <p className="text-body font-medium whitespace-pre-wrap">{message || 'No message provided.'}</p>
            </div>

            
          </section>

          {submitError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 mt-4">
              {submitError}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border-subtle mt-2">
            <Button variant="primary" size="lg" className="flex-1" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'SENDING...' : 'SEND REQUEST'}
            </Button>
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep('form')} disabled={submitting}>
              EDIT
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  // Form Step
  return (
    <PageContainer className="flex flex-col gap-6 md:gap-8 max-w-3xl mx-auto">
      <div>
        <Button variant="tertiary" size="sm" onClick={() => navigate(-1)} className="px-0 hover:bg-transparent">
          ← Cancel
        </Button>
      </div>

      <Card className="flex flex-col gap-8 p-6 sm:p-8">
        <header className="flex flex-col gap-4">
          <Badge variant="neutral" className="uppercase w-fit bg-surface-subtle border border-border-subtle">
            {getFormTitle(resource.type)}
          </Badge>
          <div className="flex flex-col gap-1">
            <h1 className="text-h2">{resource.title}</h1>
            <p className="text-body-sm text-text-secondary">
              {resource.intent === 'NEED' ? 'Requested by' : 'Provided by'} {resource.provider.name}
            </p>
          </div>
        </header>

        <Divider className="my-0" />

        <div className="flex flex-col gap-6">
          <h2 className="text-h4">Details</h2>
          {renderFormFields()}
        </div>

        <Divider className="my-0" />

        {(resource.price !== undefined || resource.budget !== undefined) && (
          <div className="flex flex-col gap-6">
            <h2 className="text-h4">{resource.intent === 'HAVE' ? 'Pricing Summary' : 'Budget'}</h2>
            <div className="bg-surface-subtle p-4 rounded-lg border border-border-subtle">
              <p className="text-h3 text-text-primary">
                {resource.intent === 'HAVE' 
                    ? `₦${resource.price} / ${resource.pricingUnit}` 
                    : `₦${resource.budget}`}
              </p>
              {resource.intent === 'HAVE' && <p className="text-caption text-text-secondary mt-1">Boski is free to use and does not process payments. Any agreed payment is settled directly between students.</p>}
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button variant="primary" size="lg" fullWidth onClick={handleReview}>
            REVIEW REQUEST
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
