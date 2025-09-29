
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout is intentionally simple. The root layout in src/app/layout.tsx
  // already handles the main <html> and <body> structure. This component
  // just ensures the children for the /login route are rendered correctly
  // without adding the sidebar.
  return <>{children}</>;
}
