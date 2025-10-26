
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Sidebar from './sidebar';
import { useAuth } from '@/context/auth-provider';

export default function AppHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-lg px-4 print:hidden">
      <div className="flex items-center gap-2">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-primary"
        >
          <path
            d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 22V12M12 12L3 7L12 2L21 7L12 12Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M16.5 4.5L7.5 9.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <h1 className="text-lg font-bold">FIn-Box</h1>
          <p className="text-xs text-muted-foreground">Welcome, {user?.displayName || 'there'}!</p>
        </div>
      </div>
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0 w-64 md:w-72">
          <Sidebar onLinkClick={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
