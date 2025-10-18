
'use client';

import { useState } from 'react';
import {
  FileText,
  Newspaper,
  Send,
  Lightbulb,
  Building,
  Banknote,
  Rocket,
  Megaphone,
  ExternalLink,
  Leaf,
  Laptop,
  Recycle,
  Users,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

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

const startupSteps = [
  {
    icon: Lightbulb,
    title: '1. Idea & Validation',
    description: (
      <>
        Define and validate your idea. The{' '}
        <a
          href="https://www.startupindia.gov.in/content/sih/en/funding/schemes/seed-fund-scheme.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          Startup India Seed Fund Scheme
        </a>{' '}
        can provide early-stage funding to help you develop your concept into a
        proof of concept.
      </>
    ),
  },
  {
    icon: FileText,
    title: '2. Business Plan',
    description: (
      <>
        Create a solid plan. The government offers free tools and templates through
        the{' '}
        <a
          href="https://www.startupindia.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          Startup India Hub portal
        </a>{' '}
        to help you structure your business plan effectively.
      </>
    ),
  },
  {
    icon: Building,
    title: '3. Register Your Business',
    description: (
      <>
        Register as a Private Limited Company, LLP, or Partnership. Registering
        with{' '}
        <a
          href="https://www.startupindia.gov.in/content/sih/en/registration.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          Startup India (DPIIT)
        </a>{' '}
        gives you tax exemptions and other benefits.
      </>
    ),
  },
  {
    icon: Banknote,
    title: '4. Funding & Finance',
    description: (
      <>
        Secure capital through schemes like{' '}
        <a
          href="https://www.mudra.org.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          MUDRA loans
        </a>{' '}
        for small businesses, or{' '}
        <a
          href="https://www.cgtmse.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          CGTMSE
        </a>{' '}
        for collateral-free bank loans. Angel tax relief is also available for
        eligible startups.
      </>
    ),
  },
  {
    icon: Rocket,
    title: '5. Build & Launch',
    description: (
      <>
        Develop your MVP. The government provides access to incubation centers and
        grants under schemes like the{' '}
        <a
          href="https://aim.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          Atal Innovation Mission
        </a>{' '}
        to support your launch.
      </>
    ),
  },
  {
    icon: Megaphone,
    title: '6. Market & Grow',
    description: (
      <>
        Promote your business. Participate in government tenders with relaxed norms
        for startups and leverage the{' '}
        <a
          href="https://gem.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          GeM (Government e-Marketplace)
        </a>{' '}
        to reach a wider audience.
      </>
    ),
  },
];

const staticFinBite = {
  title: 'Startup India Seed Fund Scheme',
  summary:
    'This scheme provides financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization. It helps bridge the gap between idea and venture.',
  link: 'https://www.startupindia.gov.in/content/sih/en/funding/schemes/seed-fund-scheme.html',
};

export default function FinBitesPage() {
  const { toast } = useToast();
  const [userIdea, setUserIdea] = useState('');
  const router = useRouter();

  const handleAnalyzeIdea = () => {
    if (!userIdea.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter an idea to analyze.',
      });
      return;
    }
    router.push(`/investment-ideas/custom?idea=${encodeURIComponent(userIdea)}`);
  };

  const handleGenerateDRP = () => {
    if (!userIdea.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter an idea to generate a DRP.',
      });
      return;
    }
    router.push(`/generate-drp?idea=${encodeURIComponent(userIdea)}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Fin Bites</h1>
          <p className="text-muted-foreground">
            Your daily dose of financial wisdom.
          </p>
        </div>
        <Button asChild>
          <a href={staticFinBite.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2" />
            Learn More
          </a>
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="static-fin-bite"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glassmorphic overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                {staticFinBite.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{staticFinBite.summary}</p>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <Card className="glassmorphic">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
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
                <path d="M15.5 22.5a2.5 2.5 0 0 1-3 0" />
                <path d="M12.5 20a2.5 2.5 0 0 1-3 0" />
                <path d="m6.5 17.5-3-3 2.5-5 3.5 2.5-3 2.5" />
                <path d="m17.5 17.5 3-3-2.5-5-3.5 2.5 3 2.5" />
                <path d="M12.5 6.5a2.5 2.5 0 0 1-3 0" />
                <path d="m15.5 4-3-3-3 3" />
                <path d="m6.5 11.5-3-3 2.5-5 3.5 2.5-3 2.5" />
                <path d="m17.5 11.5 3-3-2.5-5-3.5 2.5 3 2.5" />
              </svg>
              Investment Ideas
            </h2>
            <Badge variant="outline">Beta</Badge>
          </div>
          <CardDescription>
            Explore our curated library of startup ideas or enter your own
            below to get AI-powered insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(investmentIdeaCategories).map(
              ([category, { icon: Icon, ideas }]) => (
                <Dialog key={category}>
                  <DialogTrigger asChild>
                    <Card className="group cursor-pointer hover:border-primary transition-colors flex flex-col justify-between text-center p-6 glassmorphic">
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <Icon className="h-10 w-10 text-primary mb-4" />
                        <CardTitle className="text-lg">{category}</CardTitle>
                      </div>
                      <Button variant="link" className="mt-4 text-primary">
                        <Eye className="mr-2" /> View More
                      </Button>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="glassmorphic">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3 text-xl">
                        <Icon className="h-6 w-6 text-primary" />
                        {category}
                      </DialogTitle>
                      <DialogDescription>
                        Here are some business ideas in the {category.toLowerCase()} sector.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                      {ideas.map(idea => (
                         <Link
                          key={idea}
                          href={`/investment-ideas/custom?idea=${encodeURIComponent(idea)}`}
                          passHref
                          className="block p-4 rounded-lg bg-background/50 hover:bg-accent hover:text-accent-foreground transition-colors"
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
            <h3 className="font-semibold">Analyze Your Own Business Idea</h3>
            <Textarea
              placeholder="Describe your business idea, e.g., 'A cloud kitchen for healthy salads in metropolitan cities...'"
              value={userIdea}
              onChange={e => setUserIdea(e.target.value)}
              rows={3}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAnalyzeIdea} disabled={!userIdea.trim()}>
                <Send className="mr-2" /> Get Insights
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateDRP}
                disabled={!userIdea.trim()}
              >
                <FileText className="mr-2" /> Generate DRP
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>Your Startup Journey</CardTitle>
          <CardDescription>
            A step-by-step guide to starting your business in India.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {startupSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="p-3 bg-accent rounded-full">
                <step.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </CardContent>
        <CardFooter>
          <p className="text-center w-full text-muted-foreground text-sm">
            All the best on your entrepreneurial journey! <br />
            Let's <strong className="text-primary">#BuildBharat</strong>{' '}
            together with Uplift.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

    