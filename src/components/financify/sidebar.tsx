
'use client';

import {
  ArrowLeftRight,
  BarChart3,
  BookMarked,
  LayoutDashboard,
  Sparkles,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budgets', icon: BookMarked },
  { href: '/ai-advisor', label: 'AI Advisor', icon: Sparkles },
  { href: '/fin-bites', label: 'Fin Bites', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r flex flex-col">
      <div className="p-6 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-primary"
        >
          <path d="m12.5 2.5-2.5 5 2.5 5-5-2.5-5 2.5 5-2.5-2.5-5 2.5 5 5-2.5Z" />
          <path d="m12.5 11.5-2.5 5 2.5 5-5-2.5-5 2.5 5-2.5-2.5-5 2.5 5 5-2.5Z" />
        </svg>
        <h1 className="text-xl font-bold">Uplift AI</h1>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            asChild
            className={cn(
              'w-full justify-start text-muted-foreground hover:text-primary',
              pathname === item.href &&
                'bg-accent text-accent-foreground hover:bg-accent/80 hover:text-accent-foreground'
            )}
          >
            <Link href={item.href}>
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground">
          <User className="mr-3 h-5 w-5" />
          My Profile
        </Button>
      </div>
    </aside>
  );
}
