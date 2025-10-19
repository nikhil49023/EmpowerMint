
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from '@/components/financify/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Inter } from 'next/font/google';
import AIAdvisorFab from '@/components/financify/ai-advisor-fab';
import { FirebaseProvider } from '@/firebase/provider';
import { LanguageProvider } from '@/context/language-provider';
import AppHeader from '@/components/financify/app-header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Special layout for the login page
  if (pathname === '/' || pathname === '/login') {
    return (
      <html lang="en">
        <body className={`${inter.variable} font-body antialiased bg-gray-50`}>
          <FirebaseProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </FirebaseProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>FIn-Box</title>
        <meta name="description" content="Your personal finance dashboard." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <FirebaseProvider>
          <LanguageProvider>
            <div className="flex h-screen overflow-hidden bg-background">
              {/* Desktop Sidebar */}
              <div className="hidden md:flex md:flex-shrink-0">
                <Sidebar />
              </div>

              <div className="flex flex-col w-0 flex-1 overflow-hidden">
                {/* Mobile Header */}
                <AppHeader />
                
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                  <div className="py-6 px-4 sm:px-6 lg:px-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-7xl mx-auto"
                      >
                        {children}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </main>
              </div>
            </div>
            <AIAdvisorFab />
            <Toaster />
          </LanguageProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
