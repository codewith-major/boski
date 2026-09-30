import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RatingStarsProps {
  score: number;
  maxScore?: number;
  interactive?: boolean;
  onScoreChange?: (score: number) => void;
  className?: string;
}

export function RatingStars({
  score,
  maxScore = 5,
  interactive = false,
  onScoreChange,
  className
}: RatingStarsProps) {
  const [hoverScore, setHoverScore] = React.useState<number | null>(null);

  const displayScore = interactive && hoverScore !== null ? hoverScore : score;

  return (
    <div 
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => interactive && setHoverScore(null)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? "Rate experience" : `${score} out of ${maxScore} stars`}
    >
      {Array.from({ length: maxScore }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayScore;
        
        return (
          <button
            key={starValue}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            aria-checked={interactive ? starValue === score : undefined}
            role={interactive ? "radio" : "presentation"}
            aria-label={interactive ? `${starValue} stars` : undefined}
            onMouseEnter={() => interactive && setHoverScore(starValue)}
            onClick={() => interactive && onScoreChange?.(starValue)}
            className={cn(
              "transition-transform focus:outline-none",
              interactive ? "cursor-pointer hover:scale-110 focus-visible:ring-2 focus-visible:ring-text-primary rounded-sm" : "cursor-default"
            )}
          >
            <Star
              className={cn(
                "w-5 h-5 transition-colors",
                isFilled 
                  ? "fill-text-primary text-text-primary" 
                  : "fill-transparent text-border-strong"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
