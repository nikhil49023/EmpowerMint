
'use client';

import {
  TrendingUp,
  PiggyBank,
  Settings,
  TrendingDown,
  Lightbulb,
  Loader2,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import React, { useEffect, useState, useCallback } from 'react';
import { generateDashboardSummaryAction } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import type { GenerateDashboardSummaryOutput } from '@/ai/flows/generate-dashboard-summary';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [transactions] = useLocalStorage<ExtractedTransaction[]>('transactions', []);
  const [summary, setSummary] = useState<GenerateDashboardSummaryOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const { toast } = useToast();

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good Morning, there!');
    } else if (hours < 18) {
      setGreeting('Good Afternoon, there!');
    } else {
      setGreeting('Good Evening, there!');
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    const result = await generateDashboardSummaryAction(transactions);
    if (result.success) {
      setSummary(result.data);
    } else {
      console.error(result.error);
      // Handle error state if needed
    }
    setIsLoading(false);
  }, [transactions]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) {
      return (
        <Skeleton className="h-8 w-32" />
      );
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  const copyToClipboard = () => {
    if (projectId) {
      navigator.clipboard.writeText(projectId);
      toast({
        title: "Copied!",
        description: "Project ID copied to clipboard.",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">{greeting}</p>
      </div>
      
       <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>Your Firebase Backend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your app is connected to a unique Firebase project. Use the Project ID below to access your backend console.
          </p>
          <div className="flex items-center gap-4 p-3 rounded-md bg-muted">
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground">PROJECT ID</p>
              <p className="font-mono text-lg">{projectId || 'Loading...'}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy className="h-5 w-5" />
            </Button>
          </div>
           <Button asChild className="mt-4">
              <a
                href={`https://console.firebase.google.com/project/${projectId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Firebase Console <ExternalLink className="ml-2" />
              </a>
            </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glassmorphic h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Expenses</CardTitle>
            <div className="p-2 bg-red-100 rounded-md">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-36" /> : formatCurrency(summary?.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="glassmorphic h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Income</CardTitle>
            <div className="p-2 bg-green-100 rounded-md">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
               {isLoading ? <Skeleton className="h-8 w-36" /> : formatCurrency(summary?.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="glassmorphic">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          <PiggyBank className="w-5 h-5 text-primary" />
        </CardHeader>
        <CardContent>
           <div className="text-3xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-20" /> : `${summary?.savingsRate ?? 0}%`}
          </div>
          <p className="text-xs text-muted-foreground">
            Of your income this month
          </p>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Personalized Suggestions</h2>
          <Settings className="w-5 h-5 text-muted-foreground cursor-pointer" />
        </div>
        <Card className="glassmorphic">
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <Alert className="border-0 p-0 bg-transparent">
                <div className="flex items-start gap-3">
                  <span className="p-2 bg-accent rounded-full">
                    <Lightbulb className="w-4 h-4 text-accent-foreground" />
                  </span>
                  <div className="flex-1">
                    <AlertDescription>{summary?.suggestion}</AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
