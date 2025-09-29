
'use client';

import { useState, useEffect } from 'react';
import {
  RefreshCw,
  FileText,
  BarChart3,
  Loader2,
  Newspaper,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateFinBiteAction } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { GenerateFinBiteOutput } from '@/ai/flows/generate-fin-bite';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

export default function FinBitesPage() {
  const [finBite, setFinBite] = useState<GenerateFinBiteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [userIdea, setUserIdea] = useState('');
  const router = useRouter();

  const fetchFinBite = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateFinBiteAction();
      if (result.success) {
        setFinBite(result.data);
      } else {
        setError(result.error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinBite();
  }, []);

  const handleAnalyzeIdea = () => {
    if (!userIdea.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter an idea to analyze.',
      });
      return;
    }
    router.push(`/investment-ideas/custom?idea=${encodeURIComponent(userIdea)}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Fin Bites</h1>
          <p className="text-muted-foreground">
            Your daily dose of financial wisdom.
          </p>
        </div>
        <Button onClick={fetchFinBite} disabled={isLoading}>
          {isLoading && !finBite ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <RefreshCw className="mr-2" />
          )}
          New Bite
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={finBite?.title || (isLoading ? 'loading' : 'error')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading ? (
            <Card className="glassmorphic">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="glassmorphic">
              <CardContent className="pt-6">
                <div className="text-center text-destructive">
                  <p>
                    <strong>Oops!</strong> {error}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glassmorphic overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  {finBite?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{finBite?.summary}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      <Card className="glassmorphic">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="m12.5 2.5-2.5 5 2.5 5-5-2.5-5 2.5 5-2.5-2.5-5 2.5 5 5-2.5Z" />
                <path d="m12.5 11.5-2.5 5 2.5 5-5-2.5-5 2.5 5-2.5-2.5-5 2.5 5 5-2.5Z" />
              </svg>
              Investment Ideas
            </h2>
            <Badge variant="outline">Beta</Badge>
          </div>
          <CardDescription>
            Explore potential business ideas. Either view our sample analysis
            or enter your own idea below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-accent/50 rounded-lg p-4 flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="text-primary" />
                <h3 className="font-semibold text-primary">
                  Paper Plate Manufacturing Business
                </h3>
              </div>
              <p className="text-sm text-accent-foreground mt-1">
                A low-investment, high-demand business suitable for Tier-2 and
                Tier-3 cities in India.
              </p>
            </div>
            <Button asChild>
              <Link href="/investment-ideas/paper-plate-manufacturing">
                <FileText className="mr-2" />
                View Detailed Analysis
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Analyze Your Own Business Idea</h3>
            <Textarea
              placeholder="Describe your business idea, e.g., 'A cloud kitchen for healthy salads in metropolitan cities...'"
              value={userIdea}
              onChange={e => setUserIdea(e.target.value)}
              rows={3}
            />
            <Button onClick={handleAnalyzeIdea} disabled={!userIdea.trim()}>
              <Send className="mr-2" /> Get Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
