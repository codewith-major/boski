import React from 'react';
import { Card } from '../ui/Card';
import { PostIntent } from '../../pages/Post';
import { ResourceType } from '../../types';

interface TypeSelectorProps {
  intent: PostIntent;
  onSelect: (type: ResourceType) => void;
}

export function TypeSelector({ intent, onSelect }: TypeSelectorProps) {
  const isOffer = intent === 'offer';
  const title = isOffer ? 'What do you have?' : 'What do you need?';

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-display">{title}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => onSelect('ITEM')} className="text-left h-full">
          <Card className="p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-text-primary transition-colors bg-surface h-full">
            <h2 className="text-h3">ITEM</h2>
            <p className="text-body-sm text-text-secondary">
              {isOffer ? 'Physical things you can rent out' : 'Physical things you need to rent'}
            </p>
          </Card>
        </button>
        
        <button onClick={() => onSelect('SKILL')} className="text-left h-full">
          <Card className="p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-text-primary transition-colors bg-surface h-full">
            <h2 className="text-h3">SKILL</h2>
            <p className="text-body-sm text-text-secondary">
              {isOffer ? 'Teach or do something for someone' : 'Learn something or get skilled help'}
            </p>
          </Card>
        </button>

        {!isOffer && (
          <button onClick={() => onSelect('HELP')} className="text-left md:col-span-2 h-full">
            <Card className="p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-text-primary transition-colors bg-surface h-full">
              <h2 className="text-h3">HELP</h2>
              <p className="text-body-sm text-text-secondary">General assistance like a project partner or moving things</p>
            </Card>
          </button>
        )}
      </div>
    </div>
  );
}
