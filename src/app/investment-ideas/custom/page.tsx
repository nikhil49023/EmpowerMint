
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

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!idea) {
        setError('No investment idea provided.');
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
  }, [idea]);

  const handleSaveIdea = async () => {
    if (!user || !analysis) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to save an idea.',
      });
      return;
    }
    setIsSaving(true);

    const ideasCollectionRef = collection(db, 'users', user.uid, 'ideas');
    const ideaData = {
      ...analysis,
      savedAt: serverTimestamp(),
    };

    addDoc(ideasCollectionRef, ideaData)
      .then(() => {
        setIsSaved(true);
        toast({
          title: 'Success!',
          description: 'Your idea has been saved successfully.',
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
        <p className="text-destructive font-semibold">An error occurred</p>
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
            Back to Brainstorm
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
              <Button
                onClick={handleSaveIdea}
                disabled={isSaving || isSaved || !user}
              >
                {isSaved ? (
                  <>
                    <CheckCircle className="mr-2" /> Idea Saved
                  </>
                ) : isSaving ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="mr-2" /> Add to My Ideas
                  </>
                )}
              </Button>
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
            title="Investment Strategy"
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
            title="Target Audience"
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
            title="Return on Investment (ROI)"
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
            title="Future Proofing"
            content={analysis?.futureProofing}
            isLoading={isLoading}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default function CustomInvestmentIdeaPage() {
  return (
    <Suspense fallback={<p>Loading analysis...</p>}>
      <InvestmentIdeaContent />
    </Suspense>
  );
}
