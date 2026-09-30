import React from 'react';
import { Card } from '../ui/Card';
import { PostIntent } from '../../pages/Post';

interface IntentSelectorProps {
  onSelect: (intent: PostIntent) => void;
}

export function IntentSelector({ onSelect }: IntentSelectorProps) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-display">What are you doing?</h1>
        <p className="text-body text-text-secondary">Are you sharing something you have or looking for something you need?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => onSelect('offer')}
          className="text-left"
        >
          <Card className="p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-text-primary transition-colors bg-surface h-full">
            <h2 className="text-h3">I HAVE SOMETHING</h2>
            <p className="text-body-sm text-text-secondary">Offer an item or a skill</p>
          </Card>
        </button>
        
        <button 
          onClick={() => onSelect('request')}
          className="text-left"
        >
          <Card className="p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-text-primary transition-colors bg-surface h-full">
            <h2 className="text-h3">I NEED SOMETHING</h2>
            <p className="text-body-sm text-text-secondary">Request an item, skill, or help</p>
          </Card>
        </button>
      </div>
    </div>
  );
}
