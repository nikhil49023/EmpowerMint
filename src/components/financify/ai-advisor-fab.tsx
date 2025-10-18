
'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { MessageSquare } from 'lucide-react';
import AIAdvisorChat from './ai-advisor-chat';

export default function AIAdvisorFab() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
          size="icon"
        >
          <MessageSquare className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>AI Financial Advisor</SheetTitle>
          <SheetDescription>
            Your personal guide to financial clarity. Ask me anything!
          </SheetDescription>
        </SheetHeader>
        <AIAdvisorChat />
      </SheetContent>
    </Sheet>
  );
}
