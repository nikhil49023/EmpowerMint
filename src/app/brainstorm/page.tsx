
'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Send,
  Lightbulb,
  Leaf,
  Laptop,
  Recycle,
  Users,
  Eye,
  Loader2,
  Users2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/context/auth-provider';
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const db = getFirestore(app);

const investmentIdeaCategories = {
  'AgriTech & Food Processing': {
    icon: Leaf,
    ideas: [
      'Mobile Soil & Water Testing Lab',
      'Millet-Based Snack Production Unit',
      'Ghost Kitchen for Regional Cuisine',
      'Vermicomposting Organic Fertilizer Production',
    ],
  },
  'Tech & Digital Services': {
    icon: Laptop,
    ideas: [
      'Digital Marketing Agency for Local Businesses',
      'Hyperlocal Errand & Delivery Service',
      'Online Handicrafts Marketplace',
    ],
  },
  'Eco-Friendly & Sustainable': {
    icon: Recycle,
    ideas: [
      'Upcycled Fashion & Home Decor',
      'EV Charging Station (in partnership with a local business)',
      'Rental Service for Reusable Event Supplies',
    ],
  },
  'Local & Community Services': {
    icon: Users,
    ideas: [
      'Co-working Space in a Tier-2 City',
      'Subscription-Based Toy & Book Library',
      'Senior Citizen Care Services (Non-Medical)',
      'Customized Gifting & Curation Service',
      'Local Experience & Tourism Curation',
    ],
  },
};

type Usage = {
  month: string;
  count: number;
};

type CommunityIdea = {
  id: string;
  title: string;
  summary: string;
  contributedBy: string;
};

export default function BrainstormPage() {
  const { toast } = useToast();
  const [userIdea, setUserIdea] = useState('');
  const router = useRouter();
  const { translations } = useLanguage();
  const { user } = useAuth();
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  const [communityIdeas, setCommunityIdeas] = useState<CommunityIdea[]>([]);
  const [isLoadingCommunityIdeas, setIsLoadingCommunityIdeas] = useState(true);

  useEffect(() => {
    setIsLoadingCommunityIdeas(true);
    const ideasRef = collection(db, 'communityIdeas');
    const q = query(ideasRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedIdeas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CommunityIdea[];
        setCommunityIdeas(fetchedIdeas);
        setIsLoadingCommunityIdeas(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAnalyzeIdea = () => {
    if (!userIdea.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: translations.brainstorm.errorEnterIdea,
      });
      return;
    }

    if (!user) {
      toast({ variant: 'destructive', description: 'Please log in to analyze an idea.'});
      router.push('/');
      return;
    }

    const usageKey = `insights-usage-${user.uid}`;
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${today.getMonth()}`;
    
    let usage: Usage = { month: currentMonth, count: 0 };
    try {
      const storedUsage = localStorage.getItem(usageKey);
      if (storedUsage) {
        const parsedUsage: Usage = JSON.parse(storedUsage);
        if (parsedUsage.month === currentMonth) {
          usage = parsedUsage;
        }
      }
    } catch (e) {
      console.error("Could not parse usage data from localStorage", e);
    }
    
    if (usage.count >= 3) {
      setShowLimitAlert(true);
      return;
    }

    // Increment and save usage
    usage.count++;
    localStorage.setItem(usageKey, JSON.stringify(usage));

    router.push(`/investment-ideas/custom?idea=${encodeURIComponent(userIdea)}`);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{translations.brainstorm.title}</h1>
          <p className="text-muted-foreground">
            {translations.brainstorm.description}
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/my-ideas">
            <Lightbulb className="mr-2" />
            {translations.brainstorm.mySavedIdeas}
          </Link>
        </Button>
      </div>

       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
                <Users2 />
                Community Ideas
            </CardTitle>
            <CardDescription>
                Explore business ideas contributed by the FIn-Box community.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingCommunityIdeas ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-5 w-3/4" />
                            </CardHeader>
                             <CardContent>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3 mt-2" />
                            </CardContent>
                            <CardFooter>
                                 <Skeleton className="h-4 w-1/2" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : communityIdeas.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {communityIdeas.map(idea => (
                         <Link
                            key={idea.id}
                            href={`/investment-ideas/custom?idea=${encodeURIComponent(idea.title)}`}
                            passHref
                            className="block"
                        >
                            <Card className="h-full flex flex-col hover:border-primary transition-colors cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="text-base">{idea.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                     <p className="text-sm text-muted-foreground line-clamp-3">{idea.summary}</p>
                                </CardContent>
                                <CardFooter>
                                    <p className="text-xs text-muted-foreground">Contributed by: <span className="font-semibold">{idea.contributedBy}</span></p>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-center py-4">No community ideas have been contributed yet. Be the first!</p>
            )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
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
                className="h-6 w-6 md:h-7 md:w-7 text-primary"
              >
                <path d="M15.5 22.5a2.5 2.5 0 0 1-3 0" />
                <path d="M12.5 20a2.5 2.5 0 0 1-3 0" />
                <path d="m6.5 17.5-3-3 2.5-5 3.5 2.5-3 2.5" />
                <path d="m17.5 17.5 3-3-2.5-5-3.5 2.5 3 2.5" />
                <path d="M12.5 6.5a2.5 2.5 0_0 1-3 0" />
                <path d="m15.5 4-3-3-3 3" />
                <path d="m6.5 11.5-3-3 2.5-5 3.5 2.5-3 2.5" />
                <path d="m17.5 11.5 3-3-2.5-5-3.5 2.5 3 2.5" />
              </svg>
              {translations.brainstorm.ideasTitle}
            </h2>
            <Badge variant="outline">Beta</Badge>
          </div>
          <CardDescription>
            {translations.brainstorm.ideasDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(investmentIdeaCategories).map(
              ([category, { icon: Icon, ideas }]) => (
                <Dialog key={category}>
                  <DialogTrigger asChild>
                    <Card className="group cursor-pointer hover:border-primary transition-colors flex flex-col justify-between text-center p-4 md:p-6">
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <Icon className="h-10 w-10 md:h-12 md:w-12 text-primary mb-4" />
                        <CardTitle className="text-base sm:text-lg">{category}</CardTitle>
                      </div>
                      <Button variant="link" className="mt-4 text-primary">
                        <Eye className="mr-2" /> {translations.brainstorm.viewMore}
                      </Button>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3 text-xl">
                        <Icon className="h-6 w-6 text-primary" />
                        {category}
                      </DialogTitle>
                      <DialogDescription>
                        {translations.brainstorm.ideaCategoryDialog.description.replace('{category}', category.toLowerCase())}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                      {ideas.map(idea => (
                         <Link
                          key={idea}
                          href={`/investment-ideas/custom?idea=${encodeURIComponent(idea)}`}
                          passHref
                          className="block p-4 rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 mt-1 flex-shrink-0 text-primary" />
                            <span className="flex-1 font-medium">{idea}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )
            )}
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">{translations.brainstorm.analyzeOwnIdea}</h3>
            <Textarea
              placeholder={translations.brainstorm.ideaPlaceholder}
              value={userIdea}
              onChange={e => setUserIdea(e.target.value)}
              rows={3}
              className="text-base"
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAnalyzeIdea} disabled={!userIdea.trim()} size="lg">
                <Send className="mr-2" /> {translations.brainstorm.getInsights}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showLimitAlert} onOpenChange={setShowLimitAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Monthly Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              You have used your quota of 3 free insights for this month. Please try again next month.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowLimitAlert(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    