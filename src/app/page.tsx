'use client';

import { TrendingUp, PiggyBank, Settings, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React from 'react';

export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Good Evening, there!</p>
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
          className="w-full"
        >
          <CarouselContent className="-mt-0 h-[124px]">
            <CarouselItem className="pt-0 basis-full">
              <Card>
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
            <CarouselItem className="pt-0 basis-full">
              <Card>
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

        <Card>
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
        <Card>
          <CardContent className="pt-6">
            <Alert
              variant="destructive"
              className="bg-red-50 border-red-200"
            >
              <AlertDescription className="text-red-700">
                Failed to get financial advice.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
