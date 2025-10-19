
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
import { auth, db } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';

const indianStates = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,36.49,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');

  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { translations } = useLanguage();

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // New user, save their data
        await setDoc(userDocRef, {
          name: user.displayName || '',
          email: user.email,
          age: '',
          occupation: '',
          annualIncome: '',
          state: '',
          district: '',
        });
        toast({
          title: translations.loginPage.accountCreated,
          description: translations.loginPage.welcome,
        });
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAuthAction = async () => {
    setError(null);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Save additional user info to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name, age, occupation, annualIncome, state, district, email: user.email,
        });

        toast({
          title: translations.loginPage.accountCreated,
          description: translations.loginPage.welcome,
        });
        router.push('/dashboard');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      }
    } catch (err: any) {
      let errorMessage = translations.loginPage.error.unexpected;
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = translations.loginPage.error.userNotFound;
          break;
        case 'auth/wrong-password':
          errorMessage = translations.loginPage.error.wrongPassword;
          break;
        case 'auth/email-already-in-use':
          errorMessage = translations.loginPage.error.emailInUse;
          break;
        case 'auth/weak-password':
          errorMessage = translations.loginPage.error.weakPassword;
          break;
        default:
          errorMessage = err.message;
          break;
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-12">
      <Card className="w-full max-w-md glassmorphic">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary">
              <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 22V12M12 12L3 7L12 2L21 7L12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? translations.loginPage.signUpTitle : translations.loginPage.title}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? translations.loginPage.signUpDescription
              : translations.loginPage.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isSignUp && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{translations.loginPage.nameLabel}</Label>
                <Input id="name" placeholder={translations.loginPage.namePlaceholder} required={isSignUp} value={name} onChange={e => setName(e.target.value)} suppressHydrationWarning />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">{translations.loginPage.ageLabel}</Label>
                  <Input id="age" type="number" placeholder="25" required={isSignUp} value={age} onChange={e => setAge(e.target.value)} suppressHydrationWarning />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">{translations.loginPage.occupationLabel}</Label>
                  <Select onValueChange={setOccupation} value={occupation}>
                    <SelectTrigger id="occupation" suppressHydrationWarning>
                      <SelectValue placeholder={translations.loginPage.occupationPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{translations.loginPage.publicSector}</SelectItem>
                      <SelectItem value="private">{translations.loginPage.privateSector}</SelectItem>
                      <SelectItem value="student">{translations.loginPage.student}</SelectItem>
                      <SelectItem value="self-employed">{translations.loginPage.selfEmployed}</SelectItem>
                      <SelectItem value="other">{translations.loginPage.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="annualIncome">{translations.loginPage.annualIncomeLabel}</Label>
                <Input id="annualIncome" type="number" placeholder="500000" required={isSignUp} value={annualIncome} onChange={e => setAnnualIncome(e.target.value)} suppressHydrationWarning />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">{translations.loginPage.stateLabel}</Label>
                  <Select onValueChange={setState} value={state}>
                    <SelectTrigger id="state" suppressHydrationWarning>
                      <SelectValue placeholder={translations.loginPage.statePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map(stateName => (
                        <SelectItem key={stateName} value={stateName}>
                          {stateName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">{translations.loginPage.districtLabel}</Label>
                  <Input id="district" placeholder={translations.loginPage.districtPlaceholder} required={isSignUp} value={district} onChange={e => setDistrict(e.target.value)} suppressHydrationWarning />
                </div>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{translations.loginPage.emailLabel}</Label>
            <Input id="email" type="email" placeholder={translations.loginPage.emailPlaceholder} required value={email} onChange={e => setEmail(e.target.value)} suppressHydrationWarning />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{translations.loginPage.passwordLabel}</Label>
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} suppressHydrationWarning />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleAuthAction} suppressHydrationWarning>
            {isSignUp ? translations.loginPage.signUpButton : translations.loginPage.loginButton}
          </Button>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {translations.loginPage.continueWith}
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} suppressHydrationWarning >
            <GoogleIcon />
            <span className="ml-2">{translations.loginPage.googleSignIn}</span>
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-4">
            {isSignUp ? translations.loginPage.haveAccount : translations.loginPage.dontHaveAccount}{' '}
            <Button variant="link" className="p-0 h-auto text-primary" onClick={() => { setIsSignUp(!isSignUp); setError(null); }} suppressHydrationWarning >
              {isSignUp ? translations.loginPage.loginButton : translations.loginPage.signUpButton}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
