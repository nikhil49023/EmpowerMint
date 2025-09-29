'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Briefcase, Target, TrendingUp, Shield } from 'lucide-react';
import { generateInvestmentIdeaAnalysisAction } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/flows/generate-investment-idea-analysis';

export default function InvestmentIdeaPage() {
  const [analysis, setAnalysis] =
    useState<GenerateInvestmentIdeaAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      const result = await generateInvestmentIdeaAnalysisAction(
        'Paper Plate Manufacturing Business'
      );
      if (result.success) {
        setAnalysis(result.data);
      } else {
        console.error(result.error);
      }
      setIsLoading(false);
    };

    fetchAnalysis();
  }, []);

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
            <p className="text-muted-foreground whitespace-pre-line">
              {content}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" asChild className="-ml-4">
          <Link href="/fin-bites">
            <ArrowLeft className="mr-2" />
            Back to Fin Bites
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
