
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  collection,
  query,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown, ArrowLeft, FilePieChart } from 'lucide-react';
import { generateBudgetReportAction } from '@/app/actions';
import type { GenerateBudgetReportOutput } from '@/ai/schemas/budget-report';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import { Skeleton } from '@/components/ui/skeleton';
import { FormattedText } from '@/components/financify/formatted-text';
import { ProjectCostPieChart } from '@/components/financify/dpr-charts';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

export default function BudgetReportPage() {
  const [user] = useAuthState(auth);
  const [transactions, setTransactions] = useState<ExtractedTransaction[]>([]);
  const [report, setReport] = useState<GenerateBudgetReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const transCollectionRef = collection(db, 'users', user.uid, 'transactions');
      const transQuery = query(transCollectionRef);
      const unsubscribe = onSnapshot(
        transQuery,
        (snapshot) => {
          const transData = snapshot.docs.map(doc => ({
            ...(doc.data() as ExtractedTransaction),
          }));
          setTransactions(transData);
          setIsLoading(false);
        },
        (error) => {
          const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/transactions`,
            operation: 'list',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
          setIsLoading(false);
          setError('Could not fetch transaction data. Please check your permissions.');
        }
      );
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating && progress < 90) {
      timer = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isGenerating, progress]);

  const handleGenerateReport = async () => {
    if (transactions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot Generate Report',
        description: 'You must have at least one expense to generate a report.',
      });
      return;
    }
    setIsGenerating(true);
    setProgress(5);
    setError(null);
    const result = await generateBudgetReportAction({ transactions });
    if (result.success) {
      setProgress(100);
      setReport(result.data);
    } else {
      setError(result.error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: result.error,
      });
    }
    setIsGenerating(false);
  };

  const handleExport = () => {
    window.print();
  };

  const totalExpenses = report?.expenseBreakdown.reduce((acc, item) => acc + item.value, 0) || 0;
  
  if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <h2 className="text-xl font-semibold">Loading Transaction Data...</h2>
        </div>
      )
  }

  return (
    <div className="space-y-8">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }
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
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="flex justify-between items-start no-print">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FilePieChart />
            Budget Report
          </h1>
          <p className="text-muted-foreground">
            Generate a detailed analysis of your monthly expenses.
          </p>
        </div>
         <Button variant="ghost" asChild className="-ml-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

       <div className="flex gap-2 no-print">
         <Button onClick={handleGenerateReport} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : null}
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!report}
        >
          <FileDown className="mr-2" /> Export to PDF
        </Button>
      </div>

      {error && !isGenerating && (
        <Card className="text-center py-10 bg-destructive/10 border-destructive no-print">
          <CardHeader>
            <CardTitle>Error Generating Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
         <Card>
            <CardHeader>
                <CardTitle>Generating Your Report...</CardTitle>
                <CardDescription>The AI is analyzing your transactions. This might take a moment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                 <Progress value={progress} className="w-full" />
                 <p className="text-center text-sm text-muted-foreground">{Math.round(progress)}% Complete</p>
                 <div className="space-y-2 pt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                 <Skeleton className="h-72 w-full" />
            </CardContent>
         </Card>
      )}
      
      {!report && !isGenerating && transactions.length > 0 && (
         <Card className="text-center py-20">
             <CardContent>
                 <FilePieChart className="h-16 w-16 mx-auto text-muted-foreground mb-4"/>
                <h3 className="text-xl font-semibold">Ready to Analyze Your Budget?</h3>
                <p className="text-muted-foreground mt-2">Click "Generate Report" to get a detailed breakdown of your spending.</p>
             </CardContent>
         </Card>
      )}

       {!report && !isGenerating && transactions.length === 0 && (
         <Card className="text-center py-20">
             <CardContent>
                <h3 className="text-xl font-semibold">No Transaction Data</h3>
                <p className="text-muted-foreground mt-2">Please add some transactions before generating a report.</p>
                <Button asChild className="mt-4"><Link href="/transactions">Add Transactions</Link></Button>
             </CardContent>
         </Card>
      )}

      {report && !isGenerating && (
        <div id="print-section" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Expense Report</CardTitle>
                    <CardDescription>
                        An AI-generated analysis of your spending habits.
                        Total expenses analyzed: <span className="font-bold text-primary">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalExpenses)}</span>
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>AI-Powered Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormattedText text={report.summary} />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                     <ProjectCostPieChart data={report.expenseBreakdown} />
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
