
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

const startupSteps = [
  {
    icon: Lightbulb,
    title: '1. Idea & Validation',
    description:
      'Define your business idea and validate its market potential. Research your target audience and competitors.',
  },
  {
    icon: FileText,
    title: '2. Business Plan (DRP)',
    description:
      'Create a Detailed Project Report (DRP). Use our "Brainstorm" feature to get AI-powered assistance in building your plan.',
  },
  {
    icon: Building,
    title: '3. Register Your Business',
    description:
      'Choose a business structure (Sole Proprietorship, LLP, Pvt. Ltd.) and complete the legal registration process. Check for state-specific portals like APMSME ONE.',
  },
  {
    icon: Banknote,
    title: '4. Funding & Finance',
    description:
      'Explore funding options like bootstrapping, angel investors, venture capital, or government schemes.',
  },
  {
    icon: Rocket,
    title: '5. Build & Launch',
    description:
      'Develop your Minimum Viable Product (MVP), set up your operations, and officially launch your business.',
  },
  {
    icon: Megaphone,
    title: '6. Market & Grow',
    description:
      'Implement your marketing strategy to attract customers and scale your operations for growth.',
  },
];

const governmentSchemes = [
  {
    title: 'Startup India Seed Fund Scheme',
    summary:
      'Provides financial assistance to startups for proof of concept, prototype development, product trials, and market entry.',
    link: 'https://www.startupindia.gov.in/content/sih/en/funding/schemes/seed-fund-scheme.html',
  },
  {
    title: 'MUDRA Loans (PMMY)',
    summary:
      'Offers loans up to ?10 lakh to non-corporate, non-farm small/micro-enterprises. Ideal for initial funding needs.',
    link: 'https://www.mudra.org.in/',
  },
  {
    title: 'Credit Guarantee Scheme (CGTMSE)',
    summary:
      'Facilitates collateral-free credit for Micro and Small Enterprises from financial institutions.',
    link: 'https://www.cgtmse.in/',
  },
  {
    title: 'Atal Innovation Mission (AIM)',
    summary:
      'Promotes a culture of innovation and entrepreneurship through various initiatives, including incubation centers.',
    link: 'https://aim.gov.in/',
  },
];

const startupHubs = [
  {
    name: 'Bengaluru, Karnataka',
    description:
      "India's Silicon Valley, known for its strong tech ecosystem, access to venture capital, and a large talent pool.",
  },
  {
    name: 'Delhi-NCR',
    description:
      'A diverse startup hub with a large consumer market, strong B2B opportunities, and a mix of various industries.',
  },
  {
    name: 'Mumbai, Maharashtra',
    description:
      "The financial capital of India, offering great access to funding, and a thriving fintech and media-tech scene.",
  },
  {
    name: 'Hyderabad, Telangana',
    description:
      'A rapidly growing hub with strong government support, a focus on life sciences, and emerging technologies.',
  },
];

const PortalCard = ({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
        <CardContent>
          <Button>
            <LogIn className="mr-2 h-4 w-4" /> Login to Portal
          </Button>
        </CardContent>
      </Card>
    </DialogTrigger>
    <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 glassmorphic">
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
        <iframe
          src={url}
          className="w-full h-full border-0"
          title={title}
        />
      </div>
    </DialogContent>
  </Dialog>
);

export default function LaunchpadPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Rocket className="h-8 w-8" />
          Founder's Launchpad
        </h1>
        <p className="text-muted-foreground">
          Your guide to starting and growing your enterprise in India.
        </p>
      </div>
      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe />
            State-Specific Portals
          </CardTitle>
          <CardDescription>
            Access resources and schemes from your state government.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PortalCard
            title="APMSME ONE"
            description="A dedicated portal for Micro, Small and Medium Enterprises in Andhra Pradesh, offering a range of services and support."
            url="http://www.apmsmeone.in/"
          />
        </CardContent>
      </Card>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles />
            Key Government Schemes
          </CardTitle>
          <CardDescription>
            Leverage these government initiatives to fuel your growth.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {governmentSchemes.map((scheme, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{scheme.title}</CardTitle>
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
                    Learn More <ExternalLink className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin />
            Major Startup Hubs
          </CardTitle>
          <CardDescription>
            Discover the top ecosystems for entrepreneurs in India.
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

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>Your Startup Journey</CardTitle>
          <CardDescription>
            A step-by-step guide to launching your business.
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
    </div>
  );
}
