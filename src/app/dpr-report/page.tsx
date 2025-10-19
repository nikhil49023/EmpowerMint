
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, FileDown, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FormattedText } from '@/components/financify/formatted-text';
import Link from 'next/link';
import {
  FinancialProjectionsBarChart,
  ProjectCostPieChart,
} from '@/components/financify/dpr-charts';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type ReportData = {
  [key: string]: any;
};

const dprChapterTitles = [
  'Executive Summary',
  'Project Introduction',
  'Promoter Details',
  'Business Model',
  'Market Analysis',
  'Location and Site',
  'Technical Feasibility',
  'Implementation Schedule',
  'Financial Projections',
  'SWOT Analysis',
  'Regulatory Compliance',
  'Risk Assessment',
  'Annexures',
];

function DPRReportContent() {
  const searchParams = useSearchParams();
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user] = useAuthState(auth);
  const ideaTitle = searchParams.get('idea');
  const { toast } = useToast();

  useEffect(() => {
    const fetchReport = async () => {
      if (!user || !ideaTitle) {
        setError('Could not load report. User or idea is missing.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const docRef = doc(db, 'users', user.uid, 'dpr-projects', ideaTitle);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReport(docSnap.data().sections);
        } else {
          setError('No report data found. Please generate the DPR first.');
        }
      } catch (e: any) {
        console.error('Failed to fetch report:', e);
        setError(`Failed to load the generated report data: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [user, ideaTitle]);

  const handleExport = () => {
    // This will now use the browser's print-to-PDF functionality
    // which is the most reliable cross-browser client-side solution.
    window.print();
  };

  const Section = ({
    title,
    content,
    isLoading,
  }: {
    title: string;
    content?: any;
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
          <FormattedText
            text={content || 'No content generated for this section.'}
          />
        )}
      </CardContent>
    </Card>
  );

  const FinancialSection = ({
    title,
    content,
    isLoading,
  }: {
    title: string;
    content?: any;
    isLoading: boolean;
  }) => {
    if (isLoading) {
      return (
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      );
    }
    if (!content)
      return <Section title={title} content="Not generated." isLoading={false} />;

    let parsedContent;
    try {
      // The content for financial projections might be a string, so we need to parse it.
      parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (e) {
        console.error("Failed to parse financial section content:", e);
        return <Section title={title} content={`Error displaying financial data. The content was not in the expected JSON format and could not be parsed.\n\nRaw content:\n${content}`} isLoading={false} />;
    }

    return (
      <Card className="glassmorphic print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormattedText text={parsedContent.summaryText} />

          <div>
            <h4 className="font-semibold text-lg mb-2">Project Cost Breakdown</h4>
            <ProjectCostPieChart data={parsedContent.costBreakdown} />
            <FormattedText text={parsedContent.projectCost} />
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-2">Yearly Projections</h4>
            <FinancialProjectionsBarChart data={parsedContent.yearlyProjections} />
          </div>

          <div>
            <h4 className="font-semibold text-lg">Means of Finance</h4>
            <FormattedText text={parsedContent.meansOfFinance} />
          </div>
          <div>
            <h4 className="font-semibold text-lg">Profitability Analysis</h4>
            <FormattedText text={parsedContent.profitabilityAnalysis} />
          </div>
          <div>
            <h4 className="font-semibold text-lg">Cash Flow Statement</h4>
            <FormattedText text={parsedContent.cashFlowStatement} />
          </div>
          <div>
            <h4 className="font-semibold text-lg">Loan Repayment Schedule</h4>
            <FormattedText text={parsedContent.loanRepaymentSchedule} />
          </div>
          <div>
            <h4 className="font-semibold text-lg">Break-Even Analysis</h4>
            <FormattedText text={parsedContent.breakEvenAnalysis} />
          </div>
        </CardContent>
      </Card>
    );
  };

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
            Final compiled report for: <span className="font-semibold">{ideaTitle}</span>
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
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isLoading || !!error}
        >
          <FileDown className="mr-2" /> Export to PDF
        </Button>
      </div>

      {error && !isLoading && (
        <Card className="text-center py-10 bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle>Error Loading Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/brainstorm">Start Over</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div id="print-section" className="space-y-6">
        {isLoading &&
          dprChapterTitles.map((title, index) => (
            <Section
              key={index}
              title={`${index + 1}. ${title}`}
              isLoading={true}
            />
          ))}

        {report &&
          dprChapterTitles.map((title, index) => {
            const key = Object.keys(report).find(k => k.toLowerCase().replace(/ /g, '') === title.toLowerCase().replace(/ /g, '')) || title;
            const content = report[key];
            
            if (title === 'Financial Projections') {
              return (
                <FinancialSection
                  key={key}
                  title={`${index + 1}. ${title}`}
                  content={content}
                  isLoading={isLoading}
                />
              );
            }
            return (
              <Section
                key={key}
                title={`${index + 1}. ${title}`}
                content={content}
                isLoading={isLoading}
              />
            );
          })}
      </div>
    </div>
  );
}

export default function DPRReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center h-full text-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <h2 className="text-xl font-semibold">Loading Final Report...</h2>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      }
    >
      <DPRReportContent />
    </Suspense>
  );
}
