
'use client';

import {
  TrendingUp,
  PiggyBank,
  TrendingDown,
  Lightbulb,
  Target,
  PlusCircle,
  ShoppingBag,
  Film,
  Home,
  HeartPulse,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { generateDashboardSummaryAction } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import type { GenerateDashboardSummaryOutput } from '@/ai/flows/generate-dashboard-summary';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, query, doc, addDoc } from 'firebase/firestore';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const categoryIcons: { [key: string]: React.ElementType } = {
  Groceries: ShoppingBag,
  Entertainment: Film,
  Rent: Home,
  Health: HeartPulse,
  Default: PiggyBank,
};

type Budget = {
  id: string;
  name: string;
  amount: number;
  spent: number;
  icon: React.ElementType;
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
  
  const [addBudgetDialogOpen, setAddBudgetDialogOpen] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (savingsGoal > 0) {
      setGoalInput(String(savingsGoal));
    }
  }, [savingsGoal]);
  
  const handleSetGoal = () => {
    const newGoal = parseFloat(goalInput);
    if (!isNaN(newGoal) && newGoal >= 0) {
      setSavingsGoal(newGoal);
      toast({
        title: 'Savings Goal Updated',
        description: `Your new monthly savings goal is ${formatCurrency(newGoal)}.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please enter a valid number for your savings goal.',
      });
    }
  };

  const invalidateDashboardCache = useCallback(() => {
    if (user) {
      const cacheKey = `dashboard-summary-${user.uid}`;
      localStorage.removeItem(cacheKey);
    }
  }, [user]);

  const handleAddBudget = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: translations.transactions.toasts.errorLoginToAddBudget,
      });
      return;
    }
    if (!newBudgetName || !newBudgetAmount) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: translations.transactions.toasts.errorFillFields,
      });
      return;
    }
    const newBudgetData = {
      name: newBudgetName,
      amount: parseFloat(newBudgetAmount),
    };

    const budgetsCollectionRef = collection(db, 'users', user.uid, 'budgets');

    addDoc(budgetsCollectionRef, newBudgetData)
      .catch(async serverError => {
        const permissionError = new FirestorePermissionError({
          path: budgetsCollectionRef.path,
          operation: 'create',
          requestResourceData: newBudgetData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      }).then(() => {
        setNewBudgetName('');
        setNewBudgetAmount('');
        setAddBudgetDialogOpen(false);
        invalidateDashboardCache();
        toast({
          title: 'Success',
          description: translations.transactions.toasts.successAddBudget,
        });
      });
  };

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
            ...(doc.data() as Omit<Budget, 'id' | 'spent' | 'icon'>),
            spent: 0,
            icon: categoryIcons[doc.data().name] || categoryIcons.Default,
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
  
  const totalSavings = useMemo(() => {
    if (summary) {
        return summary.totalIncome - summary.totalExpenses;
    }
    let income = 0;
    let expenses = 0;
    transactions.forEach(t => {
      const amount = parseFloat(String(t.amount).replace(/[^0-9.-]+/g, ''));
      if (t.type === 'income') {
        income += amount;
      } else {
        expenses += amount;
      }
    });
    return income - expenses;
  }, [summary, transactions]);

  const savingsGoalProgress = savingsGoal > 0 ? Math.min((totalSavings / savingsGoal) * 100, 100) : 0;
  
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
          <Dialog>
            <DialogTrigger asChild>
                <Card className="glassmorphic cursor-pointer hover:border-primary transition-colors">
                  <CardHeader>
                      <CardTitle>{translations.transactions.budgetsDialog.title}</CardTitle>
                      <CardDescription>{translations.transactions.budgetsDialog.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {isLoadingBudgets ? (
                          <div className="space-y-4">
                              <Skeleton className="h-10 w-full" />
                              <Skeleton className="h-10 w-full" />
                          </div>
                      ) : budgetsWithSpending.length > 0 ? (
                          <div className="space-y-4">
                              {budgetsWithSpending.slice(0, 2).map(budget => {
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
                              {budgetsWithSpending.length > 2 && <p className="text-sm text-center text-muted-foreground pt-2">Click to see all budgets.</p>}
                          </div>
                      ) : (
                          <div className="text-center py-8 text-muted-foreground">
                              <p>{translations.transactions.budgetsDialog.noBudgetsTitle}</p>
                              <p className="text-sm">Click here to add one.</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{translations.transactions.budgetsDialog.title}</DialogTitle>
                <DialogDescription>
                  {translations.transactions.budgetsDialog.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-8 py-4">
                <div className="flex justify-end">
                  <Dialog
                    open={addBudgetDialogOpen}
                    onOpenChange={setAddBudgetDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> {translations.transactions.budgetsDialog.addNewBudget}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{translations.transactions.addBudgetDialog.title}</DialogTitle>
                        <DialogDescription>
                          {translations.transactions.addBudgetDialog.description}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            {translations.transactions.addBudgetDialog.nameLabel}
                          </Label>
                          <Input
                            id="name"
                            value={newBudgetName}
                            onChange={e => setNewBudgetName(e.target.value)}
                            className="col-span-3"
                            placeholder={translations.transactions.addBudgetDialog.namePlaceholder}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="amount" className="text-right">
                            {translations.transactions.addBudgetDialog.amountLabel}
                          </Label>
                          <Input
                            id="amount"
                            type="number"
                            value={newBudgetAmount}
                            onChange={e => setNewBudgetAmount(e.target.value)}
                            className="col-span-3"
                            placeholder={translations.transactions.addBudgetDialog.amountPlaceholder}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">
                            {translations.transactions.addBudgetDialog.cancel}
                          </Button>
                        </DialogClose>
                        <Button onClick={handleAddBudget}>{translations.transactions.addBudgetDialog.addBudget}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                {budgetsWithSpending.length === 0 ? (
                  <Card className="flex items-center justify-center min-h-[200px] border-dashed shadow-none glassmorphic">
                    <CardContent className="text-center p-6">
                      <div className="flex justify-center mb-4">
                        <PiggyBank className="w-16 h-16 text-muted-foreground" />
                      </div>
                      <h2 className="text-xl font-semibold">{translations.transactions.budgetsDialog.noBudgetsTitle}</h2>
                      <p className="text-muted-foreground mt-2">
                        {translations.transactions.budgetsDialog.noBudgetsDescription}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <motion.div
                    className="grid gap-6 md:grid-cols-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {budgetsWithSpending.map((budget, index) => {
                      const Icon = budget.icon;
                      const progress = (budget.spent / budget.amount) * 100;
                      const remaining = budget.amount - budget.spent;

                      return (
                        <motion.div
                          key={budget.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="glassmorphic">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                              <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Icon className="h-5 w-5 text-primary" />
                                {budget.name}
                              </CardTitle>
                              <div className="text-sm font-bold">
                                {formatCurrency(budget.amount)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <Progress value={progress} />
                                <div className="flex justify-between text-sm">
                                  <p className="text-muted-foreground">
                                    {translations.transactions.budgetsDialog.spent}
                                  </p>
                                  <p className="font-medium">
                                    {formatCurrency(budget.spent)}
                                  </p>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <p className="text-muted-foreground">
                                    {translations.transactions.budgetsDialog.remaining}
                                  </p>
                                  <p
                                    className={`font-medium ${
                                      remaining < 0 ? 'text-destructive' : ''
                                    }`}
                                  >
                                    {formatCurrency(remaining)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
                <Card className="glassmorphic h-full cursor-pointer hover:border-primary transition-colors">
                    <CardHeader>
                        <CardTitle>Savings Goal</CardTitle>
                        <CardDescription>Track and manage your monthly savings goal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      { savingsGoal > 0 ? (
                          <div className="space-y-3">
                              <div className="flex justify-between items-end">
                                  <p className="text-2xl font-bold">{formatCurrency(totalSavings)}</p>
                                  <p className="text-muted-foreground">of {formatCurrency(savingsGoal)}</p>
                              </div>
                              <Progress value={savingsGoalProgress} />
                              <p className="text-xs text-muted-foreground pt-2">Click to edit your goal.</p>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center py-4">
                               <Target className="w-12 h-12 text-muted-foreground mb-3" />
                               <p className="text-muted-foreground mb-4">You haven't set a savings goal yet.</p>
                               <Button variant="outline">Set a Goal</Button>
                          </div>
                      )}
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set Your Savings Goal</DialogTitle>
                    <DialogDescription>
                      Define how much you want to save each month. We'll help you track it.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="savingsGoal" className="text-base">Your Monthly Savings Goal (INR)</Label>
                      <div className="flex items-center gap-2">
                          <Input 
                              id="savingsGoal"
                              type="number" 
                              placeholder="e.g., 10000"
                              value={goalInput}
                              onChange={(e) => setGoalInput(e.target.value)}
                              className="h-12 text-lg"
                              disabled={loadingAuth}
                          />
                          <Button onClick={handleSetGoal} size="lg" disabled={loadingAuth}>Set Goal</Button>
                      </div>
                  </div>
                   {savingsGoal > 0 && (
                      <div>
                          <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                              <Info className="h-4 w-4" />
                              Your goal of <span className="font-bold">{formatCurrency(savingsGoal)}</span> is saved in your browser.
                          </p>
                      </div>
                  )}
                </div>
            </DialogContent>
          </Dialog>
      </div>

    </div>
  );
}
