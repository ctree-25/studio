'use client';

import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function CoachDashboard() {

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline">Coach Portal</h1>
            <p className="text-muted-foreground">Log in to review player profiles and provide evaluations.</p>
          </div>
            <Card>
                <CardHeader>
                    <CardTitle>Login Required</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-muted-foreground'>
                        Please log in to access the coach dashboard. If you want to see a demo, you can check it out <Link href="/coach/demo" className='text-primary underline'>here</Link>.
                    </p>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
