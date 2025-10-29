
'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

// Declare catalyst to avoid TypeScript errors
declare const catalyst: any;

// Define a more flexible User type to match Catalyst's output
type User = {
  user_id: string;
  email_id: string;
  first_name: string;
  last_name: string;
  displayName: string;
  email: string;
  [key: string]: any; // Allow other properties
};

// For now, user and profile are the same. This can be expanded later.
type UserProfile = User;

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUserAuthentication = async () => {
      // Wait for the Catalyst SDK to be ready
      if (typeof catalyst === 'undefined') {
        setTimeout(checkUserAuthentication, 100); // Check again shortly
        return;
      }

      try {
        const isAuthenticated = await catalyst.auth.isUserAuthenticated();
        if (isAuthenticated) {
          const currentUser = await catalyst.auth.getCurrentUser();
          
          // Map Catalyst user object to our app's User type
          const appUser: User = {
              user_id: currentUser.user_id,
              email_id: currentUser.email_id,
              first_name: currentUser.first_name,
              last_name: currentUser.last_name,
              displayName: `${currentUser.first_name} ${currentUser.last_name}`.trim(),
              email: currentUser.email_id,
              // role might be fetched from datastore later
          };

          setUser(appUser);
          setUserProfile(appUser); // Set profile as well
          
          if (pathname === '/' || pathname === '/signup') {
            router.replace('/dashboard');
          }
        } else {
            setUser(null);
            setUserProfile(null);
             // If not authenticated, redirect to login page if not already there
            if (pathname !== '/' && pathname !== '/signup') {
                router.replace('/');
            }
        }
      } catch (error) {
        console.error("Error checking Catalyst authentication:", error);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserAuthentication();
  }, [router, pathname]);


  const signOut = async () => {
    setLoading(true);
    await catalyst.auth.signOut(window.location.origin);
    setUser(null);
    setUserProfile(null);
    // The page will be reloaded by catalyst.auth.signOut()
  };

  const value = { user, userProfile, loading, signOut };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
