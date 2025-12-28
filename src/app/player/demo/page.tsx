'use client';

import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerFeedbackView } from '../PlayerFeedbackView';
import { useAppContext } from '@/context/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BarChart2, Calendar, MapPin, Ruler } from 'lucide-react';
import Link from 'next/link';

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
                                <CardHeader className='flex-row items-center gap-4'>
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={player.profilePictureUrl} data-ai-hint="volleyball player"/>
                                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-2xl font-headline">{player.name}</CardTitle>
                                        <CardDescription>{player.position}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center"><Ruler className="w-4 h-4 mr-2 text-muted-foreground"/> Height: {player.height}</div>
                                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-muted-foreground"/> Grad Year: {player.gradYear}</div>
                                    <div className="flex items-center"><BarChart2 className="w-4 h-4 mr-2 text-muted-foreground"/> Target Level: {player.targetLevel}</div>
                                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-muted-foreground"/> Target Schools: {player.preferredSchools}</div>
                                </CardContent>
                             </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Coach Feedback</CardTitle>
                                    <CardDescription>
                                        Here you can find anonymized feedback from coaches who have evaluated your profile.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PlayerFeedbackView player={player} />
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
