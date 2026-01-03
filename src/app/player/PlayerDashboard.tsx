'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerFeedbackView } from './PlayerFeedbackView';
import { PlayerProfile } from '@/context/AppContext';
import { Separator } from '@/components/ui/separator';
import { PlayerProfileForm } from './PlayerProfileForm';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface PlayerDashboardProps {
    player: PlayerProfile;
}

const playerAvatarPlaceholder = PlaceHolderImages.find((p) => p.id === 'player-avatar');

export function PlayerDashboard({ player }: PlayerDashboardProps) {
    return (
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Collapsible>
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Your Player Profile</CardTitle>
                                    <CardDescription>
                                        This is your active profile. Coaches view this to provide feedback.
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-4">
                                     <Avatar className="h-16 w-16">
                                        <AvatarImage src={player.profilePictureUrl || playerAvatarPlaceholder?.imageUrl} />
                                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                            </div>
                        </CardHeader>
                        <CollapsibleContent>
                            <CardContent>
                                <PlayerProfileForm player={player} />
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

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
