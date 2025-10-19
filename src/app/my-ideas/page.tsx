
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lightbulb, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/schemas/investment-idea-analysis';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import { useLanguage } from '@/hooks/use-language';
import { useRouter } from 'next/navigation';

type SavedIdea = GenerateInvestmentIdeaAnalysisOutput & {
  id: string;
  savedAt: {
    seconds: number;
    nanoseconds: number;
  };
};

export default function MyIdeasPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [ideas, setIdeas] = useState<SavedIdea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const { translations } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const ideasQuery = query(
        collection(db, 'users', user.uid, 'ideas'),
        orderBy('savedAt', 'desc')
      );
      const unsubscribe = onSnapshot(
        ideasQuery,
        snapshot => {
          const ideasData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as SavedIdea[];
          setIdeas(ideasData);
          setLoadingIdeas(false);
        },
        async serverError => {
          const permissionError = new FirestorePermissionError({
            path: ideasQuery.path,
            operation: 'list',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        }
      );
      return () => unsubscribe();
    } else if (!loadingAuth) {
      setLoadingIdeas(false);
    }
  }, [user, loadingAuth]);

  const handleGenerateDpr = (
    idea: GenerateInvestmentIdeaAnalysisOutput
  ) => {
    if (!idea || !user) return;
    localStorage.setItem('dprAnalysis', JSON.stringify(idea));
    router.push(
      `/generate-drp?idea=${encodeURIComponent(
        idea.title
      )}&name=${encodeURIComponent(user?.displayName || 'Entrepreneur')}`
    );
  };

  if (loadingAuth || loadingIdeas) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <p>{translations.myIdeas.loginPrompt}</p>
        <Button asChild className="mt-4">
          <Link href="/">{translations.myIdeas.loginButton}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Lightbulb /> {translations.myIdeas.title}
        </h1>
        <p className="text-muted-foreground">
          {translations.myIdeas.description}
        </p>
      </div>

      {ideas.length === 0 ? (
        <Card className="text-center py-10 glassmorphic">
          <CardContent>
            <p className="text-muted-foreground">
              {translations.myIdeas.noIdeas}
            </p>
            <Button asChild className="mt-4">
              <Link href="/brainstorm">{translations.myIdeas.startBrainstorming}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col glassmorphic">
                <CardHeader>
                  <CardTitle>{idea.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {idea.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow" />
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link
                      href={{
                        pathname: '/investment-ideas/custom',
                        query: { idea: idea.title },
                      }}
                    >
                      {translations.myIdeas.viewAnalysis}
                    </Link>
                  </Button>
                  <Button onClick={() => handleGenerateDpr(idea)} className="w-full">
                    <FileText className="mr-2 h-4 w-4"/>
                    Generate DPR
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
