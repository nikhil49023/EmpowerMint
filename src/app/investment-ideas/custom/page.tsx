
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
} from 'lucide-react';
import { generateInvestmentIdeaAnalysisAction } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/flows/generate-investment-idea-analysis';
import { FormattedText } from '@/components/financify/formatted-text';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import { useLanguage } from '@/hooks/use-language';

function InvestmentIdeaContent() {
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!idea) {
        setError(translations.investmentIdea.errorNoIdea);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      const result = await generateInvestmentIdeaAnalysisAction({ idea });
      if (result.success) {
        setAnalysis(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    };

    fetchAnalysis();
  }, [idea, translations]);

  const handleSaveIdea = async () => {
    if (!user || !analysis) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: translations.investmentIdea.errorLoginToSave,
      });
      return;
    }
    setIsSaving(true);

    const ideasCollectionRef = collection(db, 'users', user.uid, 'ideas');
    const ideaData = {
      title: analysis.title,
      summary: analysis.summary,
      savedAt: serverTimestamp(),
    };

    addDoc(ideasCollectionRef, ideaData)
      .then(() => {
        setIsSaved(true);
        toast({
          title: translations.investmentIdea._TITLE,
          description: translations.investmentIdea.ideaSavedSuccess,
        });
      })
      .catch(async serverError => {
        const permissionError = new FirestorePermissionError({
          path: ideasCollectionRef.path,
          operation: 'create',
          requestResourceData: ideaData,
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const AnalysisCard = ({
    icon,
    title,
    content,
    isLoading,
  }: {
    icon: React.ElementType;
    title: string;
    content: string | undefined;
    isLoading: boolean;
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

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive font-semibold">{translations.investmentIdea.errorOccurred}</p>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

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
              <>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </>
            ) : (
              <>
                <CardTitle className="text-3xl">{analysis?.title}</CardTitle>
                <CardDescription>{analysis?.summary}</CardDescription>
              </>
            )}
          </CardHeader>
          {!isLoading && analysis && (
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSaveIdea}
                  disabled={isSaving || isSaved || !user}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle className="mr-2" /> {translations.investmentIdea.ideaSaved}
                    </>
                  ) : isSaving ? (
                    translations.investmentIdea.saving
                  ) : (
                    <>
                      <Save className="mr-2" /> {translations.investmentIdea.addToMyIdeas}
                    </>
                  )}
                </Button>
                <Button asChild>
                  <Link href={`/generate-drp?idea=${encodeURIComponent(analysis.title)}`}>
                    <FileText className="mr-2" />
                    Generate DPR
                  </Link>
                </Button>
              </div>
            </CardContent>
          )}
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
            isLoading={isLoading}
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
            isLoading={isLoading}
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
            isLoading={isLoading}
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
            isLoading={isLoading}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default function CustomInvestmentIdeaPage() {
  const { translations } = useLanguage();
  return (
    <Suspense fallback={<p>{translations.investmentIdea.loading}</p>}>
      <InvestmentIdeaContent />
    </Suspense>
  );
}
