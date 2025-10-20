
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FileText,
  Loader2,
  ArrowLeft,
  ChevronsRight,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { generateDprSectionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/schemas/investment-idea-analysis';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import { Progress } from '@/components/ui/progress';

const formSteps = [
    "MSME Details",
    "Project Scope",
    "Target Market",
    "Financial Data",
    "Additional Info",
    "Review & Generate"
];

const dprSections = [
    'ExecutiveSummary',
    'ProjectIntroduction',
    'PromoterDetails',
    'BusinessModel',
    'MarketAnalysis',
    'LocationAndSite',
    'TechnicalFeasibility',
    'ImplementationSchedule',
    'FinancialProjections',
    'SWOTAnalysis',
    'RegulatoryCompliance',
    'RiskAssessment',
    'Annexures',
];


function GenerateDPRContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const idea = searchParams.get('idea');
  const [user] = useAuthState(auth);

  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatusText, setGenerationStatusText] = useState('');
  
  // Form State
  const [promoterName, setPromoterName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [financialData, setFinancialData] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  useEffect(() => {
    const analysisDataString = localStorage.getItem('dprAnalysis');
    if (analysisDataString) {
      const parsedAnalysis: GenerateInvestmentIdeaAnalysisOutput = JSON.parse(analysisDataString);
      setBusinessName(parsedAnalysis.title);
      setProjectScope(parsedAnalysis.summary);
      setTargetMarket(parsedAnalysis.targetAudience);
    } else if (idea) {
        setBusinessName(idea);
    }

    if (user?.displayName) {
        setPromoterName(user.displayName);
    }
  }, [idea, user]);

  const handleNext = () => {
      if (currentStep < formSteps.length - 1) {
          setCurrentStep(currentStep + 1);
      }
  }

  const handleBack = () => {
      if (currentStep > 0) {
          setCurrentStep(currentStep - 1);
      }
  }

  const handleGenerateDPR = async () => {
      if(!user) {
          toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to generate a DPR.' });
          return;
      }
      setIsGenerating(true);
      setGenerationProgress(0);
      toast({
          title: 'Generating DPR',
          description: 'This may take a minute or two. Please wait...',
      });

      const generationInput = {
          msmeDetails: { promoterName, businessName, businessType, location },
          projectScope,
          targetMarket,
          financialData,
          additionalInfo
      };
      
      let sectionsGenerated = 0;
      let generationFailed = false;

      for (const section of dprSections) {
        if (generationFailed) break;

        setGenerationStatusText(`Generating ${section.replace(/([A-Z])/g, ' $1').trim()}...`);
        
        const result = await generateDprSectionAction({ ...generationInput, section });

        if (result.success) {
            const sectionDocRef = doc(db, 'users', user.uid, 'dpr-projects', businessName, 'sections', section);
            const dataToSave = {
                content: result.data.content,
                updatedAt: serverTimestamp(),
            };
            
            await new Promise<void>((resolve) => {
              setDoc(sectionDocRef, dataToSave, { merge: true })
                .then(() => {
                  sectionsGenerated++;
                  setGenerationProgress((sectionsGenerated / dprSections.length) * 100);
                  resolve();
                })
                .catch(async (e: any) => {
                  const permissionError = new FirestorePermissionError({
                    path: sectionDocRef.path,
                    operation: 'write',
                    requestResourceData: dataToSave,
                  } satisfies SecurityRuleContext);
                  errorEmitter.emit('permission-error', permissionError);
                  toast({
                    variant: 'destructive',
                    title: `Could not save ${section} section`,
                    description: 'Failed to save the generated section to your project.',
                  });
                  generationFailed = true;
                  resolve();
                });
            });

        } else {
            toast({
              variant: 'destructive',
              title: `Failed to generate ${section}`,
              description: result.error,
            });
            generationFailed = true;
        }
      }
      
      if (generationFailed) {
        setIsGenerating(false);
        return;
      }

      setGenerationStatusText("Finalizing report...");
      setGenerationProgress(100);

      toast({
        title: "DPR Generated Successfully!",
        description: "Your full Detailed Project Report is ready.",
      });
      router.push(`/dpr-report?idea=${encodeURIComponent(businessName)}`);
  };


  const renderStepContent = () => {
      switch(currentStep) {
          case 0: // MSME Details
            return (
                <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="promoterName">Promoter Name</Label>
                            <Input id="promoterName" value={promoterName} onChange={(e) => setPromoterName(e.target.value)} placeholder="e.g., Anika Sharma" />
                        </div>
                         <div className="space-y-1.5">
                            <Label htmlFor="businessName">Business / Project Name</Label>
                            <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g., Eco-Friendly Packaging Solutions" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="businessType">Business Type</Label>
                            <Input id="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="e.g., Manufacturing, Service" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Pune, Maharashtra" />
                        </div>
                    </div>
                </div>
            );
          case 1: // Project Scope
            return (
                <div className="space-y-1.5">
                    <Label htmlFor="projectScope">Project Scope</Label>
                    <Textarea id="projectScope" value={projectScope} onChange={(e) => setProjectScope(e.target.value)} rows={8} placeholder="Define the project's objectives, deliverables, and boundaries..." />
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3"/>This can be pre-filled from your idea analysis.</p>
                </div>
            );
          case 2: // Target Market
            return (
                 <div className="space-y-1.5">
                    <Label htmlFor="targetMarket">Target Market</Label>
                    <Textarea id="targetMarket" value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} rows={8} placeholder="Describe your ideal customers, market size, and competitors..." />
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3"/>This can be pre-filled from your idea analysis.</p>
                </div>
            );
          case 3: // Financial Data
            return (
                 <div className="space-y-1.5">
                    <Label htmlFor="financialData">Financial Data</Label>
                    <Textarea id="financialData" value={financialData} onChange={(e) => setFinancialData(e.target.value)} rows={8} placeholder="Provide details on estimated startup costs, funding sources, and revenue projections..." />
                </div>
            );
          case 4: // Additional Info
            return (
                 <div className="space-y-1.5">
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea id="additionalInfo" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} rows={8} placeholder="Include any other relevant details, such as your unique selling proposition (USP), team background, etc..." />
                </div>
            );
          case 5: // Review & Generate
             return (
                 <div className="space-y-6">
                     <h3 className="text-lg font-semibold">Review Your Input</h3>
                     <div className="space-y-4 rounded-md border p-4 max-h-96 overflow-y-auto">
                        <ReviewSection title="MSME Details" content={`Promoter: ${promoterName}\nBusiness: ${businessName}\nType: ${businessType}\nLocation: ${location}`} />
                        <ReviewSection title="Project Scope" content={projectScope} />
                        <ReviewSection title="Target Market" content={targetMarket} />
                        <ReviewSection title="Financial Data" content={financialData} />
                        <ReviewSection title="Additional Info" content={additionalInfo} />
                     </div>
                 </div>
             );
          default:
            return null;
      }
  }
  
  const ReviewSection = ({ title, content }: { title: string; content: string }) => (
      <div>
          <h4 className="font-medium text-primary">{title}</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content || "Not provided"}</p>
      </div>
  );

  const progress = ((currentStep + 1) / formSteps.length) * 100;
  
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

       <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>
            Step {currentStep + 1}: {formSteps[currentStep]}
          </CardTitle>
           <CardDescription>
            Please provide the following details to generate your report.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="my-4">
                <Progress value={progress} className="w-full" />
            </div>
            <div className="min-h-[250px] mt-6">
                {renderStepContent()}
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isGenerating}>
            Back
          </Button>
          {currentStep < formSteps.length - 1 ? (
             <Button onClick={handleNext}>
                Next <ChevronsRight className="ml-2" />
            </Button>
          ) : (
            <Button onClick={handleGenerateDPR} disabled={isGenerating}>
                {isGenerating ? (
                    <> <Loader2 className="mr-2 animate-spin" /> Generating Report...</>
                ) : (
                    "Generate DPR"
                )}
            </Button>
          )}
      </div>

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

    