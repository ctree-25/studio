'use client';

import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerFeedbackView } from '../PlayerFeedbackView';
import { useAppContext } from '@/context/AppContext';
import { PlayerProfileForm } from '../PlayerProfileForm';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function PlayerDemoPage() {
    const { getPlayer } = useAppContext();
    const player = getPlayer('mock-player-2');

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {player ? (
                        <>
                           <Card>
                                <CardHeader>
                                    <CardTitle>Example Player Profile</CardTitle>
                                    <CardDescription>
                                        This is a demonstration of how a player profile looks when filled out. Use this as a guide for your own submission.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PlayerProfileForm player={player} isDemo={true} />
                                </CardContent>
                            </Card>

                            <Separator />
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>Example Feedback & Analysis</CardTitle>
                                    <CardDescription>
                                        Once you submit your profile, this is how coach feedback and AI analysis will be displayed.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PlayerFeedbackView player={player} isDemo={true} />
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                         <Card>
                            <CardHeader>
                                <CardTitle>Profile not found</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-muted-foreground'>
                                    The demo profile could not be loaded. You can create your own profile <Link href="/player" className='text-primary underline'>here</Link>.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
