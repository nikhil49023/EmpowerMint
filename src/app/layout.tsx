import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Sidebar from '@/components/financify/sidebar';

export const metadata: Metadata = {
  title: 'Financify',
  description: 'Your personal finance dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
