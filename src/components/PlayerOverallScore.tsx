'use client';

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const LEVEL_TARGETS = {
    D1: { threshold: 8.5, label: "D1 Target" },
    D2: { threshold: 7.0, label: "D2 Target" },
    D3: { threshold: 5.5, label: "D3 Target" },
};

const getReadiness = (score: number, targetLevel: 'D1' | 'D2' | 'D3') => {
    const target = LEVEL_TARGETS[targetLevel];
    const difference = score - target.threshold;

    if (difference >= 0) {
        return { label: `Meeting ${targetLevel} Target`, color: 'text-green-500' };
    } else if (difference >= -1.5) {
        return { label: `Approaching ${targetLevel} Target`, color: 'text-orange-500' };
    } else {
        return { label: "Needs Development", color: 'text-red-500' };
    }
}

export function PlayerOverallScore({ score, targetLevel }: { score: number, targetLevel: 'D1' | 'D2' | 'D3' }) {
  const chartData = [{ name: 'score', value: score, fill: "hsl(var(--primary))" }];
  const readiness = getReadiness(score, targetLevel);
  
  return (
    <Card className="flex flex-col items-center justify-center h-full">
        <CardHeader className="items-center pb-2">
            <CardTitle>Overall Readiness</CardTitle>
            <CardDescription>Current Score vs. {targetLevel} Target</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-0">
            <ChartContainer
                config={{}}
                className="mx-auto aspect-square w-full max-w-[250px]"
            >
                <RadialBarChart
                    data={chartData}
                    startAngle={-270}
                    endAngle={90}
                    innerRadius="70%"
                    outerRadius="100%"
                    barSize={20}
                >
                    <PolarAngleAxis
                        type="number"
                        domain={[0, 10]}
                        angleAxisId={0}
                        tick={false}
                    />
                    <RadialBar
                        background={{ fill: "hsl(var(--muted))" }}
                        dataKey="value"
                        cornerRadius={10}
                    />
                     <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                </RadialBarChart>
            </ChartContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-4xl font-bold font-headline">{score.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
        </CardContent>
        <div className="p-4 text-center">
            <p className={`text-lg font-semibold ${readiness.color}`}>{readiness.label}</p>
            <p className="text-sm text-muted-foreground">
                Target for {targetLevel} is {LEVEL_TARGETS[targetLevel].threshold}+
            </p>
        </div>
    </Card>
  );
}
    