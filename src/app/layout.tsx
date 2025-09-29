
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from '@/components/financify/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Inter } from 'next/font/google';

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

  // Do not show sidebar on login page
  if (pathname === '/login') {
    return (
      <html lang="en">
        <body className={`${inter.variable} font-body antialiased`}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>Uplift AI</title>
        <meta name="description" content="Your personal finance dashboard." />
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-8 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
