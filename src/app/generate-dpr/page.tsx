
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FileText,
  Loader2,
  ArrowLeft,
  ChevronsRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/schemas/investment-idea-analysis';
import { useAuth } from '@/context/auth-provider';
import { Progress } from '@/components/ui/progress';

function GenerateDPRContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const idea = searchParams.get('idea');
  const { user } = useAuth();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatusText, setGenerationStatusText] = useState('');
  
  const [businessName, setBusinessName] = useState('');
  
  useEffect(() => {
    const analysisDataString = localStorage.getItem('dprAnalysis');
    if (analysisDataString) {
      try {
        const parsedAnalysis: GenerateInvestmentIdeaAnalysisOutput = JSON.parse(analysisDataString);
        setBusinessName(parsedAnalysis.title);
      } catch (e) {
        console.error("Failed to parse DPR analysis from localStorage", e);
      }
    } else if (idea) {
        setBusinessName(idea);
    }
  }, [idea]);

  const handleGenerateDPR = async () => {
      if(!user) {
          toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to generate a DPR.' });
          router.push('/');
          return;
      }

      if(!businessName) {
          toast({ variant: 'destructive', title: 'Error', description: 'Business idea is missing.' });
          return;
      }

      setIsGenerating(true);
      setGenerationProgress(0);
      toast({
          title: 'Generating DPR',
          description: 'This may take a minute or two. Please wait...',
      });

      try {
        // Step 1: Elaborate on the idea
        setGenerationStatusText("Expanding business concept...");
        setGenerationProgress(10);
        const elaborationResponse = await fetch('/api/generate-dpr-elaboration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idea: businessName, promoterName: user.displayName || 'Entrepreneur' }),
        });

        if (!elaborationResponse.ok) {
            const error = await elaborationResponse.json();
            throw new Error(`Failed to elaborate on the idea: ${error.message}`);
        }
        const elaboratedProfile = await elaborationResponse.json();
        setGenerationProgress(40);
        
        // Step 2: Generate the full DPR from the elaborated profile
        setGenerationStatusText("Building full Detailed Project Report...");
        const dprResponse = await fetch('/api/generate-dpr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(elaboratedProfile),
        });

         if (!dprResponse.ok) {
            const error = await dprResponse.json();
            throw new Error(`Failed to generate the final DPR: ${error.message}`);
        }
        const generatedReport = await dprResponse.json();
        
        // Step 3: Finalize and redirect
        setGenerationStatusText("Finalizing report...");
        localStorage.setItem('generatedDPR', JSON.stringify(generatedReport));
        setGenerationProgress(100);

        toast({
            title: "DPR Generated Successfully!",
            description: "Your full Detailed Project Report is ready.",
        });

        router.push(`/dpr-report?idea=${encodeURIComponent(businessName)}`);

      } catch(e: any) {
          console.error("DPR Generation failed:", e);
          toast({
              variant: 'destructive',
              title: `DPR Generation Failed`,
              description: e.message,
          });
          setIsGenerating(false);
      }
  };
  
  if (isGenerating) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
            <h2 className="text-2xl font-bold mb-2">Generating Your DPR</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                Our AI is building your comprehensive report. This may take a minute or two, please don't close this page.
            </p>
            <div className="w-full max-w-md">
                <Progress value={generationProgress} className="w-full mb-2" />
                <p className="text-sm text-muted-foreground">{generationStatusText} ({Math.round(generationProgress)}%)</p>
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText /> DPR Generation Wizard
          </h1>
          <p className="text-muted-foreground">
            Generating report for: <span className="font-semibold">{businessName}</span>
          </p>
        </div>
        <Button variant="ghost" asChild className="-ml-4">
          <Link
            href={`/investment-ideas/custom?idea=${encodeURIComponent(idea || '')}`}
          >
            <ArrowLeft className="mr-2" /> Back to Analysis
          </Link>
        </Button>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-accent" />
            Ready to Build Your Report?
          </CardTitle>
           <CardDescription>
            The information from your idea analysis will be used to generate a bank-ready Detailed Project Report.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <p className="text-muted-foreground">
                    Click the button below to start the automated DPR generation process. The AI will first elaborate on your business concept and then write all the necessary sections for a complete report.
                </p>
                <Button onClick={handleGenerateDPR} disabled={isGenerating} size="lg">
                    {isGenerating ? (
                        <> <Loader2 className="mr-2 animate-spin" /> Generating Report...</>
                    ) : (
                       <> <ChevronsRight className="mr-2"/> Generate Full DPR</>
                    )}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GenerateDPRPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center h-full text-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <h2 className="text-xl font-semibold">Loading DPR Generator...</h2>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      }
    >
      <GenerateDPRContent />
    </Suspense>
  );
}
