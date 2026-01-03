
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoc, useFirestore, useUser, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { getDoc, doc as firestoreDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BarChart2, Calendar, MapPin, Ruler } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppContext } from '@/context/AppContext';

const SKILLS_BY_POSITION: Record<string, string[]> = {
    'Setter': ['Setting Technique', 'Footwork', 'Decision Making', 'Defense', 'Serving'],
    'Outside Hitter': ['Attacking', 'Passing / Serve Receive', 'Defense', 'Blocking', 'Serving'],
    'Middle Blocker': ['Blocking', 'Attacking', 'Footwork', 'Serving', 'Court Vision'],
    'Libero': ['Passing / Serve Receive', 'Digging', 'Court Awareness', 'Setting (Out of System)', 'Communication'],
    'Defensive Specialist': ['Passing / Serve Receive', 'Digging', 'Court Awareness', 'Setting (Out of System)', 'Communication'],
    'Opposite': ['Attacking', 'Blocking', 'Defense', 'Serving', 'Backup Setting'],
    'Right Side Hitter': ['Attacking', 'Blocking', 'Defense', 'Serving', 'Backup Setting'],
    'Default': ['Overall Technique', 'Athleticism', 'Court Awareness', 'Hustle', 'Teamwork'],
};


interface PlayerAssessmentPageProps {
    playerId: string;
    onBack: () => void;
    isDemo?: boolean;
}

export function PlayerAssessmentPage({ playerId, onBack, isDemo = false }: PlayerAssessmentPageProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { getPlayer } = useAppContext();

  // For demo mode, we get data from context. For live mode, from Firestore.
  const isLive = !isDemo;

  const playerProfileRef = useMemoFirebase(() => {
    if (!firestore || !playerId || !isLive) return null;
    return doc(firestore, 'playerProfiles', playerId);
  }, [firestore, playerId, isLive]);

  const { data: livePlayer, isLoading: isPlayerLoading } = useDoc(playerProfileRef);
  
  const demoPlayer = isDemo ? getPlayer(playerId) : null;
  const player = isDemo ? demoPlayer : livePlayer;

  const [feedback, setFeedback] = useState('');
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const positionSkills = (player?.position && SKILLS_BY_POSITION[player.position]) || SKILLS_BY_POSITION['Default'];
  
  useEffect(() => {
    if (player) {
      const initialRatings = positionSkills.reduce((acc, skill) => ({ ...acc, [skill]: 5 }), {});
      setSkillRatings(initialRatings);
    }
  }, [player, positionSkills]);


  const handleSliderChange = (skill: string, value: number[]) => {
    setSkillRatings(prev => ({ ...prev, [skill]: value[0] }));
  };

  const handleSubmit = async () => {
    if (isDemo) {
        toast({
            title: 'Demo Mode',
            description: 'Feedback submission is disabled in demo mode.',
        });
        return;
    }

    if (!user || !player || !playerProfileRef) {
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

    const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

    const skillRatingsText = positionSkills.map(skill => `- ${skill}: ${skillRatings[skill]}/10`).join('\n');
    const newFeedbackEntry = `Assessment - ${timestamp}\nAssessment:\n${feedback}\n${skillRatingsText}`;

    try {
        const playerDoc = await getDoc(playerProfileRef);
        if (playerDoc.exists()) {
            const existingFeedback = playerDoc.data().coachFeedback || '';
            const updatedFeedback = existingFeedback ? `${existingFeedback}\n###\n${newFeedbackEntry}` : newFeedbackEntry;

            updateDocumentNonBlocking(playerProfileRef, {
                coachFeedback: updatedFeedback
            });

            toast({
                title: 'Feedback Submitted',
                description: `Your feedback for ${player.name} has been saved.`,
            });
            onBack();
        } else {
            throw new Error("Player profile not found");
        }
    } catch (error) {
      // This catch block will now primarily handle application-level errors,
      // like the profile not being found. Permission errors are handled by the non-blocking update function.
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

  if (isPlayerLoading && isLive) {
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
    return (
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                 <div className="mb-4">
                    <Button variant="ghost" onClick={onBack} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                    </Button>
                </div>
                <p>Player profile could not be loaded.</p>
            </div>
        </main>
    )
  }

  return (
    <main className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
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
                 <fieldset disabled={isDemo}>
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
                      {positionSkills.map(skill => (
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
                            value={[skillRatings[skill] || 5]}
                            onValueChange={(value) => handleSliderChange(skill, value)}
                          />
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !feedback || isDemo} className="w-full">
                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </div>
                  </fieldset>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
  );
}
