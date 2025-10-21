
'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
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
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  writeBatch,
  getDocs,
  doc,
} from 'firebase/firestore';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { useLanguage } from '@/hooks/use-language';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

export default function TransactionsPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [transactions, setTransactions] = useState<ExtractedTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { translations } = useLanguage();

  const [newTransaction, setNewTransaction] = useState({
    description: '',
    date: '',
    type: 'expense' as 'income' | 'expense',
    amount: '',
  });
  const [isImporting, setIsImporting] = useState(false);
  const [isImportOnCooldown, setIsImportOnCooldown] = useState(false);
  const [daysUntilNextImport, setDaysUntilNextImport] = useState(0);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addTransactionDialogOpen, setAddTransactionDialogOpen] =
    useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [addBudgetDialogOpen, setAddBudgetDialogOpen] = useState(false);
  const [cooldownAlertOpen, setCooldownAlertOpen] = useState(false);

  const getImportCooldownKey = useCallback(() => {
    return user ? `import-cooldown-${user.uid}` : null;
  }, [user]);

  useEffect(() => {
    const cooldownKey = getImportCooldownKey();
    if (cooldownKey) {
      const lastImportTimestamp = localStorage.getItem(cooldownKey);
      if (lastImportTimestamp) {
        const lastImportDate = new Date(parseInt(lastImportTimestamp, 10));
        const now = new Date();
        const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
        const timeSinceLastImport = now.getTime() - lastImportDate.getTime();

        if (timeSinceLastImport < thirtyDaysInMillis) {
          setIsImportOnCooldown(true);
          const daysRemaining = Math.ceil((thirtyDaysInMillis - timeSinceLastImport) / (1000 * 60 * 60 * 24));
          setDaysUntilNextImport(daysRemaining);
        } else {
          setIsImportOnCooldown(false);
          localStorage.removeItem(cooldownKey);
        }
      }
    }
  }, [getImportCooldownKey]);

  const handleImportClick = () => {
    if (isImportOnCooldown) {
        setCooldownAlertOpen(true);
    } else {
        setImportDialogOpen(true);
    }
  };

  const invalidateDashboardCache = useCallback(() => {
    if (user) {
      const cacheKey = `dashboard-summary-${user.uid}`;
      localStorage.removeItem(cacheKey);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoadingData(true);
      const transCollectionRef = collection(db, 'users', user.uid, 'transactions');
      const transQuery = query(transCollectionRef);
      const unsubTransactions = onSnapshot(
        transQuery,
        (snapshot) => {
          const transData = snapshot.docs.map(doc => ({
            ...(doc.data() as ExtractedTransaction),
          }));
          setTransactions(transData);
          setLoadingData(false); 
        },
        (error) => {
          console.error("Error fetching transactions: ", error);
          const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/transactions`,
            operation: 'list',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
          setLoadingData(false);
        }
      );

      const budgetCollectionRef = collection(db, 'users', user.uid, 'budgets');
      const budgetQuery = query(budgetCollectionRef);
      const unsubBudgets = onSnapshot(
        budgetQuery,
        (snapshot) => {
          const budgetsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Budget, 'id' | 'spent' | 'icon'>),
            spent: 0,
            icon: categoryIcons[doc.data().name] || categoryIcons.Default,
          }));
          setBudgets(budgetsData);
        },
        (error) => {
          console.error("Error fetching budgets: ", error);
           const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/budgets`,
            operation: 'list',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        }
      );
      
      return () => {
        try {
          unsubTransactions();
          unsubBudgets();
        } catch (error) {
          console.error('Error unsubscribing from Firestore:', error);
        }
      };
    } else if (!loadingAuth) {
      setLoadingData(false);
      setTransactions([]);
      setBudgets([]);
    }
  }, [user, loadingAuth]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const handleClearData = async () => {
    if (!user) return;
    const transQuery = query(
      collection(db, 'users', user.uid, 'transactions')
    );
    const budgetQuery = query(collection(db, 'users', user.uid, 'budgets'));

    const batch = writeBatch(db);
    
    try {
        const transSnapshot = await getDocs(transQuery);
        transSnapshot.forEach(doc => batch.delete(doc.ref));

        const budgetSnapshot = await getDocs(budgetQuery);
        budgetSnapshot.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
        invalidateDashboardCache();

        toast({
        title: 'Success',
        description: translations.transactions.toasts.successClearData,
        });
    } catch(e: any) {
        const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/transactions`,
            operation: 'delete'
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleAddTransaction = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: translations.transactions.toasts.errorLoginToAdd,
      });
      return;
    }
    if (
      !newTransaction.description ||
      !newTransaction.date ||
      !newTransaction.amount
    ) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: translations.transactions.toasts.errorFillFields,
      });
      return;
    }

    const transactionsCollectionRef = collection(
      db,
      'users',
      user.uid,
      'transactions'
    );
    addDoc(transactionsCollectionRef, newTransaction)
      .catch(async serverError => {
        const permissionError = new FirestorePermissionError({
          path: transactionsCollectionRef.path,
          operation: 'create',
          requestResourceData: newTransaction,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .then(() => {
        setNewTransaction({
          description: '',
          date: '',
          type: 'expense',
          amount: '',
        });
        setAddTransactionDialogOpen(false);
        invalidateDashboardCache();
        toast({
          title: 'Success',
          description: translations.transactions.toasts.successAddTransaction,
        });
      });
  };

  const processFile = async (file: File) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: translations.transactions.toasts.errorLoginToImport,
      });
      return;
    }
    setIsImporting(true);
    setImportDialogOpen(false);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const documentDataUri = reader.result as string;
        const result = await extractTransactionsAction({ documentDataUri });

        if (result.success) {
          const batch = writeBatch(db);
          const transactionsCol = collection(
            db,
            'users',
            user.uid,
            'transactions'
          );
          result.data.transactions.forEach(transaction => {
            const docRef = doc(transactionsCol); // Automatically generate unique ID
            batch.set(docRef, transaction);
          });

          batch
            .commit()
            .catch(async serverError => {
              const permissionError = new FirestorePermissionError({
                path: transactionsCol.path,
                operation: 'create',
                requestResourceData: result.data.transactions, // This is an array, but should give enough context
              } satisfies SecurityRuleContext);
              errorEmitter.emit('permission-error', permissionError);
            })
            .then(() => {
              invalidateDashboardCache();
              const cooldownKey = getImportCooldownKey();
              if (cooldownKey) {
                localStorage.setItem(cooldownKey, Date.now().toString());
                setIsImportOnCooldown(true);
                setDaysUntilNextImport(30);
              }
              toast({
                title: 'Import Successful',
                description: `${result.data.transactions.length} ${translations.transactions.toasts.importSuccess}`,
              });
            });
        } else {
          toast({
            variant: 'destructive',
            title: translations.transactions.toasts.importFailed,
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
          description: translations.transactions.toasts.errorReadingFile,
        });
        setIsImporting(false);
      };
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: translations.transactions.toasts.errorProcessingFile,
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

  const showLoginPrompt = !user && !loadingAuth;

  if (loadingAuth || loadingData) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{translations.transactions.title}</h1>
          <p className="text-muted-foreground">
            {translations.transactions.description}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={showLoginPrompt} className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" /> {translations.transactions.clearAllData}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{translations.transactions.clearDataDialog.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {translations.transactions.clearDataDialog.description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{translations.transactions.clearDataDialog.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>
                  {translations.transactions.clearDataDialog.continue}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button
            variant="outline"
            onClick={handleImportClick}
            disabled={isImporting || showLoginPrompt}
            className="w-full sm:w-auto"
          >
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {translations.transactions.import}
          </Button>

          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{translations.transactions.importDialog.title}</DialogTitle>
                <DialogDescription>
                  {translations.transactions.importDialog.description}
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
                      ? translations.transactions.importDialog.dropHere
                      : translations.transactions.importDialog.dragDrop}
                  </p>
                  <p className="text-xs">
                    {translations.transactions.importDialog.fileTypes}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <AlertDialog open={cooldownAlertOpen} onOpenChange={setCooldownAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Import Limit Reached</AlertDialogTitle>
                    <AlertDialogDescription>
                        You can import transactions once every 30 days. Your next import is available in {daysUntilNextImport} day(s).
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setCooldownAlertOpen(false)}>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>


          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={showLoginPrompt} className="w-full sm:w-auto">
                <PiggyBank className="mr-2 h-4 w-4" /> {translations.transactions.viewBudgets}
              </Button>
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

          <Dialog
            open={addTransactionDialogOpen}
            onOpenChange={setAddTransactionDialogOpen}
          >
            <DialogTrigger asChild>
              <Button disabled={showLoginPrompt} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> {translations.transactions.addTransaction}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{translations.transactions.addTransactionDialog.title}</DialogTitle>
                <DialogDescription>
                  {translations.transactions.addTransactionDialog.description}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    {translations.transactions.addTransactionDialog.descriptionLabel}
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
                    {translations.transactions.addTransactionDialog.dateLabel}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    onChange={e => {
                      if (e.target.value) {
                        const date = new Date(e.target.value);
                        if (!isNaN(date.getTime())) {
                          setNewTransaction({
                            ...newTransaction,
                            date: date.toLocaleDateString('en-GB'),
                          });
                        } else {
                           setNewTransaction({
                            ...newTransaction,
                            date: '',
                          });
                        }
                      }
                    }}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    {translations.transactions.addTransactionDialog.typeLabel}
                  </Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value: 'income' | 'expense') =>
                      setNewTransaction({ ...newTransaction, type: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={translations.transactions.addTransactionDialog.typePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">{translations.transactions.addTransactionDialog.expense}</SelectItem>
                      <SelectItem value="income">{translations.transactions.addTransactionDialog.income}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    {translations.transactions.addTransactionDialog.amountLabel}
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
                    placeholder={translations.transactions.addTransactionDialog.amountPlaceholder}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    {translations.transactions.addTransactionDialog.cancel}
                  </Button>
                </DialogClose>
                <Button onClick={handleAddTransaction}>{translations.transactions.addTransactionDialog.addTransaction}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>{translations.transactions.history.title}</CardTitle>
          <CardDescription>{translations.transactions.history.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5">{translations.transactions.history.tableDescription}</TableHead>
                <TableHead className="hidden sm:table-cell">{translations.transactions.history.tableDate}</TableHead>
                <TableHead>{translations.transactions.history.tableType}</TableHead>
                <TableHead className="text-right">{translations.transactions.history.tableAmount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showLoginPrompt ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {translations.transactions.history.loginPrompt}
                  </TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {transaction.description}
                      <div className="text-muted-foreground text-xs sm:hidden">{transaction.date}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{transaction.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === 'income'
                            ? 'default'
                            : 'destructive'
                        }
                        className={cn(
                          'capitalize',
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        )}
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
                    {translations.transactions.history.noTransactions}
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
