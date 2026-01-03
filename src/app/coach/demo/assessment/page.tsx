
'use client';

import { AppHeader } from '@/components/AppHeader';
import { PlayerAssessmentPage } from '../../PlayerAssessmentPage';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function DemoAssessmentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const playerId = searchParams.get('playerId');

    if (!playerId) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center">
                <p>Player not found.</p>
            </div>
        );
    }
    
    return <PlayerAssessmentPage playerId={playerId} onBack={() => router.push('/coach/demo')} isDemo={true} />;
}


export default function CoachDemoAssessmentPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
                <DemoAssessmentContent />
            </Suspense>
        </div>
    );
}
