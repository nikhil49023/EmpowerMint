
'use client';

import {
  Home,
  Wallet,
  PiggyBank,
  BrainCircuit,
  Newspaper,
  LogOut,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/transactions', label: 'Transactions', icon: Wallet },
  { href: '/budgets', label: 'Budgets', icon: PiggyBank },
  { href: '/ai-advisor', label: 'AI Advisor', icon: BrainCircuit },
  { href: '/fin-bites', label: 'Fin Bites', icon: Newspaper },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r flex flex-col">
      <div className="p-6 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-primary"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
          <path d="M12 21.5a2.5 2.5 0 0 1-2.5-2.5V18" />
          <path d="M12 15a2.5 2.5 0 0 1 2.5 2.5V19" />
          <path d="m15.5 14.5-3-3-3 3" />
          <path d="M12.5 8a2.5 2.5 0 0 1-3 0" />
        </svg>
        <h1 className="text-xl font-bold">Uplift AI</h1>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map(item => (
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
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
        >
          <User className="mr-3 h-5 w-5" />
          My Profile
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be redirected to the login page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
