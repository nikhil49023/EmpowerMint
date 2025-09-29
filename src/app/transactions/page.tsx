'use client';

import { useState, useRef } from 'react';
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
import { PlusCircle, Trash2, Upload, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { extractTransactionsAction } from '../actions';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';

const initialTransactions: ExtractedTransaction[] = [
  {
    description: 'Paid to CONFIRM TICKET ONLINE SOLUTION',
    date: '07/08/2025',
    type: 'expense',
    amount: 'INR 1186.00',
  },
  {
    description: 'Paid to Haier India Online',
    date: '07/09/2025',
    type: 'expense',
    amount: 'INR 30.00',
  },
  {
    description: 'Payment to Linkedin',
    date: '19/09/2025',
    type: 'expense',
    amount: 'INR 2.00',
  },
  {
    description: 'Paid to Blinkit',
    date: '19/09/2025',
    type: 'expense',
    amount: 'INR 113.00',
  },
  {
    description: 'Received from Mithun.G',
    date: '17/09/2025',
    type: 'income',
    amount: 'INR 100.00',
  },
  {
    description: 'Paid to KANHAIYA JUICE POINT',
    date: '16/09/2025',
    type: 'expense',
    amount: 'INR 30.00',
  },
  {
    description: 'Paid to MANOJ KUMAR',
    date: '15/09/2025',
    type: 'expense',
    amount: 'INR 55.00',
  },
  {
    description: 'Paid to CONFIRM TICKET ONLINE SOLUTION',
    date: '15/09/2025',
    type: 'expense',
    amount: 'INR 1031.00',
  },
  {
    description: 'Paid to airtel',
    date: '14/09/2025',
    type: 'expense',
    amount: 'INR 49.00',
  },
  {
    description: 'Paid to Haier India Online',
    date: '14/09/2025',
    type: 'expense',
    amount: 'INR 30.00',
  },
  {
    description: 'Paid to Airtel Payments Bank Limited',
    date: '12/09/2025',
    type: 'expense',
    amount: 'INR 33.00',
  },
  {
    description: 'Received from Raja Sekhar',
    date: '11/09/2025',
    type: 'income',
    amount: 'INR 3500.00',
  },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] =
    useState<ExtractedTransaction[]>(initialTransactions);
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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
                  Upload a document (e.g., bank statement PDF) to automatically
                  extract and import your transactions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid w-full max-w-sm items-center gap-1.5 py-4">
                <Label htmlFor="document">Document</Label>
                <Input
                  id="document"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.csv"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setImportDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
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

      <Card>
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
                        variant="outline"
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
