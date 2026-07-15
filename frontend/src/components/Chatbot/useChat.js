import { useState, useCallback, useRef } from 'react';

// Determine API base URL. Fallback to localhost:4000 if not provided
const API_BASE = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.origin.includes('localhost') 
    ? 'http://localhost:4000' 
    : '');

export function useChat(initialSessionId) {
  // Generate or retrieve session ID
  const [sessionId] = useState(() => {
    if (initialSessionId) return initialSessionId;
    
    const stored = sessionStorage.getItem('financial_chat_session_id');
    if (stored) return stored;
    
    // Generate simple unique ID
    const newId = `session_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    sessionStorage.setItem('financial_chat_session_id', newId);
    return newId;
  });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep a ref to the last user question for retry functionality
  const lastQuestionRef = useRef(null);

  const sendMessage = useCallback(async (questionText) => {
    const trimmed = questionText?.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setInput('');
    setIsLoading(true);
    lastQuestionRef.current = trimmed;

    // Add user message to history
    const userMessageId = `msg_user_${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);

    // Create a temporary ID for the assistant response
    const assistantMessageId = `msg_assistant_${Date.now()}`;

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          question: trimmed
        }),
      });

      if (!response.ok) {
        let errorMessage = 'An error occurred while processing your request.';
        try {
          const errData = await response.json();
          errorMessage = errData.error || errData.message || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const answer = data.answer || data.response || data.message || data.text || 'No response details received.';

      const assistantMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: answer,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat API Error:', err);
      const errorMessage = err.message || 'Failed to connect to the chatbot service. Please try again.';
      
      // Store the error state
      setError(errorMessage);

      // Append an error message block into the chat history so the user sees it inline
      const errorMsgItem = {
        id: `msg_error_${Date.now()}`,
        role: 'assistant',
        content: errorMessage,
        isError: true,
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, errorMsgItem]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading]);

  const retryLastMessage = useCallback(() => {
    if (lastQuestionRef.current && !isLoading) {
      sendMessage(lastQuestionRef.current);
    }
  }, [sendMessage, isLoading]);

  return {
    sessionId,
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    retryLastMessage
  };
}
