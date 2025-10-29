
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
  Trash2,
  ShieldAlert,
  FilePieChart,
  Loader2,
  Bell,
  Info,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import type { GenerateDashboardSummaryOutput } from '@/ai/schemas/dashboard-summary';
import { useAuth } from '@/context/auth-provider';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import type { GenerateFinBiteOutput } from '@/ai/schemas/fin-bite';
import { app } from '@/lib/firebase';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const db = getFirestore(app);

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
  const { user, userProfile, loading: loadingAuth } = useAuth();
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
  const router = useRouter();

  // Dialog states
  const [manageBudgetDialogOpen, setManageBudgetDialogOpen] = useState(false);
  const [addBudgetDialogOpen, setAddBudgetDialogOpen] = useState(false);
  const [addGoalDialogOpen, setAddGoalDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);

  // Form states
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');

  // FinBite state
  const [finBite, setFinBite] = useState<GenerateFinBiteOutput | null>(null);
  const [isLoadingFinBite, setIsLoadingFinBite] = useState(false);
  const [finBiteError, setFinBiteError] = useState<string | null>(null);
  
  const isMsme = userProfile?.role === 'msme';

  const fetchFinBite = useCallback(async () => {
    setIsLoadingFinBite(true);
    setFinBiteError(null);

    const cachedFinBite = sessionStorage.getItem('finBiteCache');
    if (cachedFinBite) {
      try {
        setFinBite(JSON.parse(cachedFinBite));
        setIsLoadingFinBite(false);
        return;
      } catch (e) {
        console.error("Failed to parse cached FinBite", e);
        sessionStorage.removeItem('finBiteCache');
      }
    }
    
    try {
        const response = await fetch('/api/fin-bite');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch updates.');
        }
        const data = await response.json();
        setFinBite(data);
        sessionStorage.setItem('finBiteCache', JSON.stringify(data));
    } catch (e: any) {
        setFinBiteError(e.message);
    } finally {
        setIsLoadingFinBite(false);
    }
  }, []);

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
          setIsLoading(false); // Assume not loading if we have cache
        } catch (e) {
          console.error('Failed to parse cached summary', e);
          localStorage.removeItem(cacheKey);
        }
      }
    }
  }, [getCacheKey]);

  useEffect(() => {
    if (user) {
      const unsubscribes: (() => void)[] = [];
  
      // Transactions listener
      const transactionsRef = collection(db, 'users', user.uid, 'transactions');
      unsubscribes.push(onSnapshot(transactionsRef, (snapshot) => {
        const fetchedTransactions = snapshot.docs.map(doc => doc.data() as ExtractedTransaction);
        setTransactions(fetchedTransactions);
        // Loading state for summary will be handled in its own effect
      }));
  
      // Budgets listener
      const budgetsRef = collection(db, 'users', user.uid, 'budgets');
      unsubscribes.push(onSnapshot(budgetsRef, (snapshot) => {
        const fetchedBudgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Budget));
        setBudgets(fetchedBudgets);
        setIsLoadingBudgets(false);
      }));

      // Savings Goals listener
      const goalsRef = collection(db, 'users', user.uid, 'savingsGoals');
       unsubscribes.push(onSnapshot(goalsRef, (snapshot) => {
        const fetchedGoals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as SavingsGoal));
        setSavingsGoals(fetchedGoals);
        setIsLoadingSavingsGoals(false);
      }));

      return () => unsubscribes.forEach(unsub => unsub());

    } else if (!loadingAuth) {
      router.push('/login');
      setIsLoading(false);
      setIsLoadingBudgets(false);
      setIsLoadingSavingsGoals(false);
      setTransactions([]);
      setBudgets([]);
      setSavingsGoals([]);
    }
  }, [user, loadingAuth, router]);

  // Effect to generate summary when transactions change
  useEffect(() => {
    if (loadingAuth || !user) return; // Don't run if auth is loading or no user

    const fetchSummary = async () => {
      const cacheKey = getCacheKey();
      
      if (transactions.length === 0 && !isLoading) {
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
      
      // Only set loading if we don't have a cached summary
      if (!summary) {
        setIsLoading(true);
      }

      try {
        const response = await fetch('/api/dashboard-summary', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ transactions })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Failed to generate summary.');
        }

        const data = await response.json();
        setSummary(data);
        if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error: any) {
         console.error("Error fetching dashboard summary:", error);
         toast({
          variant: "destructive",
          title: "Could not load summary",
          description: "There was an issue fetching the AI-powered summary."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [transactions, user, loadingAuth, translations, getCacheKey, toast]);
  
    // Effect to create default emergency fund
  useEffect(() => {
    if (
      user &&
      !isLoadingSavingsGoals &&
      savingsGoals.length === 0 &&
      summary &&
      !isMsme
    ) {
      const emergencyFundTarget = summary.totalExpenses > 0 ? summary.totalExpenses * 3 : 5000;
      const goalsRef = collection(db, 'users', user.uid, 'savingsGoals');
      addDoc(goalsRef, {
        name: 'Emergency Fund (3 months)',
        targetAmount: emergencyFundTarget,
        createdAt: serverTimestamp(),
        isDefault: true,
      });
    }
  }, [user, savingsGoals, isLoadingSavingsGoals, summary, isMsme]);

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
    const budgetsRef = collection(db, 'users', user.uid, 'budgets');
    await addDoc(budgetsRef, {
        name: newBudgetName,
        amount: parseFloat(newBudgetAmount),
        createdAt: serverTimestamp(),
    });
    setNewBudgetName('');
    setNewBudgetAmount('');
    setAddBudgetDialogOpen(false);
    invalidateDashboardCache();
    toast({ title: 'Success', description: 'Budget added successfully.' });
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'budgets', budgetId));
    toast({
      title: 'Budget Deleted',
      description: 'The budget has been successfully removed.',
    });
    setBudgetToDelete(null);
    invalidateDashboardCache();
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
    const goalsRef = collection(db, 'users', user.uid, 'savingsGoals');
    await addDoc(goalsRef, {
        name: newGoalName,
        targetAmount: parseFloat(newGoalAmount),
        createdAt: serverTimestamp()
    });
    setNewGoalName('');
    setNewGoalAmount('');
    setAddGoalDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Savings Goal added successfully.',
    });
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'savingsGoals', goalId));
    toast({
      title: 'Goal Deleted',
      description: 'The savings goal has been successfully removed.',
    });
    setGoalToDelete(null);
  };

  // --- Memoized Computations ---

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || typeof amount !== 'number') {
      return <Skeleton className="h-8 w-24" />;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totalFunds = useMemo(
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
      return Math.min((totalFunds / totalTarget) * 100, 100);
  }, [savingsGoals, totalFunds]);

  const MetricCard = ({ title, value, icon: Icon, iconBg, isLoading }: { title: string; value: string | React.ReactNode; icon: React.ElementType; iconBg: string; isLoading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 ${iconBg} rounded-md`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xl md:text-3xl font-bold">
          {isLoading ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            value
          )}
        </div>
      </CardContent>
    </Card>
  );

    const autoplayPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

    if (loadingAuth || (!user && isLoading)) {
      return (
          <div className="flex h-screen w-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
    }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {translations.dashboard.title}
          </h1>
          <p className="text-muted-foreground">{greeting}, {user?.displayName || 'there'}</p>
        </div>
         <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 flex-shrink-0 hidden md:flex" onClick={fetchFinBite}>
                    <Bell className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Latest Updates</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-4">
                    {isLoadingFinBite ? (
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : finBiteError ? (
                        <Alert variant="destructive">
                            <AlertDescription>{finBiteError}</AlertDescription>
                        </Alert>
                    ) : finBite?.updates ? (
                       finBite.updates.map((update, index) => (
                         <Card key={index} className="bg-background">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                     <Info className="h-5 w-5 text-primary flex-shrink-0" />
                                     {update.category}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <p className="font-semibold">{update.title}</p>
                                <p className="text-sm text-muted-foreground">{update.summary}</p>
                            </CardContent>
                        </Card>
                       ))
                    ) : null}
                    <Button variant="secondary" onClick={fetchFinBite} disabled={isLoadingFinBite}>
                        {isLoadingFinBite ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Refresh Updates
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
      </div>

       {/* Mobile Carousel */}
      <div className="md:hidden">
        <Carousel
          opts={{ loop: true }}
          plugins={[autoplayPlugin.current]}
        >
          <CarouselContent>
            <CarouselItem>
              <MetricCard
                title={translations.dashboard.yourExpenses}
                value={formatCurrency(summary?.totalExpenses)}
                icon={TrendingDown}
                iconBg="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                isLoading={isLoading}
              />
            </CarouselItem>
            <CarouselItem>
              <MetricCard
                 title={isMsme ? "Total Profits" : "Savings Rate"}
                 value={isMsme ? formatCurrency(totalFunds) : `${summary?.savingsRate ?? 0}%`}
                 icon={isMsme ? DollarSign : PiggyBank}
                 iconBg="bg-primary/10 text-primary"
                 isLoading={isLoading}
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid gap-4 grid-cols-1 sm:grid-cols-2">
        <MetricCard
            title={translations.dashboard.yourExpenses}
            value={formatCurrency(summary?.totalExpenses)}
            icon={TrendingDown}
            iconBg="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
            isLoading={isLoading}
        />
        <MetricCard
            title={isMsme ? "Total Profits" : "Savings Rate"}
            value={isMsme ? formatCurrency(totalFunds) : `${summary?.savingsRate ?? 0}%`}
            icon={isMsme ? DollarSign : PiggyBank}
            iconBg="bg-primary/10 text-primary"
            isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 grid-cols-1">
        <MetricCard
            title={translations.dashboard.yourIncome}
            value={formatCurrency(summary?.totalIncome)}
            icon={TrendingUp}
            iconBg="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
            isLoading={isLoading}
        />
      </div>


      {/* Suggestion Card */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle>{translations.dashboard.suggestionsTitle}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <Alert className="border-primary/30 bg-primary/5">
              <div className="flex items-start gap-3">
                <span className="pt-1">
                  <Lightbulb className="w-4 h-4 text-primary" />
                </span>
                <div className="flex-1">
                  <AlertDescription className="text-sm text-foreground">
                    {summary?.suggestion}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Budgets Card */}
        <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle>Budgets</CardTitle>
                <CardDescription>
                  Track your monthly category spending.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
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
                        Click "Manage Budgets" to see all.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No budgets created yet.</p>
                    <Button variant="link" className="p-0 h-auto" onClick={() => setAddBudgetDialogOpen(true)}>Click here to add one.</Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 md:p-6 flex-col sm:flex-row gap-2 pt-4 border-t">
                  <Button variant="outline" className="w-full" onClick={() => setManageBudgetDialogOpen(true)}>
                      Manage Budgets
                  </Button>
                  <Button className="w-full" onClick={() => router.push('/budget-report')}>
                      <FilePieChart className="mr-2 h-4 w-4"/>
                      {isMsme ? "GST / IT Filings" : "Generate Report"}
                  </Button>
              </CardFooter>
        </Card>
        
        {/* Savings / Development Goals Card */}
        <Dialog>
            <DialogTrigger asChild>
                <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle>{isMsme ? "Development Goals" : "Savings Goals"}</CardTitle>
                        <CardDescription>{isMsme ? "Track funds for business growth milestones." : "Track your progress towards your financial goals."}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                      {isLoadingSavingsGoals ? (
                          <Skeleton className="h-10 w-full" />
                      ) : savingsGoals.length > 0 ? (
                          <div className="space-y-3">
                              <div className="flex justify-between items-end">
                                  <p className="text-2xl font-bold">{formatCurrency(totalFunds)}</p>
                                  <p className="text-muted-foreground">{isMsme ? "funded" : "saved"}</p>
                              </div>
                              <Progress value={overallSavingsProgress} />
                              <p className="text-xs text-muted-foreground pt-2">
                                  {Math.round(overallSavingsProgress)}% of your total goals. Click to manage.
                              </p>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center py-4">
                               <Target className="w-12 h-12 text-muted-foreground mb-3" />
                               <p className="text-muted-foreground mb-4">{isMsme ? "No development goals set yet." : "You haven't set any savings goals yet."}</p>
                               <Button variant="outline">Set a Goal</Button>
                          </div>
                      )}
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent className="max-w-full w-11/12 sm:max-w-md md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isMsme ? "Your Development Goals" : "Your Savings Goals"}</DialogTitle>
                    <DialogDescription>
                      {isMsme ? "Set, track, and manage your business development milestones. Your current available funds are " : "Set, track, and manage your financial goals. Your current total savings are "} 
                      <span className="font-bold text-primary">{formatCurrency(totalFunds)}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-8 py-4">
                    <div className="flex justify-end">
                        <Dialog open={addGoalDialogOpen} onOpenChange={setAddGoalDialogOpen}>
                            <DialogTrigger asChild>
                                <Button><PlusCircle className="mr-2 h-4 w-4"/> Add New Goal</Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader><DialogTitle>Add New {isMsme ? "Development" : "Savings"} Goal</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Input value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder={isMsme ? "e.g., Marketing Campaign" : "e.g., New Car"}/>
                                    <Input type="number" value={newGoalAmount} onChange={(e) => setNewGoalAmount(e.target.value)} placeholder="Target Amount (e.g., 50000)"/>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                    <Button onClick={handleAddGoal}>Add Goal</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {savingsGoals.length === 0 ? (
                         <div className="text-center py-10 text-muted-foreground"><p>No goals created yet.</p></div>
                    ) : (
                        <div className="space-y-4">
                            {savingsGoals.map(goal => {
                                const progress = Math.min((totalFunds / goal.targetAmount) * 100, 100);
                                return (
                                    <Card key={goal.id}>
                                        <CardContent className="p-4">
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
      
      {/* Budgets Dialog */}
      <Dialog open={manageBudgetDialogOpen} onOpenChange={setManageBudgetDialogOpen}>
          <DialogContent className="max-w-full w-11/12 sm:max-w-md md:max-w-2xl">
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
                    <Card key={budget.id}>
                       <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
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
                      <CardContent className="p-4 pt-0">
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
