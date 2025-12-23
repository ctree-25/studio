'use client';

import type { AnalyzePlayerFootageOutput } from '@/ai/flows/analyze-player-footage';
import { type ReactNode, createContext, useContext, useState } from 'react';

export type PlayerProfile = {
  id: string;
  name: string;
  position: string;
  height: string;
  gradYear: string;
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
  addPlayer: (player: Omit<PlayerProfile, 'id' | 'submitted' | 'aiAnalysis' | 'coachFeedback' | 'highlightVideoUrl' | 'videoDataUri'>) => PlayerProfile;
  updatePlayer: (playerId: string, updates: Partial<PlayerProfile>) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Some mock data to make the coach view interesting from the start
const MOCK_PLAYERS: PlayerProfile[] = [
    {
        id: 'mock-player-1',
        name: 'Alex Morgan',
        position: 'Outside Hitter',
        height: "6'1\"",
        gradYear: '2025',
        highlightVideo: null,
        highlightVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        targetLevel: 'D1',
        preferredSchools: 'Stanford, UCLA',
        submitted: true,
        aiAnalysis: {
            strengths: 'Powerful arm swing, excellent court vision, and high volleyball IQ. Strong jump serve with consistent accuracy.',
            weaknesses: 'Defensive transitions could be quicker. Occasionally predictable with shot selection in high-pressure situations.',
            overallAssessment: 'A top-tier D1 prospect with the potential to be an immediate impact player. Physicality and offensive skills are college-ready. Focusing on defensive speed and diversifying attack patterns will make them an all-around threat.'
        },
        coachFeedback: "Alex shows exceptional talent and has a very high ceiling. The AI analysis is spot on. I'd add that improving block timing against faster offenses will be crucial at the D1 level. We're definitely keeping an eye on them."
    }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<PlayerProfile[]>(MOCK_PLAYERS);

  const addPlayer = (playerData: Omit<PlayerProfile, 'id' | 'submitted' | 'aiAnalysis' | 'coachFeedback' | 'highlightVideoUrl' | 'videoDataUri'>): PlayerProfile => {
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
  }

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
