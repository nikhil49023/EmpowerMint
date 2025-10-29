
'use client';

import { useState, useRef, useEffect, type ElementRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, User, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import { useAuth } from '@/context/auth-provider';
import { useLanguage } from '@/hooks/use-language';
import { getFirestore, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

type AIAdvisorChatProps = {
  initialMessage?: string;
};

const getUniqueMessageId = () => `msg-${Date.now()}-${Math.random()}`;

export default function AIAdvisorChat({
  initialMessage,
}: AIAdvisorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<ElementRef<typeof ScrollArea>>(null);

  const { user, loading: loadingAuth } = useAuth();
  const [transactions, setTransactions] = useState<ExtractedTransaction[]>([]);
  const { translations } = useLanguage();

  useEffect(() => {
    if (user) {
        const transactionsRef = collection(db, 'users', user.uid, 'transactions');
        // Get the last 20 transactions to use as context
        const q = query(transactionsRef, orderBy('date', 'desc'), limit(20));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map(doc => doc.data()) as ExtractedTransaction[];
            setTransactions(fetchedTransactions);
        });
        return () => unsubscribe();
    }
  }, [user]);


  useEffect(() => {
    const welcomeMessage: Message = {
      id: getUniqueMessageId(),
      text: translations.aiAdvisor.welcome,
      sender: 'ai',
    };

    const initialUserMessage: Message | null = initialMessage
      ? {
          id: getUniqueMessageId(),
          text: initialMessage,
          sender: 'user',
        }
      : null;

    const messageList = [welcomeMessage];
    if (initialUserMessage) {
      messageList.push(initialUserMessage);
    }
    setMessages(messageList);

    if (initialUserMessage) {
      handleSendMessage(undefined, initialUserMessage.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translations, initialMessage]);

  const scrollToBottom = () => {
    setTimeout(() => {
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
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (
    e?: React.FormEvent,
    messageText?: string
  ) => {
    e?.preventDefault();
    const queryText = messageText || input;
    if (!queryText.trim() || isLoading) return;

    if (!messageText) {
      const newUserMessage: Message = {
        id: getUniqueMessageId(),
        text: queryText,
        sender: 'user',
      };
      setMessages(prev => [...prev, newUserMessage]);
    }

    setInput('');
    setIsLoading(true);

    try {
        const response = await fetch('/api/rag-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: queryText, transactions: transactions })
        });
        
        const result = await response.json();

        if (response.ok) {
            const newAiMessage: Message = {
                id: getUniqueMessageId(),
                text: result.answer,
                sender: 'ai',
            };
            setMessages(prev => [...prev, newAiMessage]);
        } else {
            throw new Error(result.message || 'Failed to get a response from the AI.');
        }

    } catch (error) {
        console.error('Error calling RAG API:', error);
        const errorAiMessage: Message = {
            id: getUniqueMessageId(),
            text: translations.aiAdvisor.error,
            sender: 'ai',
        };
        setMessages(prev => [...prev, errorAiMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-6 p-4 sm:p-6">
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
                  className={`rounded-lg p-3 max-w-sm text-sm ${
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
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="relative flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={translations.aiAdvisor.inputPlaceholder}
            className="h-11"
            disabled={isLoading || (!user && !loadingAuth)}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 flex-shrink-0"
            disabled={isLoading || !input.trim() || (!user && !loadingAuth)}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
