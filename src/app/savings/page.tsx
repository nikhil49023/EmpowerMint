
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { Target, TrendingUp, TrendingDown, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot, query } from 'firebase/firestore';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import { Skeleton } from '@/components/ui/skeleton';

export default function SavingsPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [savingsGoal, setSavingsGoal] = useLocalStorage<number>(
    `savings-goal-${user?.uid || ''}`, 0
  );
  const [goalInput, setGoalInput] = useState<string>('');
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<ExtractedTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    if (savingsGoal > 0) {
      setGoalInput(String(savingsGoal));
    }
  }, [savingsGoal]);

  useEffect(() => {
    if (user) {
      setLoadingTransactions(true);
      const transCollectionRef = collection(db, 'users', user.uid, 'transactions');
      const q = query(transCollectionRef);
      const unsubscribe = onSnapshot(
        q,
        querySnapshot => {
          const transactionsData = querySnapshot.docs.map(
            doc => doc.data() as ExtractedTransaction
          );
          setTransactions(transactionsData);
          setLoadingTransactions(false);
        },
        error => {
          console.error("Error fetching transactions: ", error);
          setLoadingTransactions(false);
        }
      );
      return () => unsubscribe();
    } else if (!loadingAuth) {
      setLoadingTransactions(false);
    }
  }, [user, loadingAuth]);

  const { totalIncome, totalExpenses, totalSavings } = useMemo(() => {
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
    return {
      totalIncome: income,
      totalExpenses: expenses,
      totalSavings: income - expenses,
    };
  }, [transactions]);

  const savingsGoalProgress = savingsGoal > 0 ? Math.min((totalSavings / savingsGoal) * 100, 100) : 0;

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
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const isLoading = loadingAuth || loadingTransactions;

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Target /> Savings Goal
        </h1>
        <p className="text-muted-foreground">
          Set and track your monthly savings goal to stay on top of your finances.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glassmorphic h-full">
            <CardHeader>
              <CardTitle>Set Your Monthly Goal</CardTitle>
              <CardDescription>
                Define how much you want to save each month. We'll help you track it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                            disabled={isLoading}
                        />
                        <Button onClick={handleSetGoal} size="lg" disabled={isLoading}>Set Goal</Button>
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
            </CardContent>
          </Card>
        </div>
        
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle>This Month's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><TrendingUp className="text-green-500"/> Total Income</span>
                            <span className="font-bold">{formatCurrency(totalIncome)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><TrendingDown className="text-red-500"/> Total Expenses</span>
                            <span className="font-bold">{formatCurrency(totalExpenses)}</span>
                        </div>
                         <div className="flex items-center justify-between pt-2 border-t">
                            <span className="font-semibold flex items-center gap-2"><PiggyBank className="text-primary"/> Net Savings</span>
                            <span className="font-bold text-lg text-primary">{formatCurrency(totalSavings)}</span>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
        
        <div className="lg:col-span-3">
             <Card className="glassmorphic">
                <CardHeader>
                    <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Loader2 className="animate-spin" /> : savingsGoal > 0 ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-3xl font-bold">{formatCurrency(totalSavings)}</p>
                                <p className="text-muted-foreground">of {formatCurrency(savingsGoal)}</p>
                            </div>
                            <Progress value={savingsGoalProgress} className="h-4"/>
                            {totalSavings >= savingsGoal ? (
                                <p className="text-green-600 font-semibold text-center pt-2">Congratulations! You've reached your goal this month!</p>
                            ) : (
                                <p className="text-muted-foreground text-center pt-2">You're {Math.round(savingsGoalProgress)}% of the way there. Keep it up!</p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>Set a savings goal above to see your progress.</p>
                        </div>
                    )}
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
