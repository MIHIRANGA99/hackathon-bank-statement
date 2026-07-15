import React from 'react';
import { X, Bot } from 'lucide-react';
import { Button } from '../ui/button';
import { MessageArea } from './MessageArea';
import { InputArea } from './InputArea';
import { cn } from '@/lib/utils';

export function ChatWindow({
  isOpen,
  onClose,
  messages,
  input,
  setInput,
  isLoading,
  sendMessage,
  retryLastMessage
}) {
  return (
    <div
      role="dialog"
      aria-label="Financial Chatbot Window"
      className={cn(
        "fixed right-6 bottom-24 z-50 flex flex-col bg-background border border-border shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 origin-bottom-right transform",
        isOpen
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-4 scale-95 pointer-events-none",
        "w-[380px] h-[550px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border dark:bg-card">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <Bot className="size-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground leading-tight">Financial Assistant</h2>
            <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground h-7 w-7 rounded-md cursor-pointer"
        >
          <X className="size-4" />
          <span className="sr-only">Close chat</span>
        </Button>
      </div>

      {/* Message Area */}
      <MessageArea
        messages={messages}
        isLoading={isLoading}
        onRetry={retryLastMessage}
      />

      {/* Input Area */}
      <InputArea
        input={input}
        setInput={setInput}
        onSubmit={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}
