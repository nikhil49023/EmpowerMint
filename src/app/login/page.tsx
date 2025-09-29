
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm glassmorphic">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-primary"
            >
              <path d="M12 2L12 8" />
              <path d="M12 16L12 22" />
              <path d="M17 7L19 7" />
              <path d="M5 7L7 7" />
              <path d="M17 17L19 17" />
              <path d="M5 17L7 17" />
              <path d="M12 2L15 5L12 8L9 5L12 2" />
              <path d="M9 19L12 22L15 19L12 16L9 19" />
              <path d="M2 12L5 15L8 12L5 9L2 12" />
              <path d="M16 12L19 15L22 12L19 9L16 12" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Welcome to Uplift AI</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleLogin}>
            Login
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="#" className="underline text-primary">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
