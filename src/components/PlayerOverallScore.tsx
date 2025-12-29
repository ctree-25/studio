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
    D1: { min: 8.5, max: 10, label: "D1 Ready" },
    D2: { min: 7.0, max: 8.4, label: "D2 Ready" },
    D3: { min: 5.5, max: 6.9, label: "D3 Ready" },
    default: {min: 0, max: 5.4, label: "Needs Development"}
};

const getLevelForScore = (score: number) => {
    if (score >= LEVEL_TARGETS.D1.min) return LEVEL_TARGETS.D1;
    if (score >= LEVEL_TARGETS.D2.min) return LEVEL_TARGETS.D2;
    if (score >= LEVEL_TARGETS.D3.min) return LEVEL_TARGETS.D3;
    return LEVEL_TARGETS.default;
}

export function PlayerOverallScore({ score, targetLevel }: { score: number, targetLevel: 'D1' | 'D2' | 'D3' }) {
  const chartData = [{ name: 'score', value: score, fill: "hsl(var(--primary))" }];
  const currentLevel = getLevelForScore(score);
  const target = LEVEL_TARGETS[targetLevel];

  const scoreDifference = (score - target.min).toFixed(1);
  const isMeetingTarget = score >= target.min;

  return (
    <Card className="flex flex-col items-center justify-center h-full">
        <CardHeader className="items-center pb-2">
            <CardTitle>Overall Readiness</CardTitle>
            <CardDescription>Score vs. {targetLevel} Target</CardDescription>
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
            <p className="text-lg font-semibold">{currentLevel.label}</p>
            <p className={`text-sm ${isMeetingTarget ? 'text-green-500' : 'text-orange-500'}`}>
                {isMeetingTarget ? `+${scoreDifference}` : scoreDifference} points {isMeetingTarget ? 'above' : 'below'} {targetLevel} target
            </p>
        </div>
    </Card>
  );
}
    