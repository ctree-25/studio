'use client';

import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayerProfileForm } from './PlayerProfileForm';
import { PlayerFeedbackView } from './PlayerFeedbackView';

export default function PlayerPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="profile">My Profile</TabsTrigger>
                            <TabsTrigger value="feedback">My Feedback</TabsTrigger>
                        </TabsList>
                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Player Profile</CardTitle>
                                    <CardDescription>
                                        Complete your profile to get noticed. Your information and highlight footage will be analyzed by our AI and reviewed by coaches.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PlayerProfileForm />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="feedback">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Coach Feedback</CardTitle>
                                    <CardDescription>
                                        Here you can find anonymized feedback from coaches who have reviewed your profile.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PlayerFeedbackView />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
