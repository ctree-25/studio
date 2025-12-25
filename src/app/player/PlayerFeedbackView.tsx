'use client';

import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlayerSkillChart } from "@/components/PlayerSkillChart";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const extractAverageSkillData = (feedback: string) => {
    const assessments: { [key: string]: number[] } = {};
    const feedbackSections = feedback.split('###').filter(s => s.trim() !== '');

    feedbackSections.forEach((section) => {
        const lines = section.trim().split('\n');
        lines.forEach(line => {
            const match = line.match(/- ([\w\s]+): (\d+)\/10/);
            if (match) {
                const skillName = match[1].trim();
                const rating = parseInt(match[2], 10);
                if (!assessments[skillName]) {
                    assessments[skillName] = [];
                }
                assessments[skillName].push(rating);
            }
        });
    });

    const averageSkills = Object.entries(assessments).map(([skill, ratings]) => {
        const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        return { skill, average: parseFloat(average.toFixed(1)) };
    });

    return averageSkills;
};

export function PlayerFeedbackView() {
    const { players } = useAppContext();
    
    // In a real app, we'd get the current logged-in player.
    // Here we default to showing Jamie Tree's profile.
    const myProfile = players.find(p => p.id === 'mock-player-2');

    if (!myProfile) {
        return (
            <div className="text-center text-muted-foreground py-8">
                <p>Create your profile to receive feedback from coaches.</p>
            </div>
        );
    }
    
    const coachAssessments = myProfile.coachFeedback?.split('###').filter(s => s.trim() !== '').map(s => s.trim());
    const averageSkillData = myProfile.coachFeedback ? extractAverageSkillData(myProfile.coachFeedback) : [];

    return (
        <Tabs defaultValue="skill-assessment" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="skill-assessment" className="whitespace-normal h-auto">Skill Assessment</TabsTrigger>
                <TabsTrigger value="coach-feedback" className="whitespace-normal h-auto">Coach Feedback</TabsTrigger>
                <TabsTrigger value="ai-analysis" className="whitespace-normal h-auto">AI Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="skill-assessment">
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Assessment</CardTitle>
                    <CardDescription>Aggregated from coach feedback.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myProfile.coachFeedback ? (
                        <>
                            <Suspense fallback={<Skeleton className="w-full h-[450px]" />}>
                                <PlayerSkillChart feedback={myProfile.coachFeedback} />
                            </Suspense>
                            <Separator className="my-6" />
                            <div className="space-y-4">
                                <h4 className="font-semibold text-center">Average Skill Ratings</h4>
                                {averageSkillData.map(({ skill, average }) => (
                                    <div key={skill} className="grid grid-cols-3 items-center gap-4">
                                        <span className="text-sm text-muted-foreground">{skill}</span>
                                        <Progress value={average * 10} className="h-2 col-span-1"/>
                                        <span className="text-sm font-bold text-primary">{average.toFixed(1)} / 10</span>
                                    </div>
                                ))}
                            </div>
                         </>
                    ): (
                        <div className="text-center text-muted-foreground py-8">
                            <p>No skill data available yet.</p>
                        </div>
                    )}
                  </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="coach-feedback">
                {coachAssessments && coachAssessments.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Coach Assessments</CardTitle>
                            <CardDescription>This feedback has been provided anonymously by college coaches.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {coachAssessments.map((assessment, index) => (
                               <div key={index}>
                                 <p
                                    className="whitespace-pre-wrap text-muted-foreground"
                                    dangerouslySetInnerHTML={{
                                        __html: assessment
                                            .replace(/(Coach Assessment:)/g, '<strong class="text-primary">$1</strong>')
                                            .replace(/- ([\w\s]+): (\d+\/10)/g, '- <strong>$1:</strong> $2')
                                    }}
                                 />
                                 {index < coachAssessments.length - 1 && <Separator className="my-4" />}
                               </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                         <CardHeader>
                            <CardTitle>Coach Assessments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-muted-foreground py-8">
                                <p>No coach feedback yet. Check back later!</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
            <TabsContent value="ai-analysis">
                {myProfile.aiAnalysis ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your AI-Powered Analysis</CardTitle>
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
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your AI-Powered Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="text-center text-muted-foreground py-8">
                                <p>Submit your profile to get an AI analysis.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
        </Tabs>
    );
}
