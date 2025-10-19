
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
  MapPin,
  Sparkles,
  Globe,
  LogIn,
  X,
  Briefcase,
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

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
      <Card className="h-full flex flex-col glassmorphic hover:border-primary transition-colors cursor-pointer">
        <CardHeader>
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
    <DialogContent className="max-w-[90vw] md:max-w-4xl lg:max-w-6xl h-[90vh] flex flex-col p-0 glassmorphic">
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

export default function LaunchpadPage() {
  const { translations } = useLanguage();

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
            <DialogContent className="max-w-[90vw] md:max-w-4xl lg:max-w-6xl h-[90vh] flex flex-col p-0 glassmorphic">
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

  const startupHubs = [
    {
      name: translations.launchpad.startupHubs.bengaluru.name,
      description: translations.launchpad.startupHubs.bengaluru.description,
    },
    {
      name: translations.launchpad.startupHubs.delhi.name,
      description: translations.launchpad.startupHubs.delhi.description,
    },
    {
      name: translations.launchpad.startupHubs.mumbai.name,
      description: translations.launchpad.startupHubs.mumbai.description,
    },
    {
      name: translations.launchpad.startupHubs.hyderabad.name,
      description: translations.launchpad.startupHubs.hyderabad.description,
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

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Rocket className="h-8 w-8" />
          {translations.launchpad.title}
        </h1>
        <p className="text-muted-foreground">
          {translations.launchpad.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <Card className="glassmorphic lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Globe />
              {translations.launchpad.statePortals.title}
            </CardTitle>
            <CardDescription>
              {translations.launchpad.statePortals.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

        <Card className="glassmorphic lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">{translations.launchpad.startupJourney.title}</CardTitle>
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
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="glassmorphic lg:col-span-2">
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
              className="w-full"
            >
              <CarouselContent>
                {msmeClusters.map((cluster, index) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="p-1 h-full">
                      <Card className="h-full flex flex-col glassmorphic hover:bg-background/80">
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
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </CardContent>
        </Card>

        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <MapPin />
              {translations.launchpad.startupHubs.title}
            </CardTitle>
            <CardDescription>
              {translations.launchpad.startupHubs.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {startupHubs.map((hub, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 rounded-lg bg-background/50"
              >
                <h3 className="font-semibold">{hub.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {hub.description}
                </p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    