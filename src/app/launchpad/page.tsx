
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
  ExternalLink,
  MapPin,
  Sparkles,
  Globe,
  LogIn,
  X,
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
import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';

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
      description: translations.launchpad.startupJourney.step3.description,
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

  const governmentSchemes = [
    {
      title: translations.launchpad.govtSchemes.seedFund.title,
      summary: translations.launchpad.govtSchemes.seedFund.summary,
      link: 'https://www.startupindia.gov.in/content/sih/en/funding/schemes/seed-fund-scheme.html',
    },
    {
      title: translations.launchpad.govtSchemes.mudra.title,
      summary: translations.launchpad.govtSchemes.mudra.summary,
      link: 'https://www.mudra.org.in/',
    },
    {
      title: translations.launchpad.govtSchemes.cgtmse.title,
      summary: translations.launchpad.govtSchemes.cgtmse.summary,
      link: 'https://www.cgtmse.in/',
    },
    {
      title: translations.launchpad.govtSchemes.aim.title,
      summary: translations.launchpad.govtSchemes.aim.summary,
      link: 'https://aim.gov.in/',
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
        </Card>

        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Sparkles />
              {translations.launchpad.govtSchemes.title}
            </CardTitle>
            <CardDescription>
              {translations.launchpad.govtSchemes.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            {governmentSchemes.map((scheme, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col glassmorphic hover:bg-background/80">
                  <CardHeader>
                    <CardTitle className="text-base">{scheme.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground text-sm">
                      {scheme.summary}
                    </p>
                  </CardContent>
                  <CardContent>
                    <a
                      href={scheme.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {translations.launchpad.govtSchemes.learnMore}{' '}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
