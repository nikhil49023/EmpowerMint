
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FileText,
  Loader2,
  ArrowLeft,
  Check,
  ChevronsRight,
  Send,
  Sparkles,
  User,
  MessageSquare,
  X,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedText } from '@/components/financify/formatted-text';
import Link from 'next/link';
import { generateDprSectionAction, generateDprFromAnalysisAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/schemas/investment-idea-analysis';

const dprChapterTitles = [
  'Executive Summary',
  'Project Introduction',
  'Promoter Details',
  'Business Model',
  'Market Analysis',
  'Location and Site',
  'Technical Feasibility',
  'Implementation Schedule',
  'Financial Projections',
  'SWOT Analysis',
  'Regulatory Compliance',
  'Risk Assessment',
  'Annexures',
];

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

const getUniqueMessageId = () => `msg-${Date.now()}-${Math.random()}`;

function GenerateDPRContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const idea = searchParams.get('idea');
  const promoterName = searchParams.get('name');

  const [analysis, setAnalysis] =
    useState<GenerateInvestmentIdeaAnalysisOutput | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [generatedSections, setGeneratedSections] = useState<
    Record<string, string>
  >({});
  const [currentSectionContent, setCurrentSectionContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSubmittingChat, setIsSubmittingChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [useFullAnalysisFlow, setUseFullAnalysisFlow] = useState(false);

  useEffect(() => {
    const analysisDataString = localStorage.getItem('dprAnalysis');
    if (analysisDataString) {
      const parsedAnalysis = JSON.parse(analysisDataString);
      setAnalysis(parsedAnalysis);
      setUseFullAnalysisFlow(true); // We have the full analysis, so we'll use the corresponding flow
    } else if (idea) {
      // Fallback if localStorage fails or is not available
      setUseFullAnalysisFlow(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load project idea. Please go back and try again.',
      });
      return;
    }
    
    // Auto-generate the first section on load
    if(idea) {
        generateSection(0, idea, promoterName || 'Entrepreneur');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idea, promoterName]);

  const generateSection = async (
    sectionIndex: number,
    baseIdea: string,
    promoter: string,
    revisionRequest?: string
  ) => {
    const targetSection = dprChapterTitles[sectionIndex];
    setIsGenerating(true);
    if (!revisionRequest) {
      setCurrentSectionContent('');
    }

    try {
      const previousSections = dprChapterTitles
        .slice(0, sectionIndex)
        .reduce((acc, title) => {
          acc[title] = generatedSections[title];
          return acc;
        }, {} as Record<string, string>);

      const result = await generateDprSectionAction({
        idea: baseIdea,
        promoterName: promoter,
        targetSection,
        previousSections,
        revisionRequest: revisionRequest
          ? {
              originalText: currentSectionContent,
              feedback: revisionRequest,
            }
          : undefined,
      });


      if (result.success) {
        setCurrentSectionContent(result.data.content);
        if (revisionRequest) {
          const aiMessage: Message = {
            id: getUniqueMessageId(),
            sender: 'ai',
            text: 'Here is the revised section. Let me know if you have more changes.',
          };
          setChatMessages(prev => [...prev, aiMessage]);
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error generating section',
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An unexpected error occurred',
        description: 'Please try again later.',
      });
    } finally {
      setIsGenerating(false);
      setIsSubmittingChat(false);
    }
  };

  const handleAcceptAndContinue = () => {
    const currentSectionTitle = dprChapterTitles[currentSectionIndex];
    const finalContent = currentSectionContent;
    
    const newGeneratedSections = {
      ...generatedSections,
      [currentSectionTitle]: finalContent,
    };
    setGeneratedSections(newGeneratedSections);

    if (currentSectionIndex < dprChapterTitles.length - 1) {
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      generateSection(nextIndex, analysis?.title || idea || '', promoterName || 'Entrepreneur');
    } else {
      // All sections are done
      localStorage.setItem('finalDPR', JSON.stringify(newGeneratedSections));
      router.push('/dpr-report');
    }
  };

  const handleOpenChat = () => {
    setChatMessages([
      {
        id: getUniqueMessageId(),
        sender: 'ai',
        text: `I'm ready to revise the "${dprChapterTitles[currentSectionIndex]}" section. What changes would you like me to make?`,
      },
    ]);
    setIsChatOpen(true);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      id: getUniqueMessageId(),
      sender: 'user',
      text: chatInput,
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsSubmittingChat(true);

    await generateSection(currentSectionIndex, analysis?.title || idea || '', promoterName || 'Entrepreneur', chatInput);
    setChatInput('');
  };

  if (!idea || !promoterName) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">
          Project details not found. Please start from the investment idea page.
        </p>
        <Button asChild className="mt-4">
          <Link href="/brainstorm">Go to Brainstorm</Link>
        </Button>
      </div>
    );
  }

  const isFinalSection =
    currentSectionIndex === dprChapterTitles.length - 1;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText />
            Interactive DPR Generator
          </h1>
          <p className="text-muted-foreground">
            Generating report for: <span className="font-semibold">{analysis?.title || idea}</span>
          </p>
        </div>
        <Button variant="ghost" asChild className="-ml-4">
          <Link href={`/investment-ideas/custom?idea=${encodeURIComponent(analysis?.title || idea || '')}`}>
            <ArrowLeft className="mr-2" />
            Back to Analysis
          </Link>
        </Button>
      </div>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>
            Section {currentSectionIndex + 1} of {dprChapterTitles.length}:{' '}
            {dprChapterTitles[currentSectionIndex]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isGenerating && !currentSectionContent ? (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Generating section...</p>
            </div>
          ) : (
            <FormattedText text={currentSectionContent} />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleOpenChat}
          disabled={isGenerating || !currentSectionContent}
        >
          <MessageSquare className="mr-2" /> Request Changes
        </Button>
        <Button
          onClick={handleAcceptAndContinue}
          disabled={isGenerating || !currentSectionContent}
        >
          {isFinalSection ? (
            <>
              <Eye className="mr-2" /> View Final Report
            </>
          ) : (
            <>
              Accept and Continue <ChevronsRight className="ml-2" />
            </>
          )}
        </Button>
      </div>

      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-2xl h-[70vh] flex flex-col p-0 glassmorphic">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Revise Section</DialogTitle>
            <DialogDescription>
              Tell me what you'd like to change about the "
              {dprChapterTitles[currentSectionIndex]}" section.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="space-y-6 p-4">
              <AnimatePresence>
                {chatMessages.map(message => (
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
                      <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                        <Sparkles className="h-5 w-5" />
                      </div>
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
                       <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isSubmittingChat && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex items-start gap-3"
                >
                   <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 max-w-md">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t">
            <form onSubmit={handleSendChatMessage} className="w-full flex gap-2">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="e.g., 'Make the tone more formal...'"
                disabled={isSubmittingChat}
              />
              <Button type="submit" size="icon" disabled={isSubmittingChat || !chatInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GenerateDPRPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center h-full text-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <h2 className="text-xl font-semibold">Loading DPR Generator...</h2>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      }
    >
      <GenerateDPRContent />
    </Suspense>
  );
}
