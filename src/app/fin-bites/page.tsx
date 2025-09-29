'use client';

import { useState, useEffect } from 'react';
import {
  RefreshCw,
  FileText,
  BarChart3,
  Loader2,
  Newspaper,
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

export default function FinBitesPage() {
  const [finBite, setFinBite] = useState<GenerateFinBiteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
        <CardContent className="pt-6">
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
          <p className="text-muted-foreground mb-4">
            Explore potential business ideas. Here is a sample analysis for a
            small-scale business.
          </p>
          <div className="bg-accent/50 rounded-lg p-4 flex items-center justify-between">
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
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            100 Investment Options in India
          </h2>
          <Badge variant="outline">Beta</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          A comprehensive list categorized by risk level.
        </p>
        <p className="text-muted-foreground text-xs">
          Disclaimer: This is for educational purposes only. Not financial
          advice.
        </p>

        <div className="flex gap-2 mt-4 mb-4">
          <Button variant="secondary" size="sm">
            All Risk
          </Button>
          <Button variant="secondary" size="sm">
            Low Risk
          </Button>
          <Button variant="secondary" size="sm">
            Moderate Risk
          </Button>
          <Button variant="secondary" size="sm">
            High Risk
          </Button>
        </div>

        <Card className="glassmorphic">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-800 flex items-center gap-2">
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
                className="lucide lucide-check-circle h-5 w-5"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
              Low Risk Investments
            </h3>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
