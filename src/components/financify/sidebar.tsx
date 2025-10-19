
'use client';

import {
  Home,
  Wallet,
  LogOut,
  User,
  BrainCircuit,
  Rocket,
  Globe,
  Star,
  FileText,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { saveFeedbackAction } from '@/app/actions';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, translations } = useLanguage();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

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
    router.push('/');
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        variant: 'destructive',
        title: 'Feedback cannot be empty',
      });
      return;
    }
    setIsSubmitting(true);
    const result = await saveFeedbackAction({
      message: feedback,
      userId: user?.uid,
      userName: user?.displayName,
      userEmail: user?.email,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Feedback Sent!',
        description: 'Thank you for your feedback.',
      });
      setFeedback('');
      setIsFeedbackDialogOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r flex flex-col">
      <div className="p-6 flex items-center gap-2">
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
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map(item => (
          <Button
            key={item.label}
            variant="ghost"
            asChild
            className={cn(
              'w-full justify-start text-muted-foreground hover:text-primary',
              pathname.startsWith(item.href) &&
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
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
          className="w-full justify-start text-muted-foreground"
        >
          <User className="mr-3 h-5 w-5" />
          {translations.sidebar.myProfile}
        </Button>
        <Dialog
          open={isFeedbackDialogOpen}
          onOpenChange={setIsFeedbackDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              {translations.sidebar.giveFeedback}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{translations.feedbackDialog.title}</DialogTitle>
              <DialogDescription>
                {translations.feedbackDialog.description}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="feedback-message">
                  {translations.feedbackDialog.yourFeedback}
                </Label>
                <Textarea
                  placeholder={translations.feedbackDialog.placeholder}
                  id="feedback-message"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {translations.feedbackDialog.cancel}
                </Button>
              </DialogClose>
              <Button
                onClick={handleFeedbackSubmit}
                disabled={isSubmitting || !feedback.trim()}
              >
                {isSubmitting
                  ? translations.feedbackDialog.submitting
                  : translations.feedbackDialog.submit}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
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
