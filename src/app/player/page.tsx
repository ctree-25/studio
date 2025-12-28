'use client';

import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerProfileForm } from './PlayerProfileForm';
import Link from 'next/link';

export default function PlayerPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
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
                            <PlayerProfileForm />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
