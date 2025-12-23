'use client';

import { AppHeader } from '@/components/AppHeader';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BarChart2, Calendar, MapPin, Ruler } from 'lucide-react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useState, use } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

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
  
  const handleSliderChange = (skill: string, value: number[]) => {
    setSkillRatings(prev => ({...prev, [skill]: value[0]}));
  }

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    const skillRatingsText = SKILLS.map(skill => `- ${skill}: ${skillRatings[skill]}/10`).join('\n');
    const fullFeedback = `Coach Assessment:\n${feedback}\n${skillRatingsText}`;

    // Simulate API call
    setTimeout(() => {
        // In a real app, this would likely append feedback, not just replace it.
        updatePlayer(player.id, { coachFeedback: fullFeedback });
        setIsSubmitting(false);
        toast({
            title: 'Feedback Submitted',
            description: `Your feedback for ${player.name} has been saved.`
        });
        router.push('/coach');
    }, 1000);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
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
                <CardHeader>
                  <CardTitle className="text-2xl font-headline">{player.name}</CardTitle>
                  <CardDescription>{player.position}</CardDescription>
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
              {player.aiAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Powered Analysis</CardTitle>
                    <CardDescription>Generated from player's footage.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-primary">Strengths</h4>
                      <p className="text-muted-foreground">{player.aiAnalysis.strengths}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-primary">Areas for Improvement</h4>
                      <p className="text-muted-foreground">{player.aiAnalysis.weaknesses}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-primary">Overall Assessment</h4>
                      <p className="text-muted-foreground">{player.aiAnalysis.overallAssessment}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
                <Card>
                    <CardHeader>
                    <CardTitle>Your Feedback</CardTitle>
                    <CardDescription>Provide your assessment for the player. Your previous feedback is shown for context, but submitting new feedback will overwrite it.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {player.coachFeedback && (
                        <div className="p-4 border rounded-md bg-muted/50">
                            <h4 className='font-semibold mb-2'>Previous Feedback</h4>
                            <p
                            className="whitespace-pre-wrap text-muted-foreground"
                            dangerouslySetInnerHTML={{
                                __html: player.coachFeedback
                                    .replace(/(\w+ Assessment:)/g, '<strong class="text-primary">$1</strong>')
                                    .replace(/- ([\w\s]+): (\d+\/10)/g, '- <strong>$1:</strong> $2')
                            }}
                            />
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
