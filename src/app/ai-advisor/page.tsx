'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AIAdvisorPage() {
  return (
    <div className="flex flex-col h-full">
      <div>
        <h1 className="text-3xl font-bold">AI Financial Advisor</h1>
        <p className="text-muted-foreground">Ask me your financial questions.</p>
      </div>

      <div className="flex-1 flex flex-col gap-4 mt-8">
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col gap-4 p-6">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                <AvatarFallback>
                  <Sparkles className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3 max-w-md">
                <p className="text-sm">
                  Hello! I'm your AI Financial Advisor. Ask me anything about
                  personal finance, budgeting, or investing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="relative">
          <Input
            placeholder="Ask about saving for retirement..."
            className="pr-12 h-12"
          />
          <Button
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
