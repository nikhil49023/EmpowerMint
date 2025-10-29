
'use client';

import { useAuth } from '@/context/auth-provider';
import { Avatar, AvatarFallback } from '../ui/avatar';
import Link from 'next/link';

export default function AppHeader() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between border-b glassmorphic px-2 sm:px-4 print:hidden">
      <div className="flex items-center gap-2">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-primary"
        >
          <path
            d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 22V12M12 12L3 7L12 2L21 7L12 12Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M16.5 4.5L7.5 9.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <h1 className="text-lg font-bold">FIn-Box</h1>
        </div>
      </div>
      <Link href="/profile">
         <Avatar className="h-9 w-9 border-2 border-primary/50">
            <AvatarFallback className="text-sm bg-muted">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
      </Link>
    </header>
  );
}
