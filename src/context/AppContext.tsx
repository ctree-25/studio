'use client';

import type { AnalyzePlayerFootageOutput } from '@/ai/flows/analyze-player-footage';
import { type ReactNode, createContext, useContext, useState } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const playerAvatar = PlaceHolderImages.find(p => p.id === 'player-avatar');

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
  coachFeedback?: string;
  submitted: boolean;
};

type AppContextType = {
  players: PlayerProfile[];
  getPlayer: (id: string) => PlayerProfile | undefined;
  addPlayer: (player: Omit<PlayerProfile, 'id' | 'submitted' | 'aiAnalysis' | 'coachFeedback' | 'videoDataUri'>) => PlayerProfile;
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
        coachFeedback: `Coach Assessment:
Jamie has fantastic hands and a natural feel for the game. Her hitter background is obvious in her smart set choices. To elevate her game for the collegiate level, we need to focus on consistent footwork to get her body in position for every set, not just the perfect passes.
- Setting Technique: 8/10
- Footwork: 6/10
- Decision Making: 8/10
- Defense: 7/10
- Serving: 6/10
###
Coach Assessment:
Shows great potential. Her athleticism stands out, and she has a high volleyball IQ. I'd like to see her work on the speed of her sets to the pins and develop a more deceptive dump shot. Her defensive hustle is top-notch.
- Setting Technique: 7/10
- Footwork: 7/10
- Decision Making: 9/10
- Defense: 8/10
- Serving: 7/10
###
Coach Assessment:
A solid all-around player with a strong foundation. Her serves are consistent but could be more aggressive. She has good court awareness and communicates well with her hitters. Improving her blocking footwork would make her a more formidable presence at the net.
- Setting Technique: 9/10
- Footwork: 8/10
- Decision Making: 7/10
- Defense: 6/10
- Serving: 7/10`
    }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<PlayerProfile[]>(MOCK_PLAYERS);

  const addPlayer = (playerData: Omit<PlayerProfile, 'id' | 'submitted' | 'aiAnalysis' | 'coachFeedback' | 'videoDataUri'>): PlayerProfile => {
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
