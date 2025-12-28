'use client';

import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlayerSkillChart } from "@/components/PlayerSkillChart";
import { Suspense, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PlayerProfile } from "@/context/AppContext";
import { generateTrainingPlan, GenerateTrainingPlanOutput } from "@/ai/flows/generate-training-plan";
import { Button } from "@/components/ui/button";
import { Loader2, Youtube } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

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

export function PlayerFeedbackView({ player, isDemo = false }: { player: PlayerProfile | undefined, isDemo?: boolean }) {
    const { updatePlayer } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    if (!player) {
        return (
            <div className="text-center text-muted-foreground py-8">
                <p>Player profile not found. Create your profile to receive feedback from coaches.</p>
            </div>
        );
    }
    
    const coachAssessments = player.coachFeedback?.split('###').filter(s => s.trim() !== '').map(s => s.trim());
    const averageSkillData = player.coachFeedback ? extractAverageSkillData(player.coachFeedback) : [];

    const handleGeneratePlan = async () => {
        if (!player.coachFeedback) {
            toast({
                variant: 'destructive',
                title: 'No Feedback Available',
                description: 'A training plan can only be generated after receiving coach feedback.'
            });
            return;
        }

        setIsLoading(true);
        toast({
            title: 'Generating Training Plan...',
            description: 'Our AI is creating a personalized plan for you.'
        });

        try {
            const trainingPlan = await generateTrainingPlan({
                coachFeedback: player.coachFeedback,
                position: player.position,
            });
            updatePlayer(player.id, { trainingPlan });
            toast({
                title: 'Training Plan Generated!',
                description: 'Your new training plan is ready to view.'
            });
        } catch (error) {
            console.error("Failed to generate training plan:", error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'There was an error creating your training plan. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Tabs defaultValue="skill-assessment" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="skill-assessment" className="whitespace-normal h-auto">Skill Assessment</TabsTrigger>
                <TabsTrigger value="coach-feedback" className="whitespace-normal h-auto">Coach Feedback</TabsTrigger>
                <TabsTrigger value="training-plan" className="whitespace-normal h-auto">Training Plan</TabsTrigger>
            </TabsList>
            <TabsContent value="skill-assessment">
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Assessment</CardTitle>
                    <CardDescription>Aggregated from coach feedback.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {player.coachFeedback ? (
                        <>
                            <Suspense fallback={<Skeleton className="w-full h-[450px]" />}>
                                <PlayerSkillChart feedback={player.coachFeedback} />
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
            <TabsContent value="training-plan">
                 <Card>
                    <CardHeader>
                        <CardTitle>Your AI-Powered Training Plan</CardTitle>
                        <CardDescription>Generated from coach feedback to provide actionable steps for improvement.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!player.trainingPlan ? (
                             <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">Click the button to generate a new training plan based on your latest feedback.</p>
                                <Button onClick={handleGeneratePlan} disabled={isLoading || isDemo}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Training Plan'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Actionable Steps</h4>
                                    <ul className="space-y-4">
                                    {player.trainingPlan.actionableSteps.map((step, index) => (
                                        <li key={index} className="p-4 border rounded-md bg-muted/50">
                                            <p className="font-semibold">{step.title}</p>
                                            <p className="text-sm text-muted-foreground">{step.description}</p>
                                        </li>
                                    ))}
                                    </ul>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Suggested Videos</h4>
                                    <ul className="space-y-2">
                                        {player.trainingPlan.suggestedVideos.map((video, index) => (
                                            <li key={index}>
                                                <Link href={video.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                                                   <Youtube className="w-4 h-4 text-red-500" />
                                                   <span>{video.title}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Separator />
                                 <Button onClick={handleGeneratePlan} disabled={isLoading || isDemo} variant="outline" className="w-full">
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Regenerate Training Plan'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
