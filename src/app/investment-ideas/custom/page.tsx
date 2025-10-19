
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
  FileText,
  Loader2,
} from 'lucide-react';
import { generateInvestmentIdeaAnalysisAction } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/schemas/investment-idea-analysis';
import { FormattedText } from '@/components/financify/formatted-text';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
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

function InvestmentIdeaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idea = searchParams.get('idea');
  const [analysis, setAnalysis] =
    useState<GenerateInvestmentIdeaAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const { translations } = useLanguage();

  const handleGenerateDpr = () => {
    if (!analysis || !user) return;
    // Store the analysis in localStorage to pass it to the next page
    localStorage.setItem('dprAnalysis', JSON.stringify(analysis));
    router.push(
      `/generate-drp?idea=${encodeURIComponent(
        analysis.title
      )}&name=${encodeURIComponent(user?.displayName || '')}`
    );
  };

  const saveAnalysis = useCallback(
    async (analysisToSave: GenerateInvestmentIdeaAnalysisOutput) => {
      if (!user) return;
      setIsSaving(true);

      const ideasCollectionRef = collection(db, 'users', user.uid, 'ideas');
      const ideaData: SavedIdea = {
        ...analysisToSave,
        savedAt: serverTimestamp(),
      };

      try {
        await addDoc(ideasCollectionRef, ideaData);
        setIsSaved(true);
        toast({
          title: translations.investmentIdea._TITLE,
          description: translations.investmentIdea.ideaSavedSuccess,
        });
      } catch (serverError) {
        const permissionError = new FirestorePermissionError({
          path: ideasCollectionRef.path,
          operation: 'create',
          requestResourceData: ideaData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      } finally {
        setIsSaving(false);
      }
    },
    [user, toast, translations]
  );

  useEffect(() => {
    const fetchOrGenerateAnalysis = async () => {
      if (!idea) {
        setError(translations.investmentIdea.errorNoIdea);
        setIsLoading(false);
        return;
      }
      if (!user) {
        // If user is not logged in, just generate, don't cache.
        setIsLoading(true);
        const result = await generateInvestmentIdeaAnalysisAction({ idea });
        if (result.success) {
          setAnalysis(result.data);
        } else {
          setError(result.error);
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      // 1. Check Firestore for an existing analysis
      const ideasRef = collection(db, 'users', user.uid, 'ideas');
      const q = query(ideasRef, where('title', '==', idea), limit(1));

      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // 1a. If found, use it.
          const docData = querySnapshot.docs[0].data() as SavedIdea;
          setAnalysis(docData);
          setIsSaved(true); // It's already saved
        } else {
          // 1b. If not found, generate it.
          const result = await generateInvestmentIdeaAnalysisAction({ idea });
          if (result.success) {
            setAnalysis(result.data);
            // 2. Save the newly generated analysis to Firestore
            await saveAnalysis(result.data);
          } else {
            setError(result.error);
          }
        }
      } catch (err) {
        console.error('Error fetching or generating analysis:', err);
        setError(
          'An unexpected error occurred while retrieving your analysis.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrGenerateAnalysis();
  }, [idea, user, translations, saveAnalysis]);

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

  const AnalysisCard = ({
    icon,
    title,
    content,
  }: {
    icon: React.ElementType;
    title: string;
    content: string | undefined;
  }) => {
    const Icon = icon;
    return (
      <Card className="glassmorphic">
        <CardHeader className="flex flex-row items-center gap-4">
          <Icon className="h-8 w-8 text-primary" />
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <FormattedText text={content || ''} />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="ghost" asChild className="-ml-4">
          <Link href="/brainstorm">
            <ArrowLeft className="mr-2" />
            {translations.investmentIdea.backToBrainstorm}
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glassmorphic overflow-hidden">
          <CardHeader>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            ) : (
              <>
                <CardTitle className="text-3xl">{analysis?.title}</CardTitle>
                <CardDescription>{analysis?.summary}</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-36" />
              </div>
            ) : (
              analysis && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => saveAnalysis(analysis)}
                    disabled={isSaving || isSaved || !user}
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
                  <Button onClick={handleGenerateDpr} disabled={!analysis || !user}>
                      <FileText className="mr-2" />
                      Generate DPR
                  </Button>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnalysisCard
            icon={Briefcase}
            title={translations.investmentIdea.investmentStrategy}
            content={analysis?.investmentStrategy}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnalysisCard
            icon={Target}
            title={translations.investmentIdea.targetAudience}
            content={analysis?.targetAudience}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AnalysisCard
            icon={TrendingUp}
            title={translations.investmentIdea.roi}
            content={analysis?.roi}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <AnalysisCard
            icon={Shield}
            title={translations.investmentIdea.futureProofing}
            content={analysis?.futureProofing}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default function CustomInvestmentIdeaPage() {
  const { translations } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <InvestmentIdeaContent />
    </Suspense>
  );
}
