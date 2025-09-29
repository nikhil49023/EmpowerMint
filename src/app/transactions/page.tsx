'use client';

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
import { PlusCircle, Trash2, Upload } from 'lucide-react';

const transactions = [
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
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
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
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
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
                  <TableCell className="text-right">{transaction.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
