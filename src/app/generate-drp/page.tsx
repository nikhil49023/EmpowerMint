
'use client';

import {
  useState,
  useRef,
  useEffect,
  type ElementRef,
  Suspense,
  useCallback,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, User, Loader2, FileText } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { generateDprConversationAction } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  suggestions?: string[];
};

const getUniqueMessageId = () => `msg-${Date.now()}-${Math.random()}`;

function DRPGenerator() {
  const searchParams = useSearchParams();
  const idea = searchParams.get('idea') || 'my business idea';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<ElementRef<typeof ScrollArea>>(null);

  // Set initial messages on client-side to avoid hydration errors
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: getUniqueMessageId(),
        role: 'model',
        text: 'Hello! I am here to help you brainstorm and build a Detailed Project Report (DRP). To start, could you tell me a bit more about your business idea?',
        suggestions: [
          `Let's start with my idea: "${idea}"`,
          'What is a DRP?',
          'How does this work?',
        ],
      },
    ];
    setMessages(initialMessages);
  }, [idea]);

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

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

      const newUserMessage: Message = {
        id: getUniqueMessageId(),
        role: 'user',
        text: messageText,
      };

      // Clear suggestions from the last AI message and add the new user message
      setMessages(prev => {
        const newHistory = [...prev];
        const lastMessage = newHistory[newHistory.length - 1];
        if (lastMessage && lastMessage.role === 'model') {
          delete lastMessage.suggestions;
        }
        return [...newHistory, newUserMessage];
      });

      setInput('');
      setIsLoading(true);

      const conversationHistory = messages.map(m => ({
        role: m.role,
        text: m.text,
      }));
      conversationHistory.push({ role: 'user', text: messageText });

      const result = await generateDprConversationAction({
        idea,
        history: conversationHistory,
      });

      if (result.success) {
        const newAiMessage: Message = {
          id: getUniqueMessageId(),
          role: 'model',
          text: result.data.response,
          suggestions: result.data.suggestions,
        };
        setMessages(prev => [...prev, newAiMessage]);
      } else {
        const errorAiMessage: Message = {
          id: getUniqueMessageId(),
          role: 'model',
          text: "I'm sorry, but I'm having trouble connecting right now. Please try again in a moment.",
        };
        setMessages(prev => [...prev, errorAiMessage]);
      }

      setIsLoading(false);
    },
    [idea, isLoading, messages]
  );

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="flex flex-col h-full">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText /> Generate Detailed Project Report (DRP)
        </h1>
        <p className="text-muted-foreground">
          Brainstorm with our AI to build your comprehensive DRP.
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
                        message.role === 'user' ? 'justify-end' : ''
                      }`}
                    >
                      {message.role === 'model' && (
                        <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                          <AvatarFallback>
                            <Sparkles className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg p-3 max-w-md text-sm ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p>{message.text}</p>
                      </div>
                      {message.role === 'user' && (
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
        <div className="space-y-2">
          {lastMessage?.role === 'model' && lastMessage.suggestions && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap gap-2 justify-end"
              >
                {lastMessage.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage(suggestion)}
                    disabled={isLoading}
                  >
                    {suggestion}
                  </Button>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="relative"
          >
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Tell me about your project..."
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
    </div>
  );
}

export default function DRPPage() {
  return (
    <Suspense fallback={<p>Loading DRP Generator...</p>}>
      <DRPGenerator />
    </Suspense>
  );
}
