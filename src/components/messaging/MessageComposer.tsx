import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface MessageComposerProps {
  onSend: (body: string) => Promise<void> | void;
  disabled?: boolean;
}

const MAX_MESSAGE_LENGTH = 10000;

export function MessageComposer({ onSend, disabled }: MessageComposerProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const trimmed = text.trim();
  const isOverLimit = text.length > MAX_MESSAGE_LENGTH;
  const canSend = !disabled && !isSending && trimmed.length > 0 && !isOverLimit;

  const handleSend = async () => {
    if (!canSend) return;
    setSendError(null);
    setIsSending(true);

    try {
      await onSend(trimmed);
      setText(''); // Clear only after confirmed send
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setSendError(err?.message || 'Failed to send message. Please retry.');
      // Input is safely preserved so user never loses their drafted message
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {sendError && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded bg-red-50 border border-red-200 text-red-700 text-caption">
          <span>{sendError}</span>
          <button 
            type="button" 
            onClick={() => setSendError(null)}
            className="text-red-700 font-bold hover:underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          className="flex-1 bg-surface-subtle border border-border-subtle rounded-md px-4 py-3 text-body-sm focus:outline-none focus:border-ink resize-none disabled:opacity-50"
          rows={1}
          placeholder={disabled ? "Messaging unavailable" : "Write a message..."}
          value={text}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={e => {
            setText(e.target.value);
            if (sendError) setSendError(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          aria-label="Message text"
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        <Button 
          variant="primary" 
          onClick={handleSend} 
          disabled={!canSend}
          aria-label="Send message"
          className="shrink-0 h-[48px]"
        >
          {isSending ? 'SENDING...' : 'SEND →'}
        </Button>
      </div>

      {text.length > 8000 && (
        <div className="flex justify-end px-1">
          <span className={`text-caption ${isOverLimit ? 'text-red-600 font-bold' : 'text-text-muted'}`}>
            {text.length.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
