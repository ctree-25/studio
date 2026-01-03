
'use client';

import { AppHeader } from '@/components/AppHeader';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Dot, User, MapPin, BarChart2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function CoachDemoDashboard() {
  const { players } = useAppContext();
  const submittedPlayers = players.filter(p => p.submitted);
  const { toast } = useToast();

  const handleReviewClick = () => {
    toast({
      title: "Demo Action",
      description: "In the live app, this would open the player's assessment view.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline">Coach Dashboard</h1>
            <p className="text-muted-foreground">Review player profiles and provide evaluations. This is a demo view.</p>
          </div>

          {submittedPlayers.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No player profiles submitted</h3>
                <p className="mt-1 text-sm text-muted-foreground">Check back later to find new players to evaluate.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submittedPlayers.map((player) => (
                <Card key={player.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={player.profilePictureUrl} data-ai-hint="volleyball player"/>
                            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <CardTitle>{player.name}</CardTitle>
                            <CardDescription className="flex items-center">
                                {player.position} <Dot /> Graduating {player.gradYear}
                            </CardDescription>
                        </div>
                         <div className={`flex items-center text-xs px-2 py-1 rounded-full self-start ${player.coachFeedback ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {player.coachFeedback ? <CheckCircle className="w-3 h-3 mr-1"/> : <Clock className="w-3 h-3 mr-1"/>}
                            {player.coachFeedback ? 'Reviewed' : 'Pending'}
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BarChart2 className="w-4 h-4 mr-2" /> Target Level: {player.targetLevel}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" /> Target Schools: {player.preferredSchools.length > 30 ? player.preferredSchools.substring(0,30) + '...' : player.preferredSchools}
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button className="w-full" onClick={handleReviewClick}>
                        Review Profile
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
