
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  PiggyBank,
  PlusCircle,
  ShoppingBag,
  Film,
  Home,
  HeartPulse,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';

const categoryIcons: { [key: string]: React.ElementType } = {
  Groceries: ShoppingBag,
  Entertainment: Film,
  Rent: Home,
  Health: HeartPulse,
  Default: PiggyBank,
};

type Budget = {
  id: number;
  name: string;
  amount: number;
  spent: number;
  icon: React.ElementType;
};

const initialBudgets: Budget[] = [
  {
    id: 1,
    name: 'Groceries',
    amount: 8000,
    spent: 0,
    icon: ShoppingBag,
  },
  {
    id: 2,
    name: 'Entertainment',
    amount: 5000,
    spent: 0,
    icon: Film,
  },
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', initialBudgets);
  const [transactions] = useLocalStorage<ExtractedTransaction[]>('transactions', []);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [addBudgetDialogOpen, setAddBudgetDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const handleAddBudget = () => {
    if (!newBudgetName || !newBudgetAmount) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out all fields.',
      });
      return;
    }
    const newBudget: Budget = {
      id: budgets.length + 1,
      name: newBudgetName,
      amount: parseFloat(newBudgetAmount),
      spent: 0,
      icon: categoryIcons[newBudgetName] || categoryIcons.Default,
    };
    setBudgets(prev => [newBudget, ...prev]);
    setNewBudgetName('');
    setNewBudgetAmount('');
    setAddBudgetDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Budget added successfully.',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">
            Track and manage your monthly spending.
          </p>
        </div>
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
              <DialogDescription>
                Create a new budget to track your spending for a category.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newBudgetName}
                  onChange={e => setNewBudgetName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Groceries"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={newBudgetAmount}
                  onChange={e => setNewBudgetAmount(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., 5000"
                />
              </div>
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
        <Card className="flex items-center justify-center min-h-[400px] border-dashed shadow-none">
          <CardContent className="text-center p-6">
            <div className="flex justify-center mb-4">
              <PiggyBank className="w-16 h-16 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No Budgets Yet</h2>
            <p className="text-muted-foreground mt-2">
              Click "Add New Budget" to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
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
                <Card>
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
                        <p className="text-muted-foreground">Spent</p>
                        <p className="font-medium">
                          {formatCurrency(budget.spent)}
                        </p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <p className="text-muted-foreground">Remaining</p>
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
  );
}
