'use client';

import { AppHeader } from '@/components/AppHeader';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart2, Calendar, MapPin, Ruler } from 'lucide-react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useState, use } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

const SKILLS = ['Setting Technique', 'Footwork', 'Decision Making', 'Defense', 'Serving'];

export default function PlayerReviewPage({ params }: { params: { id: string } }) {
  const resolvedParams = use(params);
  const { getPlayer, updatePlayer } = useAppContext();
  const player = getPlayer(resolvedParams.id);
  const [feedback, setFeedback] = useState('');
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>(() => 
    SKILLS.reduce((acc, skill) => ({ ...acc, [skill]: 5 }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  if (!player) {
    notFound();
  }

  const isDemoPlayer = player.id.startsWith('mock-');
  const backLink = isDemoPlayer ? '/coach/demo' : '/coach';
  
  const handleSliderChange = (skill: string, value: number[]) => {
    setSkillRatings(prev => ({...prev, [skill]: value[0]}));
  }

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    const skillRatingsText = SKILLS.map(skill => `- ${skill}: ${skillRatings[skill]}/10`).join('\n');
    
    const timestamp = new Date().toLocaleString();
    const newFeedback = `Previous Feedback - ${timestamp}\nAssessment:\n${feedback}\n\nSkill Ratings:\n${skillRatingsText}`;
    
    // In a multi-coach system, this might use '###' to separate reports.
    const updatedFeedback = player.coachFeedback 
        ? `${newFeedback}###${player.coachFeedback}`
        : newFeedback;

    // Simulate API call
    setTimeout(() => {
        updatePlayer(player.id, { coachFeedback: updatedFeedback });
        setIsSubmitting(false);
        setFeedback('');
        setSkillRatings(SKILLS.reduce((acc, skill) => ({ ...acc, [skill]: 5 }), {}));

        toast({
            title: 'Feedback Submitted',
            description: `Your feedback for ${player.name} has been saved.`
        });
        router.push(backLink);
    }, 1000);
  }

  // Show just the first feedback entry for the coach's own review
  const coachAssessments = player.coachFeedback?.split('###').filter(s => s.trim() !== '');

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <Link href={backLink} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
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
                <CardContent className="space-y-4">
                    <div className="flex items-center"><Ruler className="w-4 h-4 mr-2 text-muted-foreground"/> Height: {player.height}</div>
                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-muted-foreground"/> Grad Year: {player.gradYear}</div>
                    <div className="flex items-center"><BarChart2 className="w-4 h-4 mr-2 text-muted-foreground"/> Target Level: {player.targetLevel}</div>
                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-muted-foreground"/> Target Schools: {player.preferredSchools}</div>
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
                    <CardDescription>Provide your assessment for the player. Your feedback will be added to the player's profile for them to review.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {coachAssessments && coachAssessments.length > 0 && (
                        <div className="p-4 border rounded-md bg-muted/50 max-h-60 overflow-y-auto space-y-4">
                            {coachAssessments.map((assessment, index) => {
                                const lines = assessment.split('\n');
                                const heading = lines[0];
                                const body = lines.slice(1).join('\n');
                                return (
                                     <div key={index}>
                                        <h4 className='font-semibold mb-2'>{heading}</h4>
                                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                            {body}
                                        </p>
                                     </div>
                                )
                            })}
                        </div>
                      )}
                      
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
    </div>
  );
}
