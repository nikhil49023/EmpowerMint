import { RefreshCw, FileText, BarChart3, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FinBitesPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Fin Bites</h1>
          <p className="text-muted-foreground">
            Your daily dose of financial wisdom.
          </p>
        </div>
        <Button>
          <RefreshCw className="mr-2" /> New Bite
        </Button>
      </div>

      <Card className="border-dashed border-primary/50 text-center flex flex-col items-center justify-center p-8 min-h-[200px]">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive">An Error Occurred</h2>
        <p className="text-muted-foreground mt-2">
          Failed to generate a Fin Bite. Please try again.
        </p>
        <Button variant="destructive" className="mt-4">
          <RefreshCw className="mr-2" />
          Try Again
        </Button>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="m12.5 2.5-2.5 5 2.5 5-5-2.5-5 2.5 5-2.5-2.5-5 2.5 5 5-2.5Z" /><path d="m12.5 11.5-2.5 5 2.5 5-5-2.5-5 2.5 5-2.5-2.5-5 2.5 5 5-2.5Z" /></svg>
              Investment Ideas
            </h2>
            <Badge variant="outline">Beta</Badge>
          </div>
          <p className="text-muted-foreground mb-4">
            Explore potential business ideas. Here is a sample analysis for a
            small-scale business.
          </p>
          <div className="bg-accent rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="text-primary" />
                <h3 className="font-semibold text-primary">
                  Paper Plate Manufacturing Business
                </h3>
              </div>
              <p className="text-sm text-accent-foreground mt-1">
                A low-investment, high-demand business suitable for Tier-2 and
                Tier-3 cities in India.
              </p>
            </div>
            <Button>
              <FileText className="mr-2" />
              View Detailed Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            100 Investment Options in India
          </h2>
          <Badge variant="outline">Beta</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          A comprehensive list categorized by risk level.
        </p>
        <p className="text-muted-foreground text-xs">
          Disclaimer: This is for educational purposes only. Not financial
          advice.
        </p>

        <div className="flex gap-2 mt-4 mb-4">
          <Button variant="secondary" size="sm">All Risk</Button>
          <Button variant="secondary" size="sm">Low Risk</Button>
          <Button variant="secondary" size="sm">Moderate Risk</Button>
          <Button variant="secondary" size="sm">High Risk</Button>
        </div>

        <div className="bg-green-100 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle h-5 w-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            Low Risk Investments
          </h3>
        </div>
      </div>
    </div>
  );
}
