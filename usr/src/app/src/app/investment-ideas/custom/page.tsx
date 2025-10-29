
'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  Briefcase,
  Target,
  TrendingUp,
  Shield,
  Save,
  CheckCircle,
  Loader2,
  ChevronsRight,
  Landmark,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/schemas/investment-idea-analysis';
import { FormattedText } from '@/components/financify/formatted-text';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { Badge } from '@/components/ui/badge';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

type SavedIdea = GenerateInvestmentIdeaAnalysisOutput & {
  savedAt: any;
};

type AnalysisSection = {
  key: keyof Omit<GenerateInvestmentIdeaAnalysisOutput, 'title' | 'summary'>;
  title: string;
  icon: React.ElementType;
  content: string | null;
  status: 'pending' | 'loading' | 'done';
};

const sectionConfig: Omit<AnalysisSection, 'content' | 'status'>[] = [
  { key: 'investmentStrategy', title: 'Investment Strategy', icon: Briefcase },
  { key: 'targetAudience', title: 'Target Audience', icon: Target },
  { key: 'roi', title: 'Return on Investment (ROI)', icon: TrendingUp },
  { key: 'futureProofing', title: 'Future Proofing', icon: Shield },
  { key: 'relevantSchemes', title: 'Relevant Government Schemes', icon: Landmark },
];


function InvestmentIdeaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idea = searchParams.get('idea');
  
  const [title, setTitle] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [sections, setSections] = useState<AnalysisSection[]>(
    sectionConfig.map(s => ({ ...s, content: null, status: 'pending' }))
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { translations } = useLanguage();

  const handleBuildDpr = () => {
    if (!title || !user) return;
    
    const fullAnalysis: Partial<GenerateInvestmentIdeaAnalysisOutput> = sections.reduce((acc, section) => {
        if(section.content) {
            acc[section.key] = section.content;
        }
        return acc;
    }, { title, summary } as Partial<GenerateInvestmentIdeaAnalysisOutput>);

    localStorage.setItem('dprAnalysis', JSON.stringify(fullAnalysis));
    router.push(
      `/generate-dpr?idea=${encodeURIComponent(
        title
      )}&name=${encodeURIComponent(user?.displayName || 'Entrepreneur')}`
    );
  };
  
  const saveAnalysis = useCallback(
    async (fullAnalysis?: GenerateInvestmentIdeaAnalysisOutput) => {
      if (!user || !title) return;
      setIsSaving(true);
      
      const analysisToSave = fullAnalysis || sections.reduce((acc, section) => {
        if (section.content) {
          acc[section.key] = section.content;
        }
        return acc;
      }, { title, summary } as Partial<GenerateInvestmentIdeaAnalysisOutput>);

      try {
        const ideasRef = collection(db, 'users', user.uid, 'savedIdeas');
        await addDoc(ideasRef, {
            ...analysisToSave,
            savedAt: serverTimestamp()
        });
        setIsSaved(true);
        toast({
            title: translations.investmentIdea._TITLE,
            description: translations.investmentIdea.ideaSavedSuccess,
        });
      } catch (e) {
        console.error("Error saving idea: ", e);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save the idea. Please try again."
        });
      } finally {
        setIsSaving(false);
      }
    },
    [user, toast, translations, sections, title, summary]
  );

  useEffect(() => {
    const fetchOrGenerateAnalysis = async () => {
      if (!idea) {
        setError(translations.investmentIdea.errorNoIdea);
        return;
      }
      if (!user) {
         router.push('/');
        return;
      }

      setError(null);
      setSections(prev => prev.map(s => ({ ...s, status: 'loading' })));

      try {
        // Check if analysis is already saved in Firestore
        const ideasRef = collection(db, 'users', user.uid, 'savedIdeas');
        const q = query(ideasRef, where("title", "==", idea));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const savedData = querySnapshot.docs[0].data() as GenerateInvestmentIdeaAnalysisOutput;
            setTitle(savedData.title);
            setSummary(savedData.summary);
            setSections(prev =>
                prev.map(s => ({
                    ...s,
                    content: savedData[s.key] as string,
                    status: 'done',
                }))
            );
            setIsSaved(true);
            return; // Exit if found in DB
        }

        // If not found in DB, generate new analysis
        const response = await fetch('/api/investment-idea-analysis', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ idea })
        });

        const result = await response.json();

        if (response.ok) {
            const fullAnalysis = result;
            setTitle(fullAnalysis.title);
            setSummary(fullAnalysis.summary);

            setSections(prev =>
                prev.map(s => ({
                    ...s,
                    content: fullAnalysis[s.key] as string,
                    status: 'done',
                }))
            );
            
            // Automatically save the newly generated analysis
            if (!isSaved) {
                await saveAnalysis(fullAnalysis);
            }
        } else {
            throw new Error(result.message || 'Failed to generate analysis');
        }
      } catch (err: any) {
        setError(err.message);
        setSections(prev => prev.map(s => ({ ...s, status: 'pending' })));
      }
    };

    fetchOrGenerateAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idea, user]);

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive font-semibold">
          {translations.investmentIdea.errorOccurred}
        </p>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const allSectionsLoaded = sections.every(s => s.status === 'done');

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex justify-between items-start gap-4">
        <Button variant="ghost" asChild className="-ml-4">
          <Link href="/brainstorm">
            <ArrowLeft className="mr-2" />
            {translations.investmentIdea.backToBrainstorm}
          </Link>
        </Button>

         <div className="flex flex-wrap gap-2 justify-end">
              <Button
                onClick={() => saveAnalysis()}
                disabled={isSaving || isSaved || !user || !allSectionsLoaded}
                variant="outline"
              >
                {isSaved ? (
                  <>
                    <CheckCircle className="mr-2" />{' '}
                    {translations.investmentIdea.ideaSaved}
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" />
                    {translations.investmentIdea.saving}
                  </>
                ) : (
                  <>
                    <Save className="mr-2" />{' '}
                    {translations.investmentIdea.addToMyIdeas}
                  </>
                )}
              </Button>
              <Button onClick={handleBuildDpr} disabled={!allSectionsLoaded || !user}>
                  <ChevronsRight className="mr-2" />
                  Build DPR
              </Button>
            </div>
      </div>

       <Card className="overflow-hidden">
          <CardHeader className="p-4 md:p-6">
            {!title ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-4">
                  <CardTitle className="text-2xl md:text-3xl">{title}</CardTitle>
                  <Badge variant="secondary">Powered by FIn-Box AI</Badge>
                </div>
                <CardDescription className="text-base pt-2">{summary}</CardDescription>
              </>
            )}
          </CardHeader>
        </Card>

      <div className="space-y-6 md:space-y-8">
        <AnimatePresence>
            {sections.map((section, index) => (
                (section.status === 'done' || section.status === 'loading') && (
                    <motion.div
                        key={section.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <Card>
                        <CardHeader className="flex flex-row items-center gap-4 p-4 md:p-6">
                          <section.icon className="h-8 w-8 text-primary flex-shrink-0" />
                          <CardTitle className="text-xl">{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0 min-h-[120px]">
                          {section.status === 'loading' ? (
                            <div className="flex items-center justify-center flex-col text-muted-foreground gap-2 h-24">
                              <Loader2 className="h-8 w-8 animate-spin" />
                              <span>Generating...</span>
                            </div>
                          ) : (
                            <FormattedText text={section.content || ''} />
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                )
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CustomInvestmentIdeaPage() {
  const { translations } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <h2 className="text-xl font-semibold">Generating Insights...</h2>
          <p className="text-muted-foreground">This may take a moment.</p>
        </div>
      }
    >
      <InvestmentIdeaContent />
    </Suspense>
  );
}
