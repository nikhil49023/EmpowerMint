
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
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  generateDashboardSummaryAction,
  generateEmergencyFundSuggestionAction,
} from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import type { GenerateDashboardSummaryOutput } from '@/ai/flows/generate-dashboard-summary';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import { useLanguage } from '@/hooks/use-language';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  isDefault?: boolean;
};

export default function DashboardPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [transactions, setTransactions] = useState<ExtractedTransaction[]>([]);
  const [summary, setSummary] = useState<GenerateDashboardSummaryOutput | null>(
    null
  );
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(true);
  const [isLoadingSavingsGoals, setIsLoadingSavingsGoals] = useState(true);

  const [greeting, setGreeting] = useState('');
  const { translations } = useLanguage();
  const { toast } = useToast();

  // Dialog states
  const [addBudgetDialogOpen, setAddBudgetDialogOpen] = useState(false);
  const [addGoalDialogOpen, setAddGoalDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);

  // Form states
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');

  const invalidateDashboardCache = useCallback(() => {
    if (user) {
      const cacheKey = `dashboard-summary-${user.uid}`;
      localStorage.removeItem(cacheKey);
    }
  }, [user]);

  // --- Data Fetching and Real-time Listeners ---

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
        } catch (e) {
          console.error('Failed to parse cached summary', e);
          localStorage.removeItem(cacheKey);
        }
      }
    }
  }, [getCacheKey]);

  // Real-time listeners for all user data
  useEffect(() => {
    if (user) {
      const collections = [
        {
          path: 'transactions',
          setter: setTransactions,
          loader: setIsLoading,
        },
        {
          path: 'budgets',
          setter: setBudgets,
          loader: setIsLoadingBudgets,
        },
        {
          path: 'savings-goals',
          setter: setSavingsGoals,
          loader: setIsLoadingSavingsGoals,
        },
      ];

      const unsubscribes = collections.map(({ path, setter, loader }) => {
        loader(true);
        const collectionRef = collection(db, 'users', user.uid, path);
        const q = query(collectionRef);
        return onSnapshot(
          q,
          snapshot => {
            const data = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as any[];
            setter(data);
            loader(false);
          },
          async error => {
            console.error(`Error fetching ${path}: `, error);
            const permissionError = new FirestorePermissionError({
              path: `users/${user.uid}/${path}`,
              operation: 'list',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
            loader(false);
          }
        );
      });

      return () => unsubscribes.forEach(unsub => unsub());
    } else if (!loadingAuth) {
      // No user, reset all data
      setIsLoading(false);
      setIsLoadingBudgets(false);
      setIsLoadingSavingsGoals(false);
      setTransactions([]);
      setBudgets([]);
      setSavingsGoals([]);
    }
  }, [user, loadingAuth]);

  // Effect to generate summary when transactions change
  useEffect(() => {
    const fetchSummary = async () => {
      const cacheKey = getCacheKey();
      if (transactions.length === 0) {
        const defaultSummary = {
          totalIncome: 0,
          totalExpenses: 0,
          savingsRate: 0,
          suggestion: translations.dashboard.defaultSuggestion,
        };
        setSummary(defaultSummary);
        if (cacheKey)
          localStorage.setItem(cacheKey, JSON.stringify(defaultSummary));
        return;
      }
      setIsLoading(true);
      const result = await generateDashboardSummaryAction(transactions);
      if (result.success) {
        setSummary(result.data);
        if (cacheKey)
          localStorage.setItem(cacheKey, JSON.stringify(result.data));
      } else {
        console.error(result.error);
      }
      setIsLoading(false);
    };

    if (!loadingAuth && user) {
      fetchSummary();
    }
  }, [transactions, user, loadingAuth, translations, getCacheKey]);
  
    // Effect to create default emergency fund
  useEffect(() => {
    if (
      user &&
      !isLoadingSavingsGoals &&
      savingsGoals.length === 0 &&
      summary
    ) {
      const createDefaultGoal = async () => {
        const result = await generateEmergencyFundSuggestionAction({
          totalIncome: summary.totalIncome,
          totalExpenses: summary.totalExpenses,
        });

        if (result.success && result.data.recommendedAmount > 0) {
          const goalsCollectionRef = collection(
            db,
            'users',
            user.uid,
            'savings-goals'
          );
          const newGoalData = {
            name: 'Emergency Fund',
            targetAmount: result.data.recommendedAmount,
            isDefault: true,
          };
          addDoc(goalsCollectionRef, newGoalData).catch(
            async serverError => {
              const permissionError = new FirestorePermissionError({
                path: goalsCollectionRef.path,
                operation: 'create',
                requestResourceData: newGoalData,
              } satisfies SecurityRuleContext);
              errorEmitter.emit('permission-error', permissionError);
            }
          );
        }
      };

      // Check if a default goal already exists to prevent re-creation
      const hasDefault = savingsGoals.some(g => g.isDefault);
      if (!hasDefault) {
        createDefaultGoal();
      }
    }
  }, [user, savingsGoals, isLoadingSavingsGoals, summary]);

  // --- CRUD Operations ---

  const handleAddBudget = async () => {
    if (!user) return;
    if (!newBudgetName || !newBudgetAmount) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out all fields.',
      });
      return;
    }
    const budgetsCollectionRef = collection(db, 'users', user.uid, 'budgets');
    const newBudgetData = {
      name: newBudgetName,
      amount: parseFloat(newBudgetAmount),
    };

    addDoc(budgetsCollectionRef, newBudgetData)
      .then(() => {
        setNewBudgetName('');
        setNewBudgetAmount('');
        setAddBudgetDialogOpen(false);
        invalidateDashboardCache();
        toast({ title: 'Success', description: 'Budget added successfully.' });
      })
      .catch(async serverError => {
        const permissionError = new FirestorePermissionError({
          path: budgetsCollectionRef.path,
          operation: 'create',
          requestResourceData: newBudgetData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!user) return;
    const budgetDocRef = doc(db, 'users', user.uid, 'budgets', budgetId);
    deleteDoc(budgetDocRef)
      .then(() => {
        toast({
          title: 'Budget Deleted',
          description: 'The budget has been successfully removed.',
        });
        setBudgetToDelete(null);
        invalidateDashboardCache();
      })
      .catch(async serverError => {
        const permissionError = new FirestorePermissionError({
          path: budgetDocRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleAddGoal = async () => {
    if (!user) return;
    if (!newGoalName || !newGoalAmount) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out all fields.',
      });
      return;
    }
    const goalsCollectionRef = collection(
      db,
      'users',
      user.uid,
      'savings-goals'
    );
    const newGoalData = {
      name: newGoalName,
      targetAmount: parseFloat(newGoalAmount),
    };

    addDoc(goalsCollectionRef, newGoalData)
      .then(() => {
        setNewGoalName('');
        setNewGoalAmount('');
        setAddGoalDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Savings Goal added successfully.',
        });
      })
      .catch(async serverError => {
        const permissionError = new FirestorePermissionError({
          path: goalsCollectionRef.path,
          operation: 'create',
          requestResourceData: newGoalData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    const goalDocRef = doc(db, 'users', user.uid, 'savings-goals', goalId);
    deleteDoc(goalDocRef)
      .then(() => {
        toast({
          title: 'Goal Deleted',
          description: 'The savings goal has been successfully removed.',
        });
        setGoalToDelete(null);
      })
      .catch(async serverError => {
        const permissionError = new FirestorePermissionError({
          path: goalDocRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  // --- Memoized Computations ---

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || typeof amount !== 'number') {
      return <Skeleton className="h-8 w-32" />;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const totalSavings = useMemo(
    () => (summary ? summary.totalIncome - summary.totalExpenses : 0),
    [summary]
  );

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
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
      return { ...budget, spent, icon: categoryIcons[budget.name] || categoryIcons.Default };
    });
  }, [budgets, transactions]);
  
  const overallSavingsProgress = useMemo(() => {
      const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
      if (totalTarget === 0) return 0;
      return Math.min((totalSavings / totalTarget) * 100, 100);
  }, [savingsGoals, totalSavings]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {translations.dashboard.title}
        </h1>
        <p className="text-muted-foreground">{greeting}</p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Summary Cards */}
        <Card className="glassmorphic h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {translations.dashboard.yourExpenses}
            </CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-md">
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
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
          </CardContent>
        </Card>
        <Card className="glassmorphic h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {translations.dashboard.yourIncome}
            </CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
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
          </CardContent>
        </Card>
      </div>

      {/* Suggestion Card */}
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
                <span className="p-2 bg-accent/20 dark:bg-accent/10 rounded-full">
                  <Lightbulb className="w-4 h-4 text-accent-foreground" />
                </span>
                <div className="flex-1">
                  <AlertDescription className="text-base">
                    {summary?.suggestion}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Budgets Card & Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="glassmorphic cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle>Budgets</CardTitle>
                <CardDescription>
                  Track your monthly category spending.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBudgets ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : budgetsWithSpending.length > 0 ? (
                  <div className="space-y-4">
                    {budgetsWithSpending.slice(0, 2).map(budget => (
                      <div key={budget.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">
                            {budget.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(budget.spent)} /{' '}
                            {formatCurrency(budget.amount)}
                          </span>
                        </div>
                        <Progress
                          value={(budget.spent / budget.amount) * 100}
                        />
                      </div>
                    ))}
                    {budgetsWithSpending.length > 2 && (
                      <p className="text-sm text-center text-muted-foreground pt-2">
                        Click to see all budgets.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No budgets created yet.</p>
                    <p className="text-sm">Click here to add one.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Your Budgets</DialogTitle>
              <DialogDescription>
                Track and manage your monthly spending.
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
                      <PlusCircle className="mr-2 h-4 w-4" /> Add New Budget
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Budget</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        value={newBudgetName}
                        onChange={e => setNewBudgetName(e.target.value)}
                        placeholder="Budget Name (e.g., Groceries)"
                      />
                      <Input
                        type="number"
                        value={newBudgetAmount}
                        onChange={e => setNewBudgetAmount(e.target.value)}
                        placeholder="Amount (e.g., 5000)"
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button onClick={handleAddBudget}>Add Budget</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              {budgetsWithSpending.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No budgets created yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {budgetsWithSpending.map(budget => (
                    <Card key={budget.id} className="glassmorphic">
                       <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <budget.icon className="h-5 w-5 text-primary" />
                          {budget.name}
                        </CardTitle>
                         <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive h-6 w-6 -mt-1 -mr-2"
                          onClick={() => setBudgetToDelete(budget)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                         <div className="text-xl font-bold mb-2">
                           {formatCurrency(budget.amount)}
                         </div>
                        <Progress
                          value={(budget.spent / budget.amount) * 100}
                        />
                         <div className="flex justify-between text-sm mt-2">
                           <span>Spent: {formatCurrency(budget.spent)}</span>
                           <span className={budget.amount - budget.spent < 0 ? 'text-destructive' : ''}>
                             Remaining: {formatCurrency(budget.amount - budget.spent)}
                           </span>
                         </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Savings Goals Card & Dialog */}
        <Dialog>
            <DialogTrigger asChild>
                <Card className="glassmorphic h-full cursor-pointer hover:border-primary transition-colors">
                    <CardHeader>
                        <CardTitle>Savings Goals</CardTitle>
                        <CardDescription>Track your progress towards your financial goals.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingSavingsGoals ? (
                          <Skeleton className="h-10 w-full" />
                      ) : savingsGoals.length > 0 ? (
                          <div className="space-y-3">
                              <div className="flex justify-between items-end">
                                  <p className="text-2xl font-bold">{formatCurrency(totalSavings)}</p>
                                  <p className="text-muted-foreground">saved</p>
                              </div>
                              <Progress value={overallSavingsProgress} />
                              <p className="text-xs text-muted-foreground pt-2">
                                  {Math.round(overallSavingsProgress)}% of your total goals. Click to manage.
                              </p>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center py-4">
                               <Target className="w-12 h-12 text-muted-foreground mb-3" />
                               <p className="text-muted-foreground mb-4">You haven't set any savings goals yet.</p>
                               <Button variant="outline">Set a Goal</Button>
                          </div>
                      )}
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Your Savings Goals</DialogTitle>
                    <DialogDescription>
                      Set, track, and manage your financial goals. Your current total savings are <span className="font-bold text-primary">{formatCurrency(totalSavings)}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-8 py-4">
                    <div className="flex justify-end">
                        <Dialog open={addGoalDialogOpen} onOpenChange={setAddGoalDialogOpen}>
                            <DialogTrigger asChild>
                                <Button><PlusCircle className="mr-2 h-4 w-4"/> Add New Goal</Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader><DialogTitle>Add New Savings Goal</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Input value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder="Goal Name (e.g., New Car)"/>
                                    <Input type="number" value={newGoalAmount} onChange={(e) => setNewGoalAmount(e.target.value)} placeholder="Target Amount (e.g., 200000)"/>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                    <Button onClick={handleAddGoal}>Add Goal</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {savingsGoals.length === 0 ? (
                         <div className="text-center py-10 text-muted-foreground"><p>No savings goals created yet.</p></div>
                    ) : (
                        <div className="space-y-4">
                            {savingsGoals.map(goal => {
                                const progress = Math.min((totalSavings / goal.targetAmount) * 100, 100);
                                return (
                                    <Card key={goal.id} className="glassmorphic">
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold flex items-center gap-2">
                                                        {goal.isDefault && <ShieldAlert className="h-5 w-5 text-amber-500"/>}
                                                        {goal.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">Target: {formatCurrency(goal.targetAmount)}</p>
                                                </div>
                                                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-6 w-6 -mt-1 -mr-2" onClick={() => setGoalToDelete(goal)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <Progress value={progress} className="mt-2"/>
                                            <p className="text-xs text-right mt-1 text-muted-foreground">{Math.round(progress)}% funded</p>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog
        open={!!budgetToDelete}
        onOpenChange={open => !open && setBudgetToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Budget: {budgetToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{budgetToDelete?.name}" budget.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                budgetToDelete && handleDeleteBudget(budgetToDelete.id)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog
        open={!!goalToDelete}
        onOpenChange={open => !open && setGoalToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Goal: {goalToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{goalToDelete?.name}" savings goal.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                goalToDelete && handleDeleteGoal(goalToDelete.id)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
