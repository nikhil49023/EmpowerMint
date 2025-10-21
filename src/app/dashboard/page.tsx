
'use client';

import {
  TrendingUp,
  PiggyBank,
  TrendingDown,
  Lightbulb,
  Loader2,
  Target,
  PlusCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { generateDashboardSummaryAction } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import type { GenerateDashboardSummaryOutput } from '@/ai/flows/generate-dashboard-summary';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, query, doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import { useLanguage } from '@/hooks/use-language';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/use-local-storage';
import Link from 'next/link';

type Budget = {
  id: string;
  name: string;
  amount: number;
  spent: number;
};

export default function DashboardPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [transactions, setTransactions] = useState<ExtractedTransaction[]>([]);
  const [summary, setSummary] = useState<GenerateDashboardSummaryOutput | null>(
    null
  );
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(true);
  const [greeting, setGreeting] = useState('');
  const { translations } = useLanguage();
  const [savingsGoal, setSavingsGoal] = useLocalStorage<number>(
    `savings-goal-${user?.uid || ''}`, 0
  );
  const [goalInput, setGoalInput] = useState<string>('');


  const getCacheKey = useCallback(() => {
    return user ? `dashboard-summary-${user.uid}` : null;
  }, [user]);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting(translations.dashboard.greeting.morning);
    } else if (hours < 18) {
      setGreeting(translations.dashboard.greeting.afternoon);
    } else {
      setGreeting(translations.dashboard.greeting.evening);
    }
  }, [translations]);
  
  useEffect(() => {
    if (savingsGoal > 0) {
      setGoalInput(String(savingsGoal));
    }
  }, [savingsGoal]);


  // Load initial summary from cache
  useEffect(() => {
    const cacheKey = getCacheKey();
    if (cacheKey) {
      const cachedSummary = localStorage.getItem(cacheKey);
      if (cachedSummary) {
        try {
          setSummary(JSON.parse(cachedSummary));
        } catch(e) {
          console.error("Failed to parse cached summary", e);
          localStorage.removeItem(cacheKey);
        }
      }
    }
  }, [getCacheKey]);

  // Real-time listener for transactions and budgets
  useEffect(() => {
    if (user) {
      // Transactions listener
      const transCollectionRef = collection(db, 'users', user.uid, 'transactions');
      const q = query(transCollectionRef);
      const unsubscribeTrans = onSnapshot(
        q,
        querySnapshot => {
          const transactionsData = querySnapshot.docs.map(
            doc => doc.data() as ExtractedTransaction
          );
          setTransactions(transactionsData);
          setIsLoading(false); // Transactions have loaded (or are empty)
        },
        async serverError => {
          const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/transactions`,
            operation: 'list',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
          setIsLoading(false);
        }
      );
      
      // Budgets listener
      const budgetCollectionRef = collection(db, 'users', user.uid, 'budgets');
      const budgetQuery = query(budgetCollectionRef);
      const unsubscribeBudgets = onSnapshot(
        budgetQuery,
        (snapshot) => {
          const budgetsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Budget, 'id' | 'spent'>),
            spent: 0, 
          }));
          setBudgets(budgetsData);
          setIsLoadingBudgets(false);
        },
        (error) => {
          console.error("Error fetching budgets: ", error);
           const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/budgets`,
            operation: 'list',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
          setIsLoadingBudgets(false);
        }
      );

      return () => {
        unsubscribeTrans();
        unsubscribeBudgets();
      };

    } else if (!loadingAuth) {
      // If there's no user and auth is not loading, we're done.
      setIsLoading(false);
      setIsLoadingBudgets(false);
    }
  }, [user, loadingAuth]);

  // Effect to generate summary when transactions change
  useEffect(() => {
    // This function will be triggered whenever `transactions` state updates.
    const fetchSummary = async () => {
      const cacheKey = getCacheKey();
      
      // If there are no transactions, set a default state and clear cache
      if (transactions.length === 0) {
        const defaultSummary = {
          totalIncome: 0,
          totalExpenses: 0,
          savingsRate: 0,
          suggestion: translations.dashboard.defaultSuggestion,
        };
        setSummary(defaultSummary);
        if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(defaultSummary));
        return; // No need to call the API
      }
      
      // Only generate a new summary if there are transactions
      // Set loading state for the summary generation specifically
      setIsLoading(true);
      const result = await generateDashboardSummaryAction(transactions);
      if (result.success) {
        setSummary(result.data);
        if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(result.data));
      } else {
        console.error(result.error);
        // On failure, don't clear the summary, maybe show a toast
        // This keeps stale data visible, which is better than nothing.
      }
      setIsLoading(false);
    };

    // We only want to fetch a summary if the user is logged in.
    // The `onSnapshot` listener will set transactions and trigger this effect.
    if (!loadingAuth && user) {
        fetchSummary();
    }
  }, [transactions, user, loadingAuth, translations, getCacheKey]);

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) {
      return <Skeleton className="h-8 w-32" />;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  const budgetsWithSpending = useMemo(() => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(
          t =>
            t.type === 'expense' &&
            t.description.toLowerCase().includes(budget.name.toLowerCase())
        )
        .reduce((sum, t) => {
          const amount = parseFloat(
            String(t.amount).replace(/[^0-9.-]+/g, '')
          );
          return sum + amount;
        }, 0);
      return { ...budget, spent };
    });
  }, [budgets, transactions]);
  
  const totalSavings = (summary?.totalIncome ?? 0) - (summary?.totalExpenses ?? 0);
  const savingsGoalProgress = savingsGoal > 0 ? Math.min((totalSavings / savingsGoal) * 100, 100) : 0;
  
  const handleSetGoal = () => {
    const newGoal = parseFloat(goalInput);
    if (!isNaN(newGoal) && newGoal >= 0) {
      setSavingsGoal(newGoal);
    }
  };


  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{translations.dashboard.title}</h1>
        <p className="text-muted-foreground">{greeting}</p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glassmorphic h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {translations.dashboard.yourExpenses}
            </CardTitle>
            <div className="p-2 bg-red-100 rounded-md">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">
              {isLoading && !summary ? (
                <Skeleton className="h-8 w-36" />
              ) : (
                formatCurrency(summary?.totalExpenses)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {translations.dashboard.thisMonth}
            </p>
          </CardContent>
        </Card>
        <Card className="glassmorphic h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {translations.dashboard.yourIncome}
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-md">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">
              {isLoading && !summary ? (
                <Skeleton className="h-8 w-36" />
              ) : (
                formatCurrency(summary?.totalIncome)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {translations.dashboard.thisMonth}
            </p>
          </CardContent>
        </Card>
        <Card className="glassmorphic h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {translations.dashboard.savingsRate}
            </CardTitle>
            <PiggyBank className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">
              {isLoading && !summary ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                `${summary?.savingsRate ?? 0}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {translations.dashboard.savingsRateDescription}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>{translations.dashboard.suggestionsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading && !summary ? (
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
                    <AlertDescription className="text-base md:text-lg">
                      {summary?.suggestion}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          <Card className="glassmorphic">
             <CardHeader>
                <CardTitle>Budgets</CardTitle>
                <CardDescription>Your monthly spending budgets.</CardDescription>
             </CardHeader>
             <CardContent>
                {isLoadingBudgets ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : budgetsWithSpending.length > 0 ? (
                     <div className="space-y-4">
                        {budgetsWithSpending.map(budget => {
                            const progress = Math.min((budget.spent / budget.amount) * 100, 100);
                            return (
                                <div key={budget.id}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">{budget.name}</span>
                                        <span className="text-sm text-muted-foreground">{formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}</span>
                                    </div>
                                    <Progress value={progress} />
                                </div>
                            )
                        })}
                     </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No budgets set yet.</p>
                        <Button variant="link" asChild>
                            <Link href="/transactions">Add a budget</Link>
                        </Button>
                    </div>
                )}
             </CardContent>
          </Card>
          <Card className="glassmorphic">
              <CardHeader>
                  <CardTitle>Savings Goal</CardTitle>
                  <CardDescription>Track your progress towards your monthly savings goal.</CardDescription>
              </CardHeader>
              <CardContent>
                { savingsGoal > 0 ? (
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <p className="text-2xl font-bold">{formatCurrency(totalSavings)}</p>
                            <p className="text-muted-foreground">of {formatCurrency(savingsGoal)}</p>
                        </div>
                        <Progress value={savingsGoalProgress} />
                        <div className="flex items-center gap-2 pt-2">
                            <Input 
                                type="number" 
                                placeholder="Update goal"
                                value={goalInput}
                                onChange={(e) => setGoalInput(e.target.value)}
                                className="h-9"
                             />
                            <Button onClick={handleSetGoal} size="sm">Set</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-4">
                         <Target className="w-12 h-12 text-muted-foreground mb-3" />
                         <p className="text-muted-foreground mb-4">You haven't set a savings goal yet.</p>
                         <div className="flex items-center gap-2">
                            <Input 
                                type="number" 
                                placeholder="Enter monthly goal"
                                value={goalInput}
                                onChange={(e) => setGoalInput(e.target.value)}
                            />
                            <Button onClick={handleSetGoal}>Set Goal</Button>
                        </div>
                    </div>
                )}
              </CardContent>
          </Card>
      </div>

    </div>
  );
}
