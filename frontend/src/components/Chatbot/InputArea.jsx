import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/button';

export function InputArea({ input, setInput, onSubmit, isLoading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-border bg-card p-3 dark:bg-card"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isLoading ? "Waiting for assistant..." : "Ask a question about your statement..."}
        disabled={isLoading}
        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <Button
        type="submit"
        size="icon"
        disabled={isLoading || !input.trim()}
        className="bg-primary hover:bg-primary/95 text-primary-foreground h-9 w-9 shrink-0 flex items-center justify-center rounded-md"
      >
        <Send className="size-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
