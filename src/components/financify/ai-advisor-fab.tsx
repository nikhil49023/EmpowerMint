
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
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/context/auth-provider';

export default function AIAdvisorFab() {
  const { translations } = useLanguage();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-20 md:bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
          size="icon"
        >
          <MessageSquare className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>{translations.aiAdvisor.title}</SheetTitle>
          <SheetDescription>
            {translations.aiAdvisor.description}
          </SheetDescription>
        </SheetHeader>
        <AIAdvisorChat />
      </SheetContent>
    </Sheet>
  );
}
