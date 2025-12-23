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
import { useState, use, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PlayerSkillChart } from '@/components/PlayerSkillChart';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlayerReviewPage({ params }: { params: { id: string } }) {
  const resolvedParams = use(params);
  const { getPlayer, updatePlayer } = useAppContext();
  const player = getPlayer(resolvedParams.id);
  const [feedback, setFeedback] = useState(player?.coachFeedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  if (!player) {
    notFound();
  }
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        updatePlayer(player.id, { coachFeedback: feedback });
        setIsSubmitting(false);
        toast({
            title: 'Feedback Submitted',
            description: `Your feedback for ${player.name} has been saved.`
        });
        router.push('/coach');
    }, 1000);
  }

  const coachAssessments = player.coachFeedback?.split('###').filter(s => s.trim() !== '').map(s => s.trim());

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
               {player.id === 'mock-player-2' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Assessment</CardTitle>
                    <CardDescription>Aggregated from coach feedback.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
                      <PlayerSkillChart feedback={player.coachFeedback} />
                    </Suspense>
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

              {coachAssessments && coachAssessments.length > 1 ? (
                 <Card>
                    <CardHeader>
                        <CardTitle>Coach Assessments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {coachAssessments.map((assessment, index) => (
                           <div key={index}>
                             <p className="whitespace-pre-wrap text-muted-foreground">{assessment.replace(/(\w+ Assessment:)/, '<strong class="text-primary">$1</strong>').split('\n').map((line, i) => <span key={i} dangerouslySetInnerHTML={{__html: line.replace(/- (\w+ \w+): (\d+\/\d+)/, '- <strong>$1:</strong> $2')}}><br/></span>)}</p>
                             {index < coachAssessments.length - 1 && <Separator className="my-4" />}
                           </div>
                        ))}
                    </CardContent>
                 </Card>
              ) : (
                <Card>
                    <CardHeader>
                    <CardTitle>Your Feedback</CardTitle>
                    <CardDescription>Provide your assessment for the player.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <Textarea 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide your constructive feedback here..." 
                        rows={8}
                        className="resize-y"
                    />
                    <Button onClick={handleSubmit} disabled={isSubmitting || !feedback} className="w-full">
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                    </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
