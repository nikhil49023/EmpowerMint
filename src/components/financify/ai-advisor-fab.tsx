
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
import { MessageSquare, Speaker } from 'lucide-react';
import AIAdvisorChat from './ai-advisor-chat';
import { useLanguage } from '@/hooks/use-language';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AIAdvisorFab() {
  const { translations } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
          size="icon"
        >
          {isPlaying ? (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                transition: { duration: 1, repeat: Infinity },
              }}
            >
              <Speaker className="h-8 w-8" />
            </motion.div>
          ) : (
            <MessageSquare className="h-8 w-8" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>{translations.aiAdvisor.title}</SheetTitle>
          <SheetDescription>
            {translations.aiAdvisor.description}
          </SheetDescription>
        </SheetHeader>
        <AIAdvisorChat onIsPlayingChange={setIsPlaying} />
      </SheetContent>
    </Sheet>
  );
}
