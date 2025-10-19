
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
import {
  Send,
  Sparkles,
  User,
  Loader2,
  FileText,
  Briefcase,
  CheckCircle,
  Pencil,
  BookCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { generateDprSectionAction } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/hooks/use-language';
import { FormattedText } from '@/components/financify/formatted-text';

type MessageRole = 'user' | 'model';

type Message = {
  id: string;
  role: MessageRole;
  text: string;
};

type ProjectDetails = {
  projectName: string;
  yourName: string;
  businessType: string;
  companyName: string;
};

type DprSection = {
  title: string;
  content: string;
  isCompleted: boolean;
};

const getUniqueMessageId = () => `msg-${Date.now()}-${Math.random()}`;

const dprSectionsConfig: Omit<DprSection, 'content' | 'isCompleted'>[] = [
  { title: 'Executive Summary' },
  { title: 'Project Introduction & Objective' },
  { title: 'Promoter/Entrepreneur Profile' },
  { title: 'Business Model & Project Details' },
  { title: 'Market Analysis' },
  { title: 'Location and Site Analysis' },
  { title: 'Technical Feasibility & Infrastructure' },
  { title: 'Implementation Schedule & Project Timeline' },
  { title: 'Financial Projections' },
  { title: 'SWOT Analysis' },
  { title: 'Regulatory & Statutory Compliance' },
  { title: 'Risk Assessment & Mitigation Strategy' },
  { title: 'Annexures' },
];

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

  const [dprSections, setDprSections] = useState<DprSection[]>(
    dprSectionsConfig.map(s => ({ ...s, content: '', isCompleted: false }))
  );
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true);
    handleSendMessage(
      `Let's start by generating the first section: **${dprSections[0].title}**`
    );
  };

  const getFullContext = useCallback(() => {
    let context = `Business Idea: ${idea}. Project Name: ${projectDetails.projectName}. Promoter: ${projectDetails.yourName}. Business Type: ${projectDetails.businessType}. Company: ${projectDetails.companyName}.`;
    messages.forEach(m => {
      context += `\n${m.role}: ${m.text}`;
    });
    return context;
  }, [idea, projectDetails, messages]);

  const handleGenerateReport = () => {
    // We can store the final report in a state management library or pass via query params if small enough
    // For now, let's just navigate to the report page with the idea
    const fullContext = getFullContext();
    router.push(`/dpr-report?idea=${encodeURIComponent(fullContext)}`);
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

      setMessages(prev => [...prev, newUserMessage]);
      setInput('');
      setIsLoading(true);

      const conversationHistory = [...messages, newUserMessage].map(m => ({
        role: m.role,
        text: m.text,
      }));

      const fullIdeaContext = `Business Idea: ${idea}. Project Name: ${projectDetails.projectName}. Promoter: ${projectDetails.yourName}. Business Type: ${projectDetails.businessType}. Company: ${projectDetails.companyName}.`;

      const result = await generateDprSectionAction({
        idea: fullIdeaContext,
        history: conversationHistory,
        sectionTitle: dprSections[currentSectionIndex].title,
        previousSections: dprSections
          .slice(0, currentSectionIndex)
          .map(s => ({ title: s.title, content: s.content })),
      });

      if (result.success) {
        const { sectionContent, followupQuestion } = result.data;
        const currentSection = dprSections[currentSectionIndex];
        setDprSections(prev =>
          prev.map((s, i) =>
            i === currentSectionIndex ? { ...s, content: sectionContent } : s
          )
        );

        const newAiMessage: Message = {
          id: getUniqueMessageId(),
          role: 'model',
          text: followupQuestion,
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
    [
      idea,
      isLoading,
      messages,
      projectDetails,
      translations,
      dprSections,
      currentSectionIndex,
    ]
  );

  const handleAcceptAndContinue = () => {
    const nextIndex = currentSectionIndex + 1;
    if (nextIndex < dprSections.length) {
      setDprSections(prev =>
        prev.map((s, i) =>
          i === currentSectionIndex ? { ...s, isCompleted: true } : s
        )
      );
      setCurrentSectionIndex(nextIndex);
      handleSendMessage(
        `Great. Now, let's generate the next section: **${dprSections[nextIndex].title}**`
      );
    } else {
      // Last section completed
      setDprSections(prev =>
        prev.map((s, i) =>
          i === currentSectionIndex ? { ...s, isCompleted: true } : s
        )
      );
      // You might want to show a summary or final message here
    }
  };
  
  const currentSection = dprSections[currentSectionIndex];
  const allSectionsCompleted = dprSections.every(s => s.isCompleted);


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
                  <Label htmlFor="projectName">
                    {translations.generateDRP.form.projectNameLabel}
                  </Label>
                  <Input
                    id="projectName"
                    value={projectDetails.projectName}
                    onChange={e =>
                      setProjectDetails({
                        ...projectDetails,
                        projectName: e.target.value,
                      })
                    }
                    placeholder={
                      translations.generateDRP.form.projectNamePlaceholder
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yourName">
                      {translations.generateDRP.form.yourNameLabel}
                    </Label>
                    <Input
                      id="yourName"
                      value={projectDetails.yourName}
                      onChange={e =>
                        setProjectDetails({
                          ...projectDetails,
                          yourName: e.target.value,
                        })
                      }
                      placeholder={
                        translations.generateDRP.form.yourNamePlaceholder
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">
                      {translations.generateDRP.form.businessTypeLabel}
                    </Label>
                    <Input
                      id="businessType"
                      value={projectDetails.businessType}
                      onChange={e =>
                        setProjectDetails({
                          ...projectDetails,
                          businessType: e.target.value,
                        })
                      }
                      placeholder={
                        translations.generateDRP.form.businessTypePlaceholder
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    {translations.generateDRP.form.companyNameLabel}
                  </Label>
                  <Input
                    id="companyName"
                    value={projectDetails.companyName}
                    onChange={e =>
                      setProjectDetails({
                        ...projectDetails,
                        companyName: e.target.value,
                      })
                    }
                    placeholder={
                      translations.generateDRP.form.companyNamePlaceholder
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Briefcase className="mr-2" />{' '}
                  {translations.generateDRP.form.startBrainstorming}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-8 @container">
      {/* Left Panel: Sections */}
      <Card className="hidden @3xl:block w-1/3 glassmorphic">
        <CardHeader>
          <CardTitle>DPR Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {dprSections.map((section, index) => (
              <li
                key={index}
                className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                  index === currentSectionIndex
                    ? 'bg-accent text-accent-foreground'
                    : ''
                }`}
              >
                {section.isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : index === currentSectionIndex ? (
                  <Pencil className="h-5 w-5 text-primary animate-pulse" />
                ) : (
                  <BookCheck className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="font-medium">{section.title}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Right Panel: Chat and Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText /> {translations.generateDRP.title}
            </h1>
            <p className="text-muted-foreground">
              {translations.generateDRP.description.replace(
                '{projectName}',
                projectDetails.projectName
              )}
            </p>
          </div>
          <Button onClick={handleGenerateReport} disabled={!allSectionsCompleted}>
            <Sparkles className="mr-2" />
            Compile Full Report
          </Button>
        </div>

        <div className="flex-1 grid grid-cols-1 @4xl:grid-cols-2 gap-4">
          {/* Content Display */}
          <Card className="flex flex-col glassmorphic">
            <CardHeader>
              <CardTitle>
                {currentSection?.title || 'DPR Content'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {isLoading && !currentSection.content ? (
                 <div className="space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating...</p>
                 </div>
              ) : (
                <FormattedText text={currentSection.content} />
              )}
            </CardContent>
            <CardContent>
              {!allSectionsCompleted && (
                <div className="flex gap-2">
                <Button
                  onClick={handleAcceptAndContinue}
                  disabled={isLoading || !currentSection.content}
                >
                  <CheckCircle className="mr-2" />
                  Accept & Continue
                </Button>
              </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Interface */}
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
                          <p
                            dangerouslySetInnerHTML={{
                              __html: message.text.replace(
                                /\*\*(.*?)\*\*/g,
                                '<strong>$1</strong>'
                              ),
                            }}
                          />
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
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage(`Revision request: ${input}`);
                }}
                className="relative mt-4"
              >
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Suggest a revision..."
                  className="pr-12 h-12"
                  disabled={isLoading || !currentSection.content || allSectionsCompleted}
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
            </CardContent>
          </Card>
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
