
'use client';

import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlayerSkillChart } from "@/components/PlayerSkillChart";
import { Suspense, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PlayerProfile, Assessment } from "@/context/AppContext";
import { generateTrainingPlan, GenerateTrainingPlanOutput } from "@/ai/flows/generate-training-plan";
import { Button } from "@/components/ui/button";
import { Loader2, Star, Youtube, Info } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlayerOverallScore } from "@/components/PlayerOverallScore";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

const extractAverageSkillData = (assessments: Assessment[]) => {
    if (!assessments || assessments.length === 0) return [];

    const skillTotals: { [key: string]: { total: number, count: number } } = {};

    assessments.forEach(assessment => {
        for (const [skill, rating] of Object.entries(assessment.skillRatings)) {
            if (!skillTotals[skill]) {
                skillTotals[skill] = { total: 0, count: 0 };
            }
            skillTotals[skill].total += rating;
            skillTotals[skill].count += 1;
        }
    });

    return Object.entries(skillTotals).map(([skill, { total, count }]) => ({
        skill,
        average: parseFloat((total / count).toFixed(1)),
    }));
};

const mockCoachDetails = [
    {
        level: 'College (D1)',
        experience: '10+ years',
        placedLevel: 'NCAA Division I, Professional',
        rating: 5
    },
    {
        level: 'Club',
        experience: '6-10 years',
        placedLevel: 'NCAA Division II, NCAA Division III',
        rating: 4
    },
    {
        level: 'HS Varsity',
        experience: '3-5 years',
        placedLevel: 'NCAA Division III, NAIA',
        rating: 5
    }
]

const getRatingColor = (rating: number) => {
    if (rating >= 9) return 'text-green-400';
    if (rating >= 7) return 'text-sky-400';
    return 'text-orange-400';
}

const getRatingBarClassName = (rating: number) => {
    if (rating >= 9) return '[&>div]:bg-green-400';
    if (rating >= 7) return '[&>div]:bg-sky-400';
    return '[&>div]:bg-orange-400';
}

