'use client';

import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerFeedbackView } from './PlayerFeedbackView';
import { PlayerProfile } from '@/context/AppContext';
import { Separator } from '@/components/ui/separator';
import { PlayerProfileForm } from './PlayerProfileForm';

interface PlayerDashboardProps {
    player: PlayerProfile;
}

export function PlayerDashboard({ player }: PlayerDashboardProps) {
    return (
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Player Profile</CardTitle>
                        <CardDescription>
                            This is your active profile. Coaches can view this information to provide feedback.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PlayerProfileForm player={player} />
                    </CardContent>
                </Card>

                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle>Feedback &amp; Analysis</CardTitle>
                        <CardDescription>
                            Here is the feedback from coaches and your personalized training tips.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PlayerFeedbackView player={player} />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
