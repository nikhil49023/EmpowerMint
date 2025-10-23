
'use client';

import {
  Home,
  Wallet,
  LogOut,
  User,
  BrainCircuit,
  Rocket,
  Globe,
  MessageSquare,
  Lightbulb,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/use-language';
import { auth } from '@/lib/firebase';

type SidebarProps = {
  onLinkClick?: () => void;
};

export default function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, translations } = useLanguage();

  const navItems = [
    { href: '/dashboard', label: translations.sidebar.dashboard, icon: Home },
    {
      href: '/transactions',
      label: translations.sidebar.transactions,
      icon: Wallet,
    },
    {
      href: '/brainstorm',
      label: translations.sidebar.brainstorm,
      icon: BrainCircuit,
    },
    { href: '/launchpad', label: translations.sidebar.launchpad, icon: Rocket },
  ];

  const handleLogout = () => {
    auth.signOut();
    router.push('/');
  };

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 bg-card/80 backdrop-blur-lg border-r flex flex-col p-4 md:p-0">
      <div className="hidden md:flex p-6 items-center gap-2">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-primary"
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
        <h1 className="text-xl font-bold">FIn-Box</h1>
      </div>
      <nav className="flex-1 px-0 md:px-4 py-2 space-y-1">
        {navItems.map(item => (
          <Button
            key={item.label}
            variant="ghost"
            asChild
            className={cn(
              'w-full justify-start text-base font-normal text-muted-foreground hover:text-primary hover:bg-primary/10',
              pathname.startsWith(item.href) &&
                'font-semibold text-primary bg-primary/10'
            )}
            onClick={handleLinkClick}
          >
            <Link href={item.href}>
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="p-0 md:p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground font-normal hover:text-primary hover:bg-primary/10"
            >
              <Globe className="mr-3 h-5 w-5" />
              {language === 'en' ? 'English' : 'తెలుగు'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setLanguage('en')}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('te')}>
              తెలుగు
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground font-normal hover:text-primary hover:bg-primary/10"
        >
          <User className="mr-3 h-5 w-5" />
          {translations.sidebar.myProfile}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="mr-3 h-5 w-5" />
              {translations.sidebar.logout}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{translations.logoutDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {translations.logoutDialog.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{translations.logoutDialog.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                {translations.logoutDialog.confirm}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
