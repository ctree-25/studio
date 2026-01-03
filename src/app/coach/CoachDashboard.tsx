
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Dot, User, MapPin, BarChart2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface CoachDashboardProps {
  onSelectPlayer: (playerId: string) => void;
}

export function CoachDashboard({ onSelectPlayer }: CoachDashboardProps) {
  const firestore = useFirestore();
  
  const playerProfilesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'playerProfiles'), where('submitted', '==', true));
  }, [firestore]);

  const { data: players, isLoading } = useCollection(playerProfilesQuery);

  return (
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline">Coach Dashboard</h1>
            <p className="text-muted-foreground">Review player profiles and provide evaluations.</p>
          </div>

          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                        <div className="p-6 pt-0">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </Card>
                ))}
            </div>
          ) : !players || players.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No player profiles submitted</h3>
                <p className="mt-1 text-sm text-muted-foreground">Check back later to find new players to evaluate.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player: any) => (
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
                         <div className={`flex items-center text-xs px-2 py-1 rounded-full self-start ${player.assessments && player.assessments.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {player.assessments && player.assessments.length > 0 ? <CheckCircle className="w-3 h-3 mr-1"/> : <Clock className="w-3 h-3 mr-1"/>}
                            {player.assessments && player.assessments.length > 0 ? 'Reviewed' : 'Pending'}
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
                    <Button onClick={() => onSelectPlayer(player.id)} className="w-full">
                        Review Profile
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
  );
}
