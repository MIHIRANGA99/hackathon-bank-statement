import React, { useEffect, useRef } from 'react';
import { Bot, User, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MessageArea({ messages, isLoading, onRetry }) {
  const bottomRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-zinc-950/20 scrollbar-thin">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2 select-none">
          <Bot className="size-10 text-primary/45" />
          <h3 className="font-semibold text-foreground/80">Financial Assistant</h3>
          <p className="text-xs max-w-[240px]">
            Ask me questions about your transaction summaries, recurring payments, income consistency, and more.
          </p>
        </div>
      ) : (
        messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-2.5 max-w-[85%]",
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar Icon */}
              <div
                className={cn(
                  "size-7 rounded-full flex items-center justify-center shrink-0 border text-xs shadow-sm",
                  isUser
                    ? "bg-primary text-primary-foreground border-primary"
                    : msg.isError
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col space-y-1">
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2 text-sm shadow-sm leading-relaxed whitespace-pre-wrap break-words",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : msg.isError
                      ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-none font-medium"
                      : "bg-card text-foreground border border-border/80 rounded-tl-none"
                  )}
                >
                  {msg.isError ? (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      <span>{msg.content}</span>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>

                {/* Optional Retry Button for Error Messages */}
                {msg.isError && onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors mt-1 pl-1 cursor-pointer w-fit"
                  >
                    <RefreshCw className="size-3" />
                    Retry prompt
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Typing Indicator */}
      {isLoading && (
        <div className="flex items-start gap-2.5 mr-auto max-w-[85%]">
          <div className="size-7 rounded-full flex items-center justify-center shrink-0 border bg-muted text-muted-foreground border-border shadow-sm">
            <Bot className="size-3.5" />
          </div>
          <div className="bg-card border border-border/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center justify-center">
            <div className="flex gap-1 items-center">
              <div className="size-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="size-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="size-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
