
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
import { generateInvestmentIdeaAnalysisAction } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/schemas/sarvam-schemas';
import { FormattedText } from '@/components/financify/formatted-text';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import { useLanguage } from '@/hooks/use-language';

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
    
    // Construct the full analysis object from the generated sections
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
    async () => {
      if (!user || !title) return;
      setIsSaving(true);
      
      const analysisToSave = sections.reduce((acc, section) => {
        if (section.content) {
          acc[section.key] = section.content;
        }
        return acc;
      }, { title, summary } as Partial<GenerateInvestmentIdeaAnalysisOutput>);


      const ideasCollectionRef = collection(db, 'users', user.uid, 'ideas');
      const ideaData = {
        ...analysisToSave,
        savedAt: serverTimestamp(),
      };

      addDoc(ideasCollectionRef, ideaData).catch(async serverError => {
          const permissionError = new FirestorePermissionError({
            path: ideasCollectionRef.path,
            operation: 'create',
            requestResourceData: ideaData,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => {
          setIsSaving(false);
          setIsSaved(true);
          toast({
            title: translations.investmentIdea._TITLE,
            description: translations.investmentIdea.ideaSavedSuccess,
          });
        });
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
        // Just generate the first section for logged-out users, then stop.
        const result = await generateInvestmentIdeaAnalysisAction({ idea });
        if (result.success) {
            setTitle(result.data.title);
            setSummary(result.data.summary);
            setSections(prev => prev.map((s, i) => i === 0 ? { ...s, content: result.data.investmentStrategy, status: 'done' } : s));
        } else {
            setError(result.error);
        }
        return;
      }

      setError(null);

      // Check Firestore for a fully saved analysis first
      const ideasRef = collection(db, 'users', user.uid, 'ideas');
      const q = query(ideasRef, where('title', '==', idea), limit(1));

      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data() as GenerateInvestmentIdeaAnalysisOutput;
          setTitle(docData.title);
          setSummary(docData.summary);
          setSections(prevSections =>
            prevSections.map(s => ({
              ...s,
              content: docData[s.key] as string,
              status: 'done',
            }))
          );
          setIsSaved(true);
          return; // Stop here if we found a cached version
        }
      } catch (err: any) {
         console.error('Error checking for cached analysis:', err);
      }

      // If no cached version, generate section by section
      let fullAnalysis: GenerateInvestmentIdeaAnalysisOutput | null = null;
      for (let i = 0; i < sectionConfig.length; i++) {
        const section = sectionConfig[i];
        
        setSections(prev => prev.map(s => s.key === section.key ? { ...s, status: 'loading' } : s));
        
        // On the first iteration, we generate the full data but only display the first part
        if (i === 0) {
            const result = await generateInvestmentIdeaAnalysisAction({ idea });
            if (result.success) {
                fullAnalysis = result.data;
                setTitle(fullAnalysis.title);
                setSummary(fullAnalysis.summary);
            } else {
                setError(result.error);
                setSections(prev => prev.map(s => s.key === section.key ? { ...s, status: 'pending' } : s));
                break; // Stop generation on error
            }
        }
        
        if (fullAnalysis) {
            // Simulate a delay for subsequent cards to feel like they are generating
            if (i > 0) await new Promise(resolve => setTimeout(resolve, 800));
            
            setSections(prev => prev.map(s => 
                s.key === section.key 
                ? { ...s, content: fullAnalysis![s.key] as string, status: 'done' } 
                : s
            ));
        }
      }

      // After generating all sections, automatically save.
      if (fullAnalysis && user && !isSaved) {
        await saveAnalysis();
      }
    };

    fetchOrGenerateAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idea, user, translations]);

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
                onClick={saveAnalysis}
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
                <CardTitle className="text-2xl md:text-3xl">{title}</CardTitle>
                <CardDescription className="text-base">{summary}</CardDescription>
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
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <Card>
                        <CardHeader className="flex flex-row items-center gap-4 p-4 md:p-6">
                          <section.icon className="h-8 w-8 text-primary flex-shrink-0" />
                          <CardTitle className="text-xl">{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0">
                          {section.status === 'loading' ? (
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4" />
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

    
