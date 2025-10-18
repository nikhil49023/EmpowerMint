
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
import { Lightbulb, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/flows/generate-investment-idea-analysis';

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

  useEffect(() => {
    if (user) {
      const ideasQuery = query(
        collection(db, 'users', user.uid, 'ideas'),
        orderBy('savedAt', 'desc')
      );
      const unsubscribe = onSnapshot(ideasQuery, snapshot => {
        const ideasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as SavedIdea[];
        setIdeas(ideasData);
        setLoadingIdeas(false);
      });
      return () => unsubscribe();
    } else if (!loadingAuth) {
      setLoadingIdeas(false);
    }
  }, [user, loadingAuth]);

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
        <p>Please log in to see your saved ideas.</p>
        <Button asChild className="mt-4">
          <Link href="/">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Lightbulb /> My Saved Ideas
        </h1>
        <p className="text-muted-foreground">
          A collection of all your brilliant business ideas.
        </p>
      </div>

      {ideas.length === 0 ? (
        <Card className="text-center py-10 glassmorphic">
          <CardContent>
            <p className="text-muted-foreground">
              You haven't saved any ideas yet.
            </p>
            <Button asChild className="mt-4">
              <Link href="/brainstorm">Start Brainstorming</Link>
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
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link
                      href={`/investment-ideas/custom?idea=${encodeURIComponent(
                        idea.title
                      )}`}
                    >
                      View Analysis
                    </Link>
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

    