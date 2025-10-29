'use client';

import { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

declare const catalyst: any;

export default function LoginPage() {

  useEffect(() => {
    // This effect runs when the component mounts.
    // We check if the catalyst object is available and then initialize the sign-in widget.
    if (typeof catalyst !== 'undefined' && catalyst.auth) {
      catalyst.auth.signIn("loginDivElementId");
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary">
              <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 22V12M12 12L3 7L12 2L21 7L12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <CardTitle className="text-2xl">
             Login to FIn-Box
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {/* This div is where the Zoho Catalyst login widget will be rendered. */}
          <div id="loginDivElementId"></div>
        </CardContent>
      </Card>
    </div>
  );
}
