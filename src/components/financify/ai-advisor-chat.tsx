
'use client';

import { useState, useRef, useEffect, type ElementRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, User, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { askAIAdvisorAction } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import { useLanguage } from '@/hooks/use-language';
import { usePathname } from 'next/navigation';

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
  const [user, loadingAuth] = useAuthState(auth);
  const [transactions, setTransactions] = useState<ExtractedTransaction[]>([]);
  const { translations } = useLanguage();
  const pathname = usePathname();

  const useTransactionContext = !pathname.includes('/generate-dpr');

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

  useEffect(() => {
    if (user && useTransactionContext) {
      const transCollectionRef = collection(db, 'users', user.uid, 'transactions');
      const q = query(transCollectionRef);
      const unsubscribe = onSnapshot(
        q,
        querySnapshot => {
          const transactionsData = querySnapshot.docs.map(
            doc => doc.data() as ExtractedTransaction
          );
          setTransactions(transactionsData);
        },
        async serverError => {
          const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/transactions`,
            operation: 'list',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        }
      );
      return () => unsubscribe();
    }
  }, [user, useTransactionContext]);

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

    const result = await askAIAdvisorAction({
      query: queryText,
      transactions: useTransactionContext ? transactions : [],
    });

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
        <div className="space-y-6 p-6">
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
        <form onSubmit={handleSendMessage} className="relative">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={translations.aiAdvisor.inputPlaceholder}
            className="pr-12 h-12"
            disabled={isLoading || (!user && !loadingAuth)}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9"
            disabled={isLoading || !input.trim() || (!user && !loadingAuth)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
