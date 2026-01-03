
'use client';

import type { AnalyzePlayerFootageOutput } from '@/ai/flows/analyze-player-footage';
import { type GenerateTrainingPlanOutput } from '@/ai/flows/generate-training-plan';
import { type ReactNode, createContext, useContext, useState } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const playerAvatar = PlaceHolderImages.find(p => p.id === 'player-avatar');

export interface Assessment {
    coachId: string;
    feedbackText: string;
    skillRatings: Record<string, number>;
    timestamp: string;
}

export type PlayerProfile = {
  id: string;
  name: string;
  position: string;
  height: string;
  gradYear: string;
  profilePictureUrl?: string;
  highlightVideoUrl?: string;
  videoDataUri?: string;
  targetLevel: 'D1' | 'D2' | 'D3';
  preferredSchools: string;
  aiAnalysis?: AnalyzePlayerFootageOutput;
  coachFeedback?: string; // DEPRECATED
  assessments?: Assessment[];
  trainingPlan?: GenerateTrainingPlanOutput;
  submitted: boolean;
};

type AppContextType = {
  players: PlayerProfile[];
  getPlayer: (id: string) => PlayerProfile | undefined;
  addPlayer: (player: Omit<PlayerProfile, 'id' | 'submitted' | 'aiAnalysis' | 'coachFeedback' | 'videoDataUri' | 'trainingPlan'>) => PlayerProfile;
  updatePlayer: (playerId: string, updates: Partial<PlayerProfile>) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Some mock data to make the coach view interesting from the start
const MOCK_PLAYERS: PlayerProfile[] = [
    {
        id: 'mock-player-2',
        name: 'Jamie Tree',
        position: 'Setter',
        height: "5'9\"",
        gradYear: '2027',
        profilePictureUrl: playerAvatar?.imageUrl,
        highlightVideoUrl: 'https://www.youtube.com/watch?v=example',
        targetLevel: 'D3',
        preferredSchools: 'Tufts, MIT, Williams',
        submitted: true,
        aiAnalysis: {
            strengths: 'Exceptional hands and clean delivery. Reads blockers well and makes smart decisions under pressure. Background as an Outside Hitter gives her an offensive mindset and strong defensive skills.',
            weaknesses: 'Footwork to the ball can be inconsistent, especially on out-of-system plays. Serve could be more aggressive to put opponents on the defensive.',
            overallAssessment: 'A high-potential D3 setter with a great foundation. Her experience as a hitter is a significant asset. With refined footwork and a more aggressive serve, she could become a top-tier setter at the D3 level. Her coachability and on-court leadership are evident.'
        },
        assessments: [
            {
                coachId: 'coach-1',
                timestamp: '2024-07-15T10:00:00Z',
                feedbackText: 'Jamie has fantastic hands and a natural feel for the game. Her hitter background is obvious in her smart set choices. To elevate her game for the collegiate level, we need to focus on consistent footwork to get her body in position for every set, not just the perfect passes.',
                skillRatings: { 'Setting Technique': 8, 'Footwork': 6, 'Decision Making': 8, 'Defense': 7, 'Serving': 6 },
            },
            {
                coachId: 'coach-2',
                timestamp: '2024-07-14T15:30:00Z',
                feedbackText: "Shows great potential. Her athleticism stands out, and she has a high volleyball IQ. I'd like to see her work on the speed of her sets to the pins and develop a more deceptive dump shot. Her defensive hustle is top-notch.",
                skillRatings: { 'Setting Technique': 7, 'Footwork': 7, 'Decision Making': 9, 'Defense': 8, 'Serving': 7 },
            },
            {
                coachId: 'coach-3',
                timestamp: '2024-07-12T09:00:00Z',
                feedbackText: 'A solid all-around player with a strong foundation. Her serves are consistent but could be more aggressive. She has good court awareness and communicates well with her hitters. Improving her blocking footwork would make her a more formidable presence at the net.',
                skillRatings: { 'Setting Technique': 9, 'Footwork': 8, 'Decision Making': 7, 'Defense': 6, 'Serving': 7 },
            }
        ],
        trainingPlan: {
          actionableSteps: [
            {
              title: "Improve Footwork Consistency",
              description: "Focus on drills that simulate out-of-system plays. Practice moving to the ball from different court positions to ensure you are balanced and stable before setting."
            },
            {
              title: "Develop an Aggressive Serve",
              description: "Work on a consistent, powerful float serve or a topspin jump serve. Aim for specific zones on the court to put the opposing team's passers under pressure."
            },
            {
              title: "Increase Set Tempo",
              description: "Practice quick-tempo sets to the pins to speed up your offense. Use a metronome or have a coach give you a rhythm to follow during drills."
            }
          ],
          suggestedVideos: [
            {
              title: "Setter Footwork Patterns - The Art of Coaching Volleyball",
              url: "https://youtu.be/EXsMFJa-AEM?si=aE3i_fn0Ax0Y3uNn"
            },
            {
              title: "How to Jump Float Serve - Elevate Yourself",
              url: "https://youtu.be/TX8a7nWlbiw?si=1ePgjHE3SiUDStdp"
            },
            {
              title: "How To Set With Tempo in Volleyball | Set 3% Faster",
              url: "https://youtu.be/Uiv4rJZ6qtA?si=wDk5RPPAUBYWF73_"
            }
          ]
        }
    }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<PlayerProfile[]>(MOCK_PLAYERS);

  const addPlayer = (playerData: Omit<PlayerProfile, 'id' | 'submitted' | 'aiAnalysis' | 'coachFeedback' | 'videoDataUri' | 'trainingPlan'>): PlayerProfile => {
    const newPlayer: PlayerProfile = {
        ...playerData,
        id: `player-${Date.now()}`,
        submitted: false,
    };
    setPlayers(prev => [newPlayer, ...prev]);
    return newPlayer;
  };

  const getPlayer = (id: string) => {
    return players.find(p => p.id === id);
  };

  const updatePlayer = (playerId: string, updates: Partial<PlayerProfile>) => {
    setPlayers(prev => prev.map(p => (p.id === playerId ? { ...p, ...updates } : p)));
  };

  return (
    <AppContext.Provider value={{ players, getPlayer, addPlayer, updatePlayer }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
