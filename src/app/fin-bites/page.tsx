'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, FileText, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateFinBiteAction } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function FinBitesPage() {
  const [finBite, setFinBite] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFinBite = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateFinBiteAction();
      if (result.success) {
        setFinBite(result.data.tip);
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

      <Card className="glassmorphic overflow-hidden">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={finBite || (isLoading ? 'loading' : 'error')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : error ? (
                <div className="text-center text-destructive">
                  <p>
                    <strong>Oops!</strong> {error}
                  </p>
                </div>
              ) : (
                <blockquote className="border-l-4 border-primary pl-4 italic text-lg">
                  "{finBite}"
                </blockquote>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

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
            <Button>
              <FileText className="mr-2" />
              View Detailed Analysis
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
