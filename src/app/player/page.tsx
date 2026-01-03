'use client';

import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerProfileForm } from './PlayerProfileForm';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { PlayerDashboard } from './PlayerDashboard';


function PlayerProfileLoader() {
    const { user } = useUser();
    const firestore = useFirestore();

    const playerProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'playerProfiles', user.uid);
    }, [user, firestore]);

    const { data: playerProfile, isLoading: isProfileLoading, error: profileError } = useDoc(playerProfileRef);

    const handleProfileCreation = () => {
        // This is a bit of a hack to force a re-fetch of the document.
        // In a more robust app, you might use a state management library to trigger this.
        window.location.reload();
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
        return <PlayerDashboard player={playerProfile as any} />;
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
                        <PlayerProfileForm onProfileCreate={handleProfileCreation} />
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
