
'use client';

import { useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  Trash2,
  Upload,
  Loader2,
  FileUp,
  PiggyBank,
  ShoppingBag,
  Film,
  Home,
  HeartPulse,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { extractTransactionsAction } from '../actions';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { motion } from 'framer-motion';

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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useLocalStorage<
    ExtractedTransaction[]
  >('transactions', []);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    date: '',
    type: 'expense' as 'income' | 'expense',
    amount: '',
  });
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addTransactionDialogOpen, setAddTransactionDialogOpen] =
    useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Budget state and logic moved here
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', initialBudgets);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [addBudgetDialogOpen, setAddBudgetDialogOpen] = useState(false);

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


  const handleClearData = () => {
    setTransactions([]);
    toast({
      title: 'Success',
      description: 'All transaction data has been cleared.',
    });
  };

  const handleAddTransaction = () => {
    if (
      !newTransaction.description ||
      !newTransaction.date ||
      !newTransaction.amount
    ) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out all fields.',
      });
      return;
    }
    setTransactions(prev => [newTransaction, ...prev]);
    setNewTransaction({
      description: '',
      date: '',
      type: 'expense',
      amount: '',
    });
    setAddTransactionDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Transaction added successfully.',
    });
  };

  const processFile = async (file: File) => {
    setIsImporting(true);
    setImportDialogOpen(false);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const documentDataUri = reader.result as string;
        const result = await extractTransactionsAction({ documentDataUri });

        if (result.success) {
          setTransactions(prev => [...result.data.transactions, ...prev]);
          toast({
            title: 'Import Successful',
            description: `${result.data.transactions.length} transactions were imported.`,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: result.error,
          });
        }
        setIsImporting(false);
      };
      reader.onerror = error => {
        console.error('Error reading file:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to read the uploaded file.',
        });
        setIsImporting(false);
      };
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred during file processing.',
      });
      setIsImporting(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage your financial transactions.
          </p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  your transaction data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={isImporting}>
                {isImporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Transactions</DialogTitle>
                <DialogDescription>
                  Upload a document to automatically extract transactions.
                </DialogDescription>
              </DialogHeader>
              <div
                className={cn(
                  'mt-4 border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer transition-colors',
                  { 'bg-accent': isDragging }
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  id="document"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.csv"
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <FileUp className="w-8 h-8" />
                  <p>
                    {isDragging
                      ? 'Drop the file here'
                      : 'Drag & drop a file or click to select'}
                  </p>
                  <p className="text-xs">
                    Supports PDF, DOC, DOCX, TXT, and CSV files.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Budget Dialog Trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PiggyBank className="mr-2 h-4 w-4" /> View Budgets
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Your Budgets</DialogTitle>
                <DialogDescription>
                  Track and manage your monthly spending.
                </DialogDescription>
              </DialogHeader>
              
              {/* Budget Content */}
              <div className="space-y-8 py-4">
                 <div className="flex justify-end">
                    <Dialog open={addBudgetDialogOpen} onOpenChange={setAddBudgetDialogOpen}>
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
                    <Card className="flex items-center justify-center min-h-[200px] border-dashed shadow-none glassmorphic">
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
            </DialogContent>
          </Dialog>


          <Dialog
            open={addTransactionDialogOpen}
            onOpenChange={setAddTransactionDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Enter the details of your new transaction manually.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newTransaction.description}
                    onChange={e =>
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTransaction.date}
                    onChange={e =>
                      setNewTransaction({
                        ...newTransaction,
                        date: new Date(e.target.value)
                          .toLocaleDateString('en-GB')
                          .replace(/\//g, '/'),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value: 'income' | 'expense') =>
                      setNewTransaction({ ...newTransaction, type: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    value={newTransaction.amount}
                    onChange={e =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="INR 100.00"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button onClick={handleAddTransaction}>Add Transaction</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A list of your recent transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5">Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === 'income'
                            ? 'default'
                            : 'destructive'
                        }
                        className={
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.amount}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No transactions to display.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