export function PlayerFeedbackView({ player, isDemo = false }: { player: PlayerProfile | undefined, isDemo?: boolean }) {
    const { updatePlayer, getPlayer } = useAppContext();
    const firestore = useFirestore();
    const [isLoading, setIsLoading] = useState(false);
    const [replies, setReplies] = useState<Record<number, string>>({});
    const { toast } = useToast();
    const [liveAssessments, setLiveAssessments] = useState<Assessment[]>([]);

    const assessmentsQuery = useMemoFirebase(() => {
        if (!firestore || !player || isDemo) return null;
        return query(collection(firestore, 'assessments'), where('playerId', '==', player.id));
    }, [firestore, player, isDemo]);

    const { data: fetchedAssessments, isLoading: isLoadingAssessments } = useCollection<Assessment>(assessmentsQuery);

    useEffect(() => {
        if (fetchedAssessments) {
            setLiveAssessments(fetchedAssessments as Assessment[]);
        }
    }, [fetchedAssessments]);
    
    // For the demo view, we pull the mock player from the context which has assessments.
    const demoPlayer = isDemo ? getPlayer('mock-player-2') : null;

    const handleReplyChange = (index: number, text: string) => {
        setReplies(prev => ({...prev, [index]: text}));
    }

    const handleReplySubmit = (index: number) => {
        toast({
            title: "Reply Sent!",
            description: `Your message has been sent to Coach #${index + 1}.`,
        });
        setReplies(prev => ({...prev, [index]: ''}));
    }

    if (!player) {
        return (
            <div className="text-center text-muted-foreground py-8">
                <p>Player profile not found. Create your profile to receive feedback from coaches.</p>
            </div>
        );
    }
    
    const coachAssessments = isDemo ? (demoPlayer?.assessments || []) : liveAssessments;
    const currentTrainingPlan = isDemo ? demoPlayer?.trainingPlan : player.trainingPlan;

    const averageSkillData = extractAverageSkillData(coachAssessments);
    const overallScore = averageSkillData.length > 0
        ? averageSkillData.reduce((sum, { average }) => sum + average, 0) / averageSkillData.length
        : 0;
        
    const feedbackForTrainingPlan = coachAssessments.map(a => a.feedbackText).join('\n\n');

    const handleGeneratePlan = async () => {
        if (!feedbackForTrainingPlan) {
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
                coachFeedback: feedbackForTrainingPlan,
                position: player.position,
            });

            if (isDemo) {
                // In demo, we update context state
                updatePlayer('mock-player-2', { trainingPlan });
            } else {
                 updatePlayer(player.id, { trainingPlan });
            }
            
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
                <TabsTrigger value="training-plan" className="whitespace-normal h-auto">Training Tips</TabsTrigger>
            </TabsList>
            <TabsContent value="skill-assessment">
                <div className="space-y-8">
                    {isLoadingAssessments && !isDemo ? <Skeleton className="w-full h-[300px]" /> : coachAssessments.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                                <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
                                    <PlayerOverallScore score={overallScore} targetLevel={player.targetLevel} />
                                </Suspense>
                                <Card className="flex flex-col">
                                    <CardHeader>
                                         <CardTitle className="text-2xl tracking-tight">Average Skill Ratings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col justify-center flex-grow space-y-4">
                                        {averageSkillData.map(({ skill, average }) => (
                                            <div key={skill} className="grid grid-cols-[1fr_2fr_auto] items-center gap-2 md:gap-4">
                                                <span className="text-sm text-muted-foreground truncate">{skill}</span>
                                                <Progress value={average * 10} className={`h-2 ${getRatingBarClassName(average)}`}/>
                                                <span className={`text-sm font-bold ${getRatingColor(average)}`}>{average.toFixed(1)}</span>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Coaches' Evaluations</CardTitle>
                                    <CardDescription>See how each coach rated your skills.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Suspense fallback={<Skeleton className="w-full h-[450px]" />}>
                                        <PlayerSkillChart assessments={coachAssessments} />
                                    </Suspense>
                                </CardContent>
                            </Card>
                         </>
                    ): (
                        <div className="text-center text-muted-foreground py-8">
                            <p>Coaches' feedback pending</p>
                        </div>
                    )}
                  </div>
            </TabsContent>
            <TabsContent value="coach-feedback">
                {isLoadingAssessments && !isDemo ? <Skeleton className="w-full h-[200px]" /> : coachAssessments && coachAssessments.length > 0 ? (
                    <Card>
                        <CardContent className="space-y-6 pt-6">
                            {coachAssessments.map((assessment, index) => {
                                const coach = isDemo ? mockCoachDetails[index % mockCoachDetails.length] : null;
                                const isD1Coach = coach?.level === 'College (D1)';
                                const skillRatingsText = Object.entries(assessment.skillRatings)
                                    .map(([skill, rating]) => `- <strong>${skill}:</strong> ${rating}/10`)
                                    .join('\n');
                                const body = `<strong class="text-primary">Assessment:</strong>\n${assessment.feedbackText}\n\n${skillRatingsText}`;
                                
                                return (
                                <div key={index} className="p-4 border rounded-lg bg-muted/30">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg">Coach #{index + 1}</h4>
                                        </div>
                                        {coach && (
                                            <div className="flex items-center gap-1 mt-2 sm:mt-0">
                                                {Array.from({length: 5}).map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < coach.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/50'}`} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {coach && (
                                        <div className="text-xs text-muted-foreground space-y-1 mb-4">
                                            <p><strong>Experience:</strong> {coach.experience}</p>
                                            <p><strong>Level:</strong> {coach.level}</p>
                                            <p><strong>Placed Athletes At:</strong> {coach.placedLevel}</p>
                                        </div>
                                    )}
                                    <p
                                        className="whitespace-pre-wrap text-muted-foreground"
                                        dangerouslySetInnerHTML={{ __html: body }}
                                    />
                                     <p className="text-xs text-muted-foreground/70 mt-4">{new Date(assessment.timestamp).toLocaleString()}</p>
                                    {isDemo && (
                                        <div className="mt-4 pt-4 border-t border-border">
                                        {isD1Coach ? (
                                            <Alert variant="warning">
                                                <Info className="h-4 w-4" />
                                                <AlertDescription>
                                                    Direct communication with NCAA Division I coaches is restricted by recruiting regulations.
                                                </AlertDescription>
                                            </Alert>
                                        ) : (
                                            <>
                                                <Textarea
                                                    placeholder="Ask a follow-up question..."
                                                    value={replies[index] || ''}
                                                    onChange={(e) => handleReplyChange(index, e.target.value)}
                                                    className="mb-2"
                                                />
                                                <Button 
                                                    onClick={() => handleReplySubmit(index)}
                                                    disabled={!replies[index]}
                                                    size="sm"
                                                >
                                                    Reply
                                                </Button>
                                            </>
                                        )}
                                        </div>
                                    )}
                                </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center text-muted-foreground py-8">
                                <p>No coach feedback yet. Check back later!</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
            <TabsContent value="training-plan">
                 <Card>
                    <CardContent className="pt-6">
                        {!currentTrainingPlan ? (
                             <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">Click the button to generate a new training plan based on your latest feedback.</p>
                                <Button onClick={handleGeneratePlan} disabled={isLoading || coachAssessments.length === 0}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Training Plan'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Actionable Steps</h4>
                                    <ul className="space-y-4">
                                    {currentTrainingPlan.actionableSteps.map((step, index) => (
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
                                        {currentTrainingPlan.suggestedVideos.map((video, index) => (
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
                                 <Button onClick={handleGeneratePlan} disabled={isLoading} variant="outline" className="w-full">
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Generate New Training Tips'}
                                 </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
