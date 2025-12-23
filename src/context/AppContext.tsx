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
    },
    {
        id: 'mock-player-2',
        name: 'Jamie Tree',
        position: 'Setter',
        height: "5'9\"",
        gradYear: '2027',
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
        coachFeedback: `
### Coach A Assessment:
Jamie has fantastic hands and a natural feel for the game. Her hitter background is obvious in her smart set choices. To elevate her game for the collegiate level, we need to focus on consistent footwork to get her body in position for every set, not just the perfect passes. I'd rate her skills as:
- Setting Technique: 8/10
- Footwork: 6/10
- Decision Making: 8/10
- Defense: 7/10
- Serving: 6/10

### Coach B Assessment:
A very promising setter. Her ability to transition from defense to setting is a major plus. I agree that her footwork is the primary area for improvement. I'd also like to see her develop a more varied serving arsenal—a tough float or a targeted jump-float would make her an even bigger threat. Her positive attitude is a huge plus. My ratings:
- Setting Technique: 8/10
- Footwork: 7/10
- Decision Making: 9/10
- Defense: 8/10
- Serving: 5/10

### Coach C Assessment:
Great potential. The raw skills are all there. Her hands are soft, and she has the court awareness you can't teach. The transition from OH is a great story and shows her versatility. The focus should be on repetition and discipline in her footwork patterns. Her serve is consistent but lacks pressure. With some work, she can be a cornerstone player for a strong D3 program.
- Setting Technique: 9/10
- Footwork: 6/10
- Decision Making: 8/10
- Defense: 7/10
- Serving: 6/10

### Combined Feedback Overview:
All coaches agree that Jamie has excellent hands, court awareness, and decision-making abilities, making her a high-potential D3 setter. Her background as an Outside Hitter is seen as a significant advantage, contributing to her strong defensive skills and offensive mindset. The consensus area for improvement is her footwork consistency and the development of a more aggressive, threatening serve.
        `
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
