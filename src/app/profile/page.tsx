
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Loader2, Briefcase, Building, Phone, MapPin, Edit, Link as LinkIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/context/auth-provider';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export default function ProfilePage() {
  const { user, userProfile, loading, signOut } = useAuth();
  const router = useRouter();
  const { translations } = useLanguage();
  const { toast } = useToast();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isMsme = userProfile?.role === 'msme';
  
  const [msmeData, setMsmeData] = useState({
    msmeName: userProfile?.msmeName || '',
    msmeService: userProfile?.msmeService || '',
    msmeLocation: userProfile?.msmeLocation || '',
    ownerContact: userProfile?.ownerContact || '',
    msmeWebsite: userProfile?.msmeWebsite || '',
  });

  const handleMsmeDataChange = (field: keyof typeof msmeData, value: string) => {
    setMsmeData(prev => ({...prev, [field]: value}));
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    
    const userDocRef = doc(db, 'users', user.uid);
    try {
        await setDoc(userDocRef, {
            ...userProfile,
            ...msmeData
        }, { merge: true });

        toast({ title: 'Success', description: 'Your profile has been updated.'});
        setEditDialogOpen(false);
    } catch (e) {
        console.error("Error updating profile:", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update your profile.'});
    } finally {
        setIsSaving(false);
    }
  };

  const handleLogout = () => {
    signOut();
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <Card>
        <CardHeader className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary">
            <AvatarFallback className="text-3xl bg-muted">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{user.displayName || 'User'}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <LogOut className="mr-2" />
                {translations.sidebar.logout}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{translations.logoutDialog.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {translations.logoutDialog.description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{translations.logoutDialog.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  {translations.logoutDialog.confirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
      
      {isMsme && userProfile && (
        <Card>
           <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Briefcase />
                  My MSME Profile
                </CardTitle>
                <CardDescription>
                  This is your business information as it appears to others in the marketplace.
                </CardDescription>
              </div>
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4"/> Edit
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit MSME Profile</DialogTitle>
                        <DialogDescription>Update your business details below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="msmeName">Business Name</Label>
                            <Input id="msmeName" value={msmeData.msmeName} onChange={(e) => handleMsmeDataChange('msmeName', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="msmeService">Service / Product</Label>
                            <Input id="msmeService" value={msmeData.msmeService} onChange={(e) => handleMsmeDataChange('msmeService', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="msmeLocation">Location</Label>
                            <Input id="msmeLocation" value={msmeData.msmeLocation} onChange={(e) => handleMsmeDataChange('msmeLocation', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ownerContact">Contact Number</Label>
                            <Input id="ownerContact" value={msmeData.ownerContact} onChange={(e) => handleMsmeDataChange('ownerContact', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="msmeWebsite">Website URL</Label>
                            <Input id="msmeWebsite" value={msmeData.msmeWebsite} onChange={(e) => handleMsmeDataChange('msmeWebsite', e.target.value)} placeholder="e.g., www.mybusiness.com" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Business Name</h4>
                      <p className="text-muted-foreground">{userProfile.msmeName || 'Not Provided'}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Location</h4>
                      <p className="text-muted-foreground">{userProfile.msmeLocation || 'Not Provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Service / Product</h4>
                      <p className="text-muted-foreground">{userProfile.msmeService || 'Not Provided'}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Contact Number</h4>
                      <p className="text-muted-foreground">{userProfile.ownerContact || 'Not Provided'}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-3 col-span-1 md:col-span-2">
                    <LinkIcon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Website</h4>
                      {userProfile.msmeWebsite ? (
                         <a href={userProfile.msmeWebsite.startsWith('http') ? userProfile.msmeWebsite : `https://${userProfile.msmeWebsite}`} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">
                           {userProfile.msmeWebsite}
                         </a>
                      ) : (
                        <p className="text-muted-foreground">Not Provided</p>
                      )}
                    </div>
                  </div>
               </div>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
