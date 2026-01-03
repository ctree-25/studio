'use client';

import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CoachProfileForm } from './CoachProfileForm';
import Link from 'next/link';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import { CoachDashboard } from './CoachDashboard';
import { PlayerAssessmentPage } from './PlayerAssessmentPage';


function CoachProfileLoader() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

    const coachProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'coaches', user.uid);
    }, [user, firestore]);
    const { data: coachProfile, isLoading: isProfileLoading, error: profileError } = useDoc(coachProfileRef);

    const handleProfileCreation = () => {
        window.location.reload();
    }

    const handleSelectPlayer = (playerId: string) => {
        setSelectedPlayerId(playerId);
    }

    const handleReturnToDashboard = () => {
        setSelectedPlayerId(null);
    }
    
    if (isProfileLoading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (profileError) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center">
                <p>Error loading profile. Please try again later.</p>
            </div>
        )
    }

    if (coachProfile) {
        if (selectedPlayerId) {
            return <PlayerAssessmentPage playerId={selectedPlayerId} onBack={handleReturnToDashboard} />;
        }
        return <CoachDashboard onSelectPlayer={handleSelectPlayer} />;
    }

    return (
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Your Coach Profile</CardTitle>
                        <CardDescription>
                            Join our network of coaches to help evaluate and mentor the next generation of volleyball talent. To see an example of the coach dashboard, check out the <Link href="/coach/demo" className="underline text-primary">demo</Link>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CoachProfileForm onProfileCreate={handleProfileCreation} />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

export default function CoachPage() {
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
            <CoachProfileLoader />
        </div>
    );
}
