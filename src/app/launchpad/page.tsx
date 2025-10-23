
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileText,
  Building,
  Banknote,
  Rocket,
  Megaphone,
  Lightbulb,
  Sparkles,
  Globe,
  LogIn,
  X,
  Briefcase,
  MessagesSquare,
  Loader2,
  Bell,
  Info,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import Autoplay from 'embla-carousel-autoplay';
import React, { useState, useEffect, useCallback } from 'react';
import { generateFinBiteAction } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';


const PortalCard = ({
  title,
  description,
  url,
  loginText,
}: {
  title: string;
  description: string;
  url: string;
  loginText: string;
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <Card className="h-full flex flex-col hover:border-primary transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center gap-4">
          <svg
            className="w-12 h-12 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinejoin="round"
            ></path>
            <path
              d="M3.5 7.5L12 12.5L20.5 7.5"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinejoin="round"
            ></path>
            <path
              d="M12 21.5V12.5"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinejoin="round"
            ></path>
          </svg>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
        <CardContent>
          <Button>
            <LogIn className="mr-2 h-4 w-4" /> {loginText}
          </Button>
        </CardContent>
      </Card>
    </DialogTrigger>
    <DialogContent className="max-w-[90vw] md:max-w-4xl lg:max-w-6xl h-[90vh] flex flex-col p-0">
      <DialogHeader className="p-4 border-b flex-row flex justify-between items-center">
        <DialogTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          {title}
        </DialogTitle>
        <DialogClose asChild>
          <Button variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>
      </DialogHeader>
      <div className="flex-1 overflow-hidden">
        <iframe src={url} className="w-full h-full border-0" title={title} />
      </div>
    </DialogContent>
  </Dialog>
);

type FinBite = {
  title: string;
  summary: string;
};


export default function LaunchpadPage() {
  const { translations } = useLanguage();
  const [finBite, setFinBite] = useState<FinBite | null>(null);
  const [isLoadingFinBite, setIsLoadingFinBite] = useState(false);
  const [finBiteError, setFinBiteError] = useState<string | null>(null);

  const fetchFinBite = useCallback(async () => {
    setIsLoadingFinBite(true);
    setFinBiteError(null);
    const result = await generateFinBiteAction();
    if (result.success) {
      setFinBite(result.data);
    } else {
      setFinBiteError(result.error);
    }
    setIsLoadingFinBite(false);
  }, []);

  const startupSteps = [
    {
      icon: Lightbulb,
      title: translations.launchpad.startupJourney.step1.title,
      description: (
        <>
          {translations.launchpad.startupJourney.step1.description} Use the{' '}
          <Link href="/brainstorm" className="text-primary underline">
            Brainstorm
          </Link>{' '}
          feature to get started.
        </>
      ),
    },
    {
      icon: FileText,
      title: translations.launchpad.startupJourney.step2.title,
      description: translations.launchpad.startupJourney.step2.description,
    },
    {
      icon: Building,
      title: translations.launchpad.startupJourney.step3.title,
      description: (
        <>
          Choose a business structure (Sole Proprietorship, LLP, Pvt. Ltd.) and
          complete the legal registration process. Check for state-specific
          portals like{' '}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="link"
                className="p-0 h-auto text-primary underline"
              >
                APMSME ONE
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] md:max-w-4xl lg:max-w-6xl h-[90vh] flex flex-col p-0">
              <DialogHeader className="p-4 border-b flex-row flex justify-between items-center">
                <DialogTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {translations.launchpad.statePortals.apmsmeone.title}
                </DialogTitle>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                <iframe
                  src="https://apmsmeone.ap.gov.in/MSMEONE/LoginPages/HomeLogin.aspx"
                  className="w-full h-full border-0"
                  title={translations.launchpad.statePortals.apmsmeone.title}
                />
              </div>
            </DialogContent>
          </Dialog>
          .
        </>
      ),
    },
    {
      icon: Banknote,
      title: translations.launchpad.startupJourney.step4.title,
      description: translations.launchpad.startupJourney.step4.description,
    },
    {
      icon: Rocket,
      title: translations.launchpad.startupJourney.step5.title,
      description: translations.launchpad.startupJourney.step5.description,
    },
    {
      icon: Megaphone,
      title: translations.launchpad.startupJourney.step6.title,
      description: translations.launchpad.startupJourney.step6.description,
    },
  ];

  const msmeClusters = [
    {
      name: 'Readymade Garments Cluster',
      location: 'Rayadurg (Anantapur)',
      sector: 'Textile/Apparel',
      description:
        'Specializing in ready-to-wear clothes, supporting jobs and exports.',
    },
    {
      name: 'Powerloom Cluster',
      location: 'Nagari (Chittoor)',
      sector: 'Textile',
      description:
        'Center for powerloom-based weaving units, producing fabric for various markets.',
    },
    {
      name: 'Brass Utensils Cluster',
      location: 'Srikalahasti (Chittoor)',
      sector: 'Metal Utensils',
      description:
        'Artisanal brass utensil production hub for kitchenware and religious items.',
    },
    {
      name: 'Rice Mills Cluster',
      location: 'East Godavari',
      sector: 'Agro/Food Processing',
      description:
        'Major contributor to state’s rice export and domestic supply.',
    },
    {
      name: 'Graphite Crucibles Cluster',
      location: 'Rajahmundry (East Godavari)',
      sector: 'Refractory/Metals',
      description: 'Crucibles for metallurgical and foundry industries.',
    },
    {
      name: 'Coir & Coir Products Cluster',
      location: 'Anakapalli, East Godavari',
      sector: 'Agro/Handicraft',
      description:
        'Makers of mats, ropes, and eco-products, supporting coconut farmers.',
    },
    {
      name: 'Aluminium Utensils Cluster',
      location: 'Rajahmundry (East Godavari)',
      sector: 'Metal Utensils',
      description: 'Focused on aluminium cookware and utility products.',
    },
    {
      name: 'Refractory Products Cluster',
      location: 'East & West Godavari',
      sector: 'Industrial Materials',
      description: 'Advanced materials for factories and heavy industry.',
    },
    {
      name: 'Lime Calcination Cluster',
      location: 'Guntur',
      sector: 'Minerals',
      description: 'Lime producers for construction, chemicals, and agriculture.',
    },
    {
      name: 'Powerloom Cluster',
      location: 'Guntur',
      sector: 'Textile',
      description: 'Textile cluster weaving fabrics for various sectors.',
    },
    {
      name: 'Plastic Products Cluster',
      location: 'Adilabad, Nalgonda',
      sector: 'Plastics',
      description: 'Supplying industrial and consumer plastic goods.',
    },
    {
      name: 'Burnt Lime Industry Cluster',
      location: 'Piduguralla (Guntur)',
      sector: 'Industrial Minerals',
      description: 'Specializes in burnt lime production for industrial uses.',
    },
    {
      name: 'Crochet Lace Industry Cluster',
      location: 'Narsapur (West Godavari)',
      sector: 'Handicraft/Textile',
      description:
        'Famous for handmade crochet lace, supporting rural artisans.',
    },
    {
      name: 'Imitation Jewellery Cluster',
      location: 'Machilipatnam (Krishna)',
      sector: 'Gems & Jewellery',
      description: 'Design and manufacturing of imitation jewellery.',
    },
    {
      name: 'Food Processing Cluster',
      location: 'Vijayawada (Krishna)',
      sector: 'Food Processing',
      description:
        'Units handling value-added food products, packaging, and export.',
    },
  ];

  const govtSchemes = [
    {
      icon: Briefcase,
      title: 'AP MSME & Entrepreneur Development Policy 4.0 (2024–29)',
      description:
        'Capital subsidy, tax reimbursement, land rebates for MSMEs, priority for women/SC/ST/backward region entrepreneurs, “One Family, One Entrepreneur” vision, plug-and-play industrial parks.',
      url: 'https://www.apindustries.gov.in/apindus/Data/policies/AP%20MSME%20&%20EDP%20(4.0)%20-%202024-29.pdf',
    },
    {
      icon: Briefcase,
      title: 'MSE-CDP (Cluster Development Programme)',
      description:
        'Support for MSME clusters with grants for common facilities, technology upgrade, shared infrastructure.',
      url: 'https://cluster.dcmsme.gov.in',
    },
    {
      icon: Briefcase,
      title: 'CGTMSE (Credit Guarantee Fund Trust for Micro and Small Enterprises)',
      description:
        'Collateral-free business loans for micro and small enterprises, increased formal credit flow, guarantees up to ₹5 crore.',
      url: 'https://www.cgtmse.in/',
    },
    {
      icon: Briefcase,
      title: 'RAMP (Raising and Accelerating MSME Performance)',
      description:
        'Capacity building, export and market access, MSME formalization, digital tools, state grants for Strategic Investment Plan (SIP) implementation.',
      url: 'https://apmsmeone.ap.gov.in/MSMEONE/RAMP/AboutRamp.aspx?ID=ABOUT',
    },
    {
      icon: Briefcase,
      title: 'ZED Certification Scheme (Zero Defect Zero Effect)',
      description:
        'Enhances quality and sustainability for MSME manufacturing enterprises, subsidy for Bronze/Silver/Gold certification levels.',
      url: 'https://zed.msme.gov.in/certification-process',
    },
    {
      icon: Briefcase,
      title: 'PMEGP (Prime Minister’s Employment Generation Programme)',
      description:
        'Subsidy-linked loans for new micro enterprises, self-employment generation.',
      url: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
    },
  ];

  const clustersPlugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  const schemesPlugin = React.useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex justify-between items-center">
        <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Rocket className="h-8 w-8" />
                {translations.launchpad.title}
            </h1>
            <p className="text-muted-foreground mt-1">
                {translations.launchpad.description}
            </p>
        </div>
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 flex-shrink-0" onClick={fetchFinBite}>
                    <Bell className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Latest Updates</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-4">
                    {isLoadingFinBite ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    ) : finBiteError ? (
                        <Alert variant="destructive">
                            <AlertDescription>{finBiteError}</AlertDescription>
                        </Alert>
                    ) : finBite ? (
                        <Card className="bg-background">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Info className="h-5 w-5 text-primary" />
                                    {finBite.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{finBite.summary}</p>
                            </CardContent>
                        </Card>
                    ) : null}
                    <Button variant="secondary" onClick={fetchFinBite} disabled={isLoadingFinBite}>
                        {isLoadingFinBite ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Get Latest Update
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Globe />
              {translations.launchpad.statePortals.title}
            </CardTitle>
            <CardDescription>
              {translations.launchpad.statePortals.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PortalCard
              title={translations.launchpad.statePortals.apmsmeone.title}
              description={
                translations.launchpad.statePortals.apmsmeone.description
              }
              url="https://apmsmeone.ap.gov.in/MSMEONE/LoginPages/HomeLogin.aspx"
              loginText={translations.launchpad.statePortals.loginToPortal}
            />
            {/* Add more PortalCard components here as needed */}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">
              {translations.launchpad.startupJourney.title}
            </CardTitle>
            <CardDescription>
              {translations.launchpad.startupJourney.description}
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
                <div className="p-3 bg-primary/10 text-primary rounded-full">
                  <step.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Sparkles />
              MSME Clusters in AP
            </CardTitle>
            <CardDescription>
              Explore major and existing MSME clusters in Andhra Pradesh for
              your venture.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              plugins={[clustersPlugin.current]}
              className="w-full"
              onMouseEnter={clustersPlugin.current.stop}
              onMouseLeave={clustersPlugin.current.reset}
            >
              <CarouselContent>
                {msmeClusters.map((cluster, index) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="p-1 h-full">
                      <Card className="h-full flex flex-col hover:bg-accent/50">
                        <CardHeader>
                          <CardTitle className="text-base">
                            {cluster.name}
                          </CardTitle>
                          <CardDescription>{cluster.location}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-2">
                          <Badge variant="secondary">{cluster.sector}</Badge>
                          <p className="text-muted-foreground text-sm">
                            {cluster.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Banknote />
              Key Government Schemes
            </CardTitle>
            <CardDescription>
              Leverage these government initiatives to fuel your growth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              plugins={[schemesPlugin.current]}
              className="w-full"
              onMouseEnter={schemesPlugin.current.stop}
              onMouseLeave={schemesPlugin.current.reset}
            >
              <CarouselContent>
                {govtSchemes.map((scheme, index) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="p-1 h-full">
                      <Card className="h-full flex flex-col hover:bg-accent/50">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <scheme.icon className="h-6 w-6 text-primary" />
                            {scheme.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-2">
                          <p className="text-muted-foreground text-sm">
                            {scheme.description}
                          </p>
                        </CardContent>
                        <CardContent>
                          <Button asChild variant="link" className="p-0">
                            <a
                              href={scheme.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Learn More
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
