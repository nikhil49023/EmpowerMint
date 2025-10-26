
'use client';

import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithZoho } from '@/lib/catalyst-auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const handleAuthAction = async () => {
    setError(null);
    try {
      let result;
      if (isSignUp) {
        if (!name || !email || !password) {
          setError("Please fill in all fields for sign up.");
          return;
        }
        result = await createUserWithEmailAndPassword(name, email, password);
        toast({
          title: "Account Created",
          description: "Welcome! You can now log in.",
        });
        // Switch to login view after successful registration
        setIsSignUp(false); 
        setPassword(''); // Clear password field
      } else {
        result = await signInWithEmailAndPassword(email, password);
        if (result && result.data?.user) {
             // Simulate session management
            sessionStorage.setItem('catalyst_user', JSON.stringify({
                uid: result.data.user.user_id,
                email: result.data.user.email_address,
                displayName: result.data.user.name,
            }));
            router.push('/dashboard');
        } else {
            throw new Error(result.message || "Login failed. Please check your credentials.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };
  
  const handleZohoSignIn = async () => {
    setError(null);
    try {
      // This will redirect the user to the Zoho login page.
      // The server-side will handle the callback and token exchange.
      await signInWithZoho();
    } catch (err: any) {
      setError(err.message || 'Zoho sign-in failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary">
              <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 22V12M12 12L3 7L12 2L21 7L12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? "Create an Account" : "Welcome to FIn-Box"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Enter your details to get started."
              : "Enter your credentials to access your dashboard."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isSignUp && (
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="John Doe" required={isSignUp} value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="user@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </div>
           <Button className="w-full" onClick={handleAuthAction}>
            {isSignUp ? "Sign Up" : "Login"}
          </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>
            
             <Button variant="outline" className="w-full" onClick={handleZohoSignIn}>
                Sign in with Zoho
            </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 px-6 pb-6">
          <p className="text-xs text-center text-muted-foreground pt-4">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
            <Button variant="link" className="p-0 h-auto text-primary" onClick={() => { setIsSignUp(!isSignUp); setError(null); }}>
              {isSignUp ? "Login" : "Sign Up"}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
