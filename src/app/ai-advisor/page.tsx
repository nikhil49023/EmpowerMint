
'use client';

import { useState, useRef, useEffect, type ElementRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, User, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { askAIAdvisorAction } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

const getUniqueMessageId = () => `msg-${Date.now()}-${Math.random()}`;

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<ElementRef<typeof ScrollArea>>(null);
  const [transactions] = useLocalStorage<ExtractedTransaction[]>(
    'transactions',
    []
  );

  useEffect(() => {
    // Generate a unique ID that is stable on the client
    const welcomeMessage: Message = {
      id: getUniqueMessageId(),
      text: "Hello! I'm your AI Financial Advisor. Ask me anything about personal finance, budgeting, or investing.",
      sender: 'ai',
    };
    setMessages([welcomeMessage]);
  }, []);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollableViewport = (
        scrollAreaRef.current.childNodes[0] as HTMLDivElement
      )?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollableViewport) {
        scrollableViewport.scrollTo({
          top: scrollableViewport.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMessage: Message = {
      id: getUniqueMessageId(),
      text: input,
      sender: 'user',
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    const result = await askAIAdvisorAction({ query: input, transactions });

    if (result.success) {
      const newAiMessage: Message = {
        id: getUniqueMessageId(),
        text: result.data.advice,
        sender: 'ai',
      };
      setMessages(prev => [...prev, newAiMessage]);
    } else {
      const errorAiMessage: Message = {
        id: getUniqueMessageId(),
        text: "I'm sorry, but I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorAiMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div>
        <h1 className="text-3xl font-bold">AI Financial Advisor</h1>
        <p className="text-muted-foreground">
          Your personal guide to financial clarity.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-4 mt-8">
        <Card className="flex-1 flex flex-col glassmorphic">
          <CardContent className="flex-1 flex flex-col p-6">
            <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-start gap-3 ${
                        message.sender === 'user' ? 'justify-end' : ''
                      }`}
                    >
                      {message.sender === 'ai' && (
                        <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                          <AvatarFallback>
                            <Sparkles className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg p-3 max-w-md text-sm ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p>{message.text}</p>
                      </div>
                      {message.sender === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-start gap-3"
                  >
                    <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                      <AvatarFallback>
                        <Sparkles className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 max-w-md">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <form onSubmit={handleSendMessage} className="relative">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about saving for retirement..."
            className="pr-12 h-12"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
