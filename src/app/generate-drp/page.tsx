
'use client';

import {
  useState,
  useRef,
  useEffect,
  type ElementRef,
  Suspense,
  useCallback,
} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Sparkles, User, Loader2, FileText, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { generateDprConversationAction } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/hooks/use-language';

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  suggestions?: string[];
};

type ProjectDetails = {
  projectName: string;
  yourName: string;
  businessType: string;
  companyName: string;
};

const getUniqueMessageId = () => `msg-${Date.now()}-${Math.random()}`;

function DRPGenerator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idea = searchParams.get('idea') || 'my business idea';
  const { translations } = useLanguage();

  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    projectName: idea,
    yourName: '',
    businessType: '',
    companyName: '',
  });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<ElementRef<typeof ScrollArea>>(null);

  const getFullContext = useCallback(() => {
    let context = `Business Idea: ${idea}. Project Name: ${projectDetails.projectName}. Promoter: ${projectDetails.yourName}. Business Type: ${projectDetails.businessType}. Company: ${projectDetails.companyName}.`;
    messages.forEach(m => {
      context += `\n${m.role}: ${m.text}`;
    });
    return context;
  }, [idea, projectDetails, messages]);

  const handleGenerateReport = () => {
    const fullIdeaContext = getFullContext();
    router.push(`/dpr-report?idea=${encodeURIComponent(fullIdeaContext)}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true);
    const initialMessages: Message[] = [
      {
        id: getUniqueMessageId(),
        role: 'model',
        text: translations.generateDRP.chat.welcome.replace('{projectName}', projectDetails.projectName),
        suggestions: [
          translations.generateDRP.chat.welcomeSuggestion1.replace('{idea}', idea),
          translations.generateDRP.chat.welcomeSuggestion2,
          translations.generateDRP.chat.welcomeSuggestion3,
        ],
      },
    ];
    setMessages(initialMessages);
  };

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

      const fullIdeaContext = `Business Idea: ${idea}. Project Name: ${projectDetails.projectName}. Promoter: ${projectDetails.yourName}. Business Type: ${projectDetails.businessType}. Company: ${projectDetails.companyName}.`;

      const result = await generateDprConversationAction({
        idea: fullIdeaContext,
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
          text: translations.generateDRP.chat.error,
        };
        setMessages(prev => [...prev, errorAiMessage]);
      }

      setIsLoading(false);
    },
    [idea, isLoading, messages, projectDetails, translations]
  );

  const lastMessage = messages[messages.length - 1];

  if (!isFormSubmitted) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText /> {translations.generateDRP.form.title}
              </CardTitle>
              <CardDescription>
                {translations.generateDRP.form.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">{translations.generateDRP.form.projectNameLabel}</Label>
                  <Input
                    id="projectName"
                    value={projectDetails.projectName}
                    onChange={e =>
                      setProjectDetails({ ...projectDetails, projectName: e.target.value })
                    }
                    placeholder={translations.generateDRP.form.projectNamePlaceholder}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yourName">{translations.generateDRP.form.yourNameLabel}</Label>
                    <Input
                      id="yourName"
                      value={projectDetails.yourName}
                      onChange={e =>
                        setProjectDetails({ ...projectDetails, yourName: e.target.value })
                      }
                      placeholder={translations.generateDRP.form.yourNamePlaceholder}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">{translations.generateDRP.form.businessTypeLabel}</Label>
                    <Input
                      id="businessType"
                      value={projectDetails.businessType}
                      onChange={e =>
                        setProjectDetails({ ...projectDetails, businessType: e.target.value })
                      }
                      placeholder={translations.generateDRP.form.businessTypePlaceholder}
                      required
                    />
                  </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="companyName">{translations.generateDRP.form.companyNameLabel}</Label>
                  <Input
                    id="companyName"
                    value={projectDetails.companyName}
                    onChange={e =>
                      setProjectDetails({ ...projectDetails, companyName: e.target.value })
                    }
                    placeholder={translations.generateDRP.form.companyNamePlaceholder}
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Briefcase className="mr-2" /> {translations.generateDRP.form.startBrainstorming}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText /> {translations.generateDRP.title}
            </h1>
            <p className="text-muted-foreground">
            {translations.generateDRP.description.replace('{projectName}', projectDetails.projectName)}
            </p>
        </div>
        <Button onClick={handleGenerateReport} disabled={messages.length < 2}>
            <Sparkles className="mr-2" />
            Generate Full Report
        </Button>
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
                        <p dangerouslySetInnerHTML={{ __html: message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
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
              placeholder={translations.generateDRP.chat.inputPlaceholder}
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
  const { translations } = useLanguage();
  return (
    <Suspense fallback={<p>{translations.generateDRP.loading}</p>}>
      <DRPGenerator />
    </Suspense>
  );
}
