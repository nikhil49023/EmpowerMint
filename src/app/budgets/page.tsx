import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PiggyBank, PlusCircle } from 'lucide-react';

export default function BudgetsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">
            Track and manage your monthly spending.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Budget
        </Button>
      </div>

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
    </div>
  );
}
