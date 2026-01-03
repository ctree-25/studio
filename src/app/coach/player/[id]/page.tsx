'use client';

import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BarChart2, Calendar, MapPin, Ruler } from 'lucide-react';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

const SKILLS = ['Setting Technique', 'Footwork', 'Decision Making', 'Defense', 'Serving'];

function PlayerAssessmentPage({ playerId }: { playerId: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const playerProfileRef = useMemoFirebase(() => {
    if (!firestore || !playerId) return null;
    return doc(firestore, 'playerProfiles', playerId);
  }, [firestore, playerId]);

  const { data: player, isLoading: isPlayerLoading } = useDoc(playerProfileRef);

  const [feedback, setFeedback] = useState('');
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>(() =>
    SKILLS.reduce((acc, skill) => ({ ...acc, [skill]: 5 }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSliderChange = (skill: string, value: number[]) => {
    setSkillRatings(prev => ({ ...prev, [skill]: value[0] }));
  };

  const handleSubmit = async () => {
    if (!user || !player) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in and viewing a player to submit feedback.',
      });
      return;
    }

    setIsSubmitting(true);
    toast({
      title: 'Submitting Feedback...',
      description: `Your feedback for ${player.name} is being saved.`,
    });

    const skillRatingsText = SKILLS.map(skill => `- ${skill}: ${skillRatings[skill]}/10`).join('\n');
    const fullFeedbackText = `Assessment:\n${feedback}\n\nSkill Ratings:\n${skillRatingsText}`;

    const feedbackData = {
        coachId: user.uid,
        playerId: player.id,
        feedback: fullFeedbackText,
        date: serverTimestamp(),
        skillRatings: skillRatings,
    };

    try {
      const feedbackCollectionRef = collection(firestore, 'coachFeedback');
      await addDoc(feedbackCollectionRef, feedbackData);

      toast({
        title: 'Feedback Submitted',
        description: `Your feedback for ${player.name} has been saved.`,
      });
      router.push('/coach');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was an error submitting your feedback. Please try again.',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isPlayerLoading) {
    return (
      <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
              <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                      <Skeleton className="h-56 w-full" />
                      <Skeleton className="h-72 w-full" />
                  </div>
                  <div className="space-y-8">
                      <Skeleton className="h-96 w-full" />
                  </div>
              </div>
          </div>
      </main>
    );
  }

  if (!player) {
    notFound();
  }

  return (
    <main className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <Link href="/coach" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <Card>
                <CardHeader className='flex-row items-center gap-4'>
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={player.profilePictureUrl} data-ai-hint="volleyball player" />
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl font-headline">{player.name}</CardTitle>
                    <CardDescription>{player.position}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center"><Ruler className="w-4 h-4 mr-2 text-muted-foreground" /> Height: {player.height}</div>
                  <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-muted-foreground" /> Grad Year: {player.gradYear}</div>
                  <div className="flex items-center"><BarChart2 className="w-4 h-4 mr-2 text-muted-foreground" /> Target Level: {player.targetLevel}</div>
                  <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-muted-foreground" /> Target Schools: {player.preferredSchools}</div>
                </CardContent>
              </Card>

              {player.highlightVideoUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle>Highlight Footage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <video
                      controls
                      src={player.highlightVideoUrl}
                      className="w-full rounded-lg"
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Your Feedback</CardTitle>
                  <CardDescription>Provide your assessment for the player. Your feedback will be saved as a new evaluation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 pt-4">
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide your constructive feedback here..."
                      rows={5}
                      className="resize-y"
                    />
                    <div className="space-y-6">
                      <h4 className="font-semibold">Skill Ratings</h4>
                      {SKILLS.map(skill => (
                        <div key={skill} className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor={`slider-${skill}`}>{skill}</Label>
                            <span className="text-sm font-medium text-primary w-8 text-center">{skillRatings[skill]}</span>
                          </div>
                          <Slider
                            id={`slider-${skill}`}
                            min={1}
                            max={10}
                            step={1}
                            value={[skillRatings[skill]]}
                            onValueChange={(value) => handleSliderChange(skill, value)}
                          />
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !feedback} className="w-full">
                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
  );
}

export default function PlayerReviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <PlayerAssessmentPage playerId={params.id} />
    </div>
  );
}
