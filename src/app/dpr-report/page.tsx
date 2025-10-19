
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  FileText,
  FileDown,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FormattedText } from '@/components/financify/formatted-text';
import Link from 'next/link';

// Mock data structure, this would be populated from the generation process
const mockReport = {
  'Executive Summary': 'A brief summary of the business venture...',
  'Project Introduction & Objective': 'Detailed introduction...',
  'Promoter/Entrepreneur Profile': 'Details about the promoter...',
  'Business Model & Project Details': 'Description of the business model...',
  'Market Analysis': 'Analysis of the target market...',
  'Location and Site Analysis': 'Details on the business location...',
  'Technical Feasibility & Infrastructure': 'Technical aspects of the project...',
  'Implementation Schedule & Project Timeline': 'Timeline for project execution...',
  'Financial Projections': 'Detailed financial data and charts will be here.',
  'SWOT Analysis': 'Strengths, Weaknesses, Opportunities, Threats...',
  'Regulatory & Statutory Compliance': 'Legal and regulatory requirements...',
  'Risk Assessment & Mitigation Strategy': 'Potential risks and how to mitigate them...',
  'Annexures': 'Supporting documents and references...',
};

type ReportData = typeof mockReport;


function DPRReportContent() {
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finalDprJson = localStorage.getItem('finalDPR');
    if (finalDprJson) {
      try {
        const finalDpr = JSON.parse(finalDprJson);
        setReport(finalDpr);
      } catch (e) {
        setError('Failed to load the generated report data.');
      }
    } else {
      setError('No report data found. Please generate the DPR first.');
    }
    setIsLoading(false);

    // Clean up localStorage after loading
    return () => {
      localStorage.removeItem('finalDPR');
    };
  }, []);

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
          <FormattedText text={content || 'No content generated for this section.'} />
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
            Final compiled report.
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
          <FileDown className="mr-2" /> Export to PDF (₹50)
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
        {report &&
          Object.entries(report).map(([title, content], index) => (
            <Section
              key={index}
              title={`${index + 1}. ${title}`}
              content={content}
              isLoading={isLoading}
            />
          ))}
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
          <h2 className="text-xl font-semibold">
            Loading Final Report...
          </h2>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      }
    >
      <DPRReportContent />
    </Suspense>
  );
}

    