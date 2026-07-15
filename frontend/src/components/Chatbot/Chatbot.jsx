import React, { useState } from 'react';
import { MessageSquare, Bot } from 'lucide-react';
import { useChat } from './useChat';
import { ChatWindow } from './ChatWindow';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export default function Chatbot({ sessionId: propSessionId }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const chatProps = useChat(propSessionId);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Floating Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        {...chatProps}
      />

      {/* Floating Action Button (FAB) */}
      <Button
        onClick={toggleChat}
        aria-expanded={isOpen}
        aria-label="Toggle Financial Assistant chat"
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border border-primary/20",
          isOpen
            ? "bg-muted text-foreground border-border hover:bg-muted/80 size-12"
            : "bg-primary text-primary-foreground hover:bg-primary/90 size-14"
        )}
      >
        {isOpen ? (
          <Bot className="size-6 text-foreground animate-pulse" />
        ) : (
          <MessageSquare className="size-6 animate-pulse" />
        )}
      </Button>
    </>
  );
}
export { Chatbot };
