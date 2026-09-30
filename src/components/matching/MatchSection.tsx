import React from 'react';
import { MatchResult } from '../../lib/matching';
import { MatchCard } from './MatchCard';

export interface MatchSectionProps {
  title: string;
  description?: string;
  matches: MatchResult[];
  emptyMessage?: string;
}

export function MatchSection({ title, description, matches, emptyMessage }: MatchSectionProps) {
  if (matches.length === 0) {
    if (!emptyMessage) return null;
    
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-h3 uppercase tracking-widest text-text-secondary">{title}</h2>
        <div className="bg-surface-subtle border border-dashed border-border-subtle rounded-xl p-6 text-center">
          <p className="text-body text-text-secondary">{emptyMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3 uppercase tracking-widest text-text-secondary">{title}</h2>
        {description && <p className="text-body-sm text-text-secondary">{description}</p>}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {matches.slice(0, 4).map((match) => (
          <MatchCard key={match.resource.id} match={match} />
        ))}
      </div>
    </section>
  );
}
