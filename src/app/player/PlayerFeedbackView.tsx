'use client';

import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function PlayerFeedbackView() {
    const { players } = useAppContext();
    
    // In a real app, we'd get the current logged-in player.
    // Here we just take the first non-mock player that has been submitted.
    const myProfile = players.find(p => !p.id.startsWith('mock-') && p.submitted);

    if (!myProfile) {
        return (
            <div className="text-center text-muted-foreground py-8">
                <p>Create your profile to receive feedback from coaches.</p>
            </div>
        );
    }
    
    if (!myProfile.coachFeedback) {
        return (
            <div className="text-center text-muted-foreground py-8">
                <p>No feedback received yet. Coaches are reviewing your profile, check back later!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle className="text-lg">Feedback from a Coach</CardTitle>
                    <CardDescription>This feedback has been provided anonymously.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{myProfile.coachFeedback}</p>
                </CardContent>
            </Card>

            {myProfile.aiAnalysis && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Your AI-Powered Analysis</CardTitle>
                        <CardDescription>This was generated from your highlight footage to help coaches.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-primary">Strengths</h4>
                            <p className="text-muted-foreground">{myProfile.aiAnalysis.strengths}</p>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold text-primary">Areas for Improvement</h4>
                            <p className="text-muted-foreground">{myProfile.aiAnalysis.weaknesses}</p>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold text-primary">Overall Assessment</h4>
                            <p className="text-muted-foreground">{myProfile.aiAnalysis.overallAssessment}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
