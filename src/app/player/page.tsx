
'use client';

import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerProfileForm } from './PlayerProfileForm';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import { PlayerDashboard } from './PlayerDashboard';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

const profileFormSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    position: z.string().min(2, { message: 'Position is required.' }),
    height: z.string().min(2, { message: 'Height is required.' }),
    gradYear: z.string().min(4, { message: 'Valid graduation year is required.' }),
    targetLevel: z.enum(['D1', 'D2', 'D3'], { required_error: 'Target level is required.' }),
    preferredSchools: z.string().min(3, { message: 'Please list at least one school.' }),
    highlightVideoUrl: z.string().url({ message: 'Please enter a valid video URL.' }),
  });
  
type ProfileFormValues = z.infer<typeof profileFormSchema>;


function PlayerProfileLoader() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);


    const playerProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'playerProfiles', user.uid);
    }, [user, firestore]);

    const { data: playerProfile, isLoading: isProfileLoading, error: profileError } = useDoc(playerProfileRef);

    const handleProfileUpdate = () => {
        window.location.reload();
    }
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
          name: playerProfile?.name || user?.displayName || '',
          position: playerProfile?.position || '',
          height: playerProfile?.height || '',
          gradYear: playerProfile?.gradYear || '',
          targetLevel: playerProfile?.targetLevel,
          preferredSchools: playerProfile?.preferredSchools || '',
          highlightVideoUrl: playerProfile?.highlightVideoUrl || '',
        },
      });

      async function onSubmit(data: ProfileFormValues) {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to create a profile.',
            });
            return;
        }
    
        setIsLoading(true);
        toast({
          title: 'Processing Profile...',
          description: 'Your profile is being submitted.',
        });
    
        try {
            const playerProfileRef = doc(firestore, 'playerProfiles', user.uid);
            
            const profileDataToSave = {
                ...data,
                id: user.uid,
                userId: user.uid,
                submitted: true,
            };
            
            setDocumentNonBlocking(playerProfileRef, profileDataToSave, { merge: true });
    
            toast({
                title: 'Profile Submitted!',
                description: 'Your profile is now available for coaches to review.',
            });
    
            handleProfileUpdate();
    
        } catch (error) {
          console.error('Failed to process profile:', error);
          toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'There was an error processing your profile. Please try again.',
          });
        } finally {
          setIsLoading(false);
        }
      }

    if (isProfileLoading) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center">
                <p>Loading profile...</p>
            </div>
        );
    }
    
    if (profileError) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center">
                <p>Error loading profile. Please try again later.</p>
            </div>
        )
    }

    if (playerProfile) {
        return <PlayerDashboard player={playerProfile as any} onProfileUpdate={handleProfileUpdate} />;
    }

    return (
         <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Your Player Profile</CardTitle>
                        <CardDescription>
                            Complete your profile to get feedback. Your information and highlight footage will be analyzed by our AI and reviewed by coaches. To see an example, check out the <Link href="/player/demo" className="underline text-primary">demo</Link>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PlayerProfileForm form={form as any} onSubmit={onSubmit} isLoading={isLoading} />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

export default function PlayerPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    
    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <PlayerProfileLoader />
        </div>
    );
}
