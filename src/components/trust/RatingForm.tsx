import React, { useState } from 'react';
import { useTrust } from '../../contexts/TrustContext';
import { RatingStars } from './RatingStars';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface RatingFormProps {
  orderId: string;
  toUserId: string;
}

export function RatingForm({ orderId, toUserId }: RatingFormProps) {
  const { submitRating, hasRatedOrder } = useTrust();
  const { profile } = useAuth();
  
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hasRated = profile ? hasRatedOrder(orderId, profile.id) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score === 0 || !profile) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      await submitRating({
        orderId,
        fromUserId: profile.id, // using auth identity
        toUserId,
        score,
        feedback: feedback.trim() || undefined,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasRated) {
    return (
      <div className="flex flex-col gap-2 p-5 bg-surface-subtle border border-border-subtle rounded-md">
        <h4 className="text-body font-bold flex items-center gap-2">
          Review submitted ✓
        </h4>
        <p className="text-body-sm text-text-secondary">
          Thanks for helping build trust on Boski.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 bg-surface border border-border-subtle rounded-md shadow-sm">
      <div className="flex flex-col gap-1">
        <h4 className="text-body font-bold">How did it go?</h4>
        <p className="text-caption text-text-secondary">Rate your experience</p>
      </div>
      
      <div className="py-2">
        <RatingStars 
          score={score} 
          interactive={true} 
          onScoreChange={setScore} 
        />
      </div>
      
      <div className="flex flex-col gap-1">
        <label htmlFor="feedback" className="text-caption text-text-secondary">
          Tell them what went well (Optional)
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Friendly feedback..."
          className="w-full bg-surface-subtle border border-border-strong rounded-sm p-3 text-body-sm focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all resize-none h-24"
        />
      </div>

      {error && (
        <p className="text-body-sm text-error">{error}</p>
      )}

      <Button 
        type="submit" 
        variant="primary" 
        fullWidth 
        disabled={score === 0 || isSubmitting}
      >
        {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REVIEW →'}
      </Button>
    </form>
  );
}
