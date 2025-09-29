
'use client';

import {
  TrendingUp,
  PiggyBank,
  Settings,
  TrendingDown,
  Lightbulb,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React, { useEffect, useState } from 'react';
import { generateFinBiteAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good Morning, there!');
    } else if (hours < 18) {
      setGreeting('Good Afternoon, there!');
    } else {
      setGreeting('Good Evening, there!');
    }

    async function fetchSuggestion() {
      setIsLoading(true);
      const result = await generateFinBiteAction();
      if (result.success) {
        setSuggestion(result.data.tip);
      } else {
        setSuggestion(result.error);
      }
      setIsLoading(false);
    }
    fetchSuggestion();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">{greeting}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          orientation="vertical"
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          className="w-full h-full"
        >
          <CarouselContent className="-mt-0 h-full">
            <CarouselItem className="pt-0 pb-4 h-full">
              <Card className="glassmorphic h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Your Expenses
                  </CardTitle>
                  <div className="p-2 bg-red-100 rounded-md">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">INR 2589.00</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </CarouselItem>
            <CarouselItem className="pt-0 pb-4 h-full">
              <Card className="glassmorphic h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Your Income
                  </CardTitle>
                  <div className="p-2 bg-green-100 rounded-md">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">INR 3600.00</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        <Card className="glassmorphic">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <PiggyBank className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">28%</div>
            <p className="text-xs text-muted-foreground">
              Of your income this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Personalized Suggestions</h2>
          <Settings className="w-5 h-5 text-muted-foreground cursor-pointer" />
        </div>
        <Card className="glassmorphic">
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <Alert className="border-0 p-0 bg-transparent">
                <div className="flex items-start gap-3">
                  <span className="p-2 bg-accent rounded-full">
                    <Lightbulb className="w-4 h-4 text-accent-foreground" />
                  </span>
                  <div className="flex-1">
                    <AlertDescription>{suggestion}</AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
