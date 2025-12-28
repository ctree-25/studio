'use client';

import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CoachProfileForm } from './CoachProfileForm';
import Link from 'next/link';

export default function CoachPage() {
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
