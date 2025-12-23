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
  highlightVideo: File | null;
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
  addPlayer: (player: Omit<PlayerProfile, 'id' | 'submitted' | 'aiAnalysis' | 'coachFeedback' | 'highlightVideoUrl' | 'videoDataUri' | 'profilePictureUrl'>) => PlayerProfile;
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
        highlightVideo: null,
        highlightVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4',
        targetLevel: 'D3',
        preferredSchools: 'Tufts, MIT, Williams',
        submitted: true,
        aiAnalysis: {
            strengths: 'Exceptional hands and clean delivery. Reads blockers well and makes smart decisions under pressure. Background as an Outside Hitter gives her an offensive mindset and strong defensive skills.',
            weaknesses: 'Footwork to the ball can be inconsistent, especially on out-of-system plays. Serve could be more aggressive to put opponents on the defensive.',
            overallAssessment: 'A high-potential D3 setter with a great foundation. Her experience as a hitter is a significant asset. With refined footwork and a more aggressive serve, she could become a top-tier setter at the D3 level. Her coachability and on-court leadership are evident.'
        },
        coachFeedback: `Coach Assessment:
Jamie has fantastic hands and a natural feel for the game. Her hitter background is obvious in her smart set choices. To elevate her game for the collegiate level, we need to focus on consistent footwork to get her body in position for every set, not just the perfect passes. I'd rate her skills as:
- Setting Technique: 8/10
- Footwork: 6/10
- Decision Making: 8/10
- Defense: 7/10
- Serving: 6/10`
    }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<PlayerProfile[]>(MOCK_PLAYERS);

  const addPlayer = (playerData: Omit<PlayerProfile, 'id' | 'submitted' | 'aiAnalysis' | 'coachFeedback' | 'highlightVideoUrl' | 'videoDataUri' | 'profilePictureUrl'>): PlayerProfile => {
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
