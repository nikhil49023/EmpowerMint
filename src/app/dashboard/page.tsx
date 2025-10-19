
'use client';

import {
  TrendingUp,
  PiggyBank,
  TrendingDown,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import React, { useEffect, useState, useCallback } from 'react';
import {
  generateDashboardSummaryAction,
} from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import type { GenerateDashboardSummaryOutput } from '@/ai/flows/generate-dashboard-summary';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import { useLanguage } from '@/hooks/use-language';

export default function DashboardPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [transactions, setTransactions] = useState<ExtractedTransaction[]>([]);
  const [summary, setSummary] = useState<GenerateDashboardSummaryOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const { translations } = useLanguage();
  
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
  
  // Load initial summary from cache
  useEffect(() => {
    const cacheKey = getCacheKey();
    if (cacheKey) {
      const cachedSummary = localStorage.getItem(cacheKey);
      if (cachedSummary) {
        setSummary(JSON.parse(cachedSummary));
        setIsLoading(false);
      }
    }
  }, [getCacheKey]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'transactions'));
      const unsubscribe = onSnapshot(
        q,
        querySnapshot => {
          const transactionsData = querySnapshot.docs.map(
            doc => doc.data() as ExtractedTransaction
          );
          setTransactions(transactionsData);
        },
        async serverError => {
          const permissionError = new FirestorePermissionError({
            path: q.path,
            operation: 'list',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        }
      );
      return () => unsubscribe();
    } else if (!loadingAuth) {
      setIsLoading(false);
    }
  }, [user, loadingAuth]);

  const fetchSummary = useCallback(async () => {
    const cacheKey = getCacheKey();
    
    // If there are no transactions, set a default state and clear cache
    if (transactions.length === 0 && !loadingAuth && user) {
      const defaultSummary = {
        totalIncome: 0,
        totalExpenses: 0,
        savingsRate: 0,
        suggestion: translations.dashboard.defaultSuggestion,
      };
      setSummary(defaultSummary);
      if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(defaultSummary));
      setIsLoading(false);
      return;
    }
    
    // Only generate a new summary if there are transactions
    if (transactions.length > 0) {
      setIsLoading(true);
      const result = await generateDashboardSummaryAction(transactions);
      if (result.success) {
        setSummary(result.data);
        if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(result.data));
      } else {
        console.error(result.error);
        // On failure, clear cache to avoid showing stale data
        if(cacheKey) localStorage.removeItem(cacheKey);
      }
      setIsLoading(false);
    }
  }, [transactions, user, loadingAuth, translations, getCacheKey]);

  useEffect(() => {
    // Only run fetchSummary if transactions have been loaded from Firestore
    // This prevents running it with an empty array on initial load
    if(!loadingAuth && user) {
        fetchSummary();
    }
  }, [transactions, loadingAuth, user, fetchSummary]);

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) {
      return <Skeleton className="h-8 w-32" />;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
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
    </div>
  );
}
