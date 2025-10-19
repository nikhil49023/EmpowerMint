
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateFullDprAction } from '@/app/actions';
import { type GenerateFullDprOutput } from '@/ai/flows/generate-full-dpr';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  FileText,
  FileDown,
  MessageSquare,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FormattedText } from '@/components/financify/formatted-text';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import AIAdvisorChat from '@/components/financify/ai-advisor-chat';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import {
  FinancialProjectionsBarChart,
  ProjectCostPieChart,
} from '@/components/financify/dpr-charts';

function DPRReportContent() {
  const searchParams = useSearchParams();
  const idea = searchParams.get('idea');
  const [user, loadingAuth] = useAuthState(auth);
  const [report, setReport] = useState<GenerateFullDprOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { translations } = useLanguage();

  useEffect(() => {
    if (!idea) {
      setError('Business idea not provided.');
      setIsLoading(false);
      return;
    }

    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      const result = await generateFullDprAction({
        idea,
        userName: user?.displayName,
        userEmail: user?.email,
      });

      if (result.success) {
        setReport(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    };

    if (!loadingAuth) {
      fetchReport();
    }
  }, [idea, user, loadingAuth]);

  const handleExport = () => {
    // You can implement payment logic here before printing
    window.print();
  };

  const Section = ({
    title,
    content,
    isLoading,
  }: {
    title: string;
    content?: string;
    isLoading: boolean;
  }) => (
    <Card className="glassmorphic print:shadow-none print:border-none">
      <CardHeader>
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

  return (
    <div className="space-y-8 @container">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section,
          #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            margin: 20px;
          }
          .no-print {
            display: none;
          }
          .print-break-before {
            page-break-before: always;
          }
           .print-break-after {
            page-break-after: always;
          }
        }
      `}</style>

      <div className="flex justify-between items-start no-print">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText />
            Detailed Project Report
          </h1>
          <p className="text-muted-foreground max-w-2xl truncate">
            AI-generated report for: {idea}
          </p>
        </div>
        <Button variant="ghost" asChild className="-ml-4">
          <Link href="/brainstorm">
            <ArrowLeft className="mr-2" />
            Back to Brainstorm
          </Link>
        </Button>
      </div>

      <div className="flex gap-2 no-print">
        <Sheet>
          <SheetTrigger asChild>
            <Button disabled={isLoading || !!error}>
              <MessageSquare className="mr-2" /> Edit with AI Advisor
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
            <SheetHeader className="p-6 pb-2">
              <SheetTitle>{translations.aiAdvisor.title}</SheetTitle>
              <SheetDescription>
                {translations.aiAdvisor.description}
              </SheetDescription>
            </SheetHeader>
            <AIAdvisorChat />
          </SheetContent>
        </Sheet>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isLoading || !!error}
        >
          <FileDown className="mr-2" /> Export to PDF (₹50)
        </Button>
      </div>

      {error && (
        <Card className="text-center py-10 bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle>Error Generating Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div id="print-section" className="space-y-6">
        <Section
          title="1. Executive Summary"
          content={report?.executiveSummary}
          isLoading={isLoading}
        />
        <Section
          title="2. Project Introduction & Objective"
          content={report?.projectIntroduction}
          isLoading={isLoading}
        />
        <Section
          title="3. Promoter/Entrepreneur Profile"
          content={report?.promoterDetails}
          isLoading={isLoading}
        />
        <Section
          title="4. Business Model & Project Details"
          content={report?.businessModel}
          isLoading={isLoading}
        />
        <Section
          title="5. Market Analysis"
          content={report?.marketAnalysis}
          isLoading={isLoading}
        />
        <Section
          title="6. Location and Site Analysis"
          content={report?.locationAndSite}
          isLoading={isLoading}
        />
        <Section
          title="7. Technical Feasibility & Infrastructure"
          content={report?.technicalFeasibility}
          isLoading={isLoading}
        />
        <Section
          title="8. Implementation Schedule & Project Timeline"
          content={report?.implementationSchedule}
          isLoading={isLoading}
        />

        <Card className="glassmorphic print:shadow-none print:border-none print-break-before">
          <CardHeader>
            <CardTitle>9. Financial Projections</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              report?.financialProjections && (
                <div className="space-y-8">
                  <FormattedText text={report.financialProjections.summaryText} />

                  <Section title="Project Cost" content={report.financialProjections.projectCost} isLoading={isLoading} />
                  <Section title="Means of Finance" content={report.financialProjections.meansOfFinance} isLoading={isLoading} />
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-4">Project Cost Breakdown</h4>
                    <ProjectCostPieChart data={report.financialProjections.costBreakdown} />
                  </div>

                   <div className="print-break-before">
                     <h4 className="font-semibold text-lg mb-4">Sales & Profit Projections (3-5 Years)</h4>
                    <FinancialProjectionsBarChart data={report.financialProjections.yearlyProjections} />
                  </div>

                  <Section title="Profitability Analysis" content={report.financialProjections.profitabilityAnalysis} isLoading={isLoading} />
                  <Section title="Cash Flow Statement" content={report.financialProjections.cashFlowStatement} isLoading={isLoading} />
                  <Section title="Loan Repayment Schedule" content={report.financialProjections.loanRepaymentSchedule} isLoading={isLoading} />
                  <Section title="Break-Even Analysis" content={report.financialProjections.breakEvenAnalysis} isLoading={isLoading} />
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Section
          title="10. SWOT Analysis"
          content={report?.swotAnalysis}
          isLoading={isLoading}
        />
        <Section
          title="11. Regulatory & Statutory Compliance"
          content={report?.regulatoryCompliance}
          isLoading={isLoading}
        />
        <Section
          title="12. Risk Assessment & Mitigation Strategy"
          content={report?.riskAssessment}
          isLoading={isLoading}
        />
        <Section
          title="13. Annexures"
          content={report?.annexures}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default function DPRReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <DPRReportContent />
    </Suspense>
  );
}
