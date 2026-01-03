'use client';

import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CoachProfileForm } from './CoachProfileForm';
import Link from 'next/link';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { CoachDashboard } from './CoachDashboard';

export default function CoachPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    const coachProfileRef = user ? doc(firestore, 'coachProfiles', user.uid) : null;
    const { data: coachProfile, isLoading: isProfileLoading, error: profileError } = useDoc(coachProfileRef);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    const handleProfileCreation = () => {
        // This is a bit of a hack to force a re-fetch of the document.
        // In a more robust app, you might use a state management library to trigger this.
        window.location.reload();
    }

    if (isUserLoading || isProfileLoading || !user) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center">
                <p>Loading...</p>
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
        return <CoachDashboard />;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
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
        </div>
    );
}
