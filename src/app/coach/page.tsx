'use client';

import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CoachProfileForm } from './CoachProfileForm';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
                            <CoachProfileForm />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
