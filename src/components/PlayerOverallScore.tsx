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

const getReadiness = (score: number) => {
    if (score >= 9.0) {
        return { label: 'Exceptional Prospect', color: 'text-green-500' };
    } else if (score >= 7.5) {
        return { label: `Strong Candidate`, color: 'text-sky-500' };
    } else if (score >= 6.0) {
        return { label: 'Developing Player', color: 'text-orange-500' };
    } else {
        return { label: "Needs Improvement", color: 'text-red-500' };
    }
}

export function PlayerOverallScore({ score, targetLevel }: { score: number, targetLevel: 'D1' | 'D2' | 'D3' }) {
  const chartData = [{ name: 'score', value: score, fill: "hsl(var(--primary))" }];
  const readiness = getReadiness(score);
  
  return (
    <Card className="flex flex-col items-center justify-center h-full relative">
        <CardHeader className="items-center pb-2">
            <CardTitle>Overall Readiness</CardTitle>
            <CardDescription>Targeting {targetLevel}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-0 w-full">
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
                        content={<ChartTooltipContent hideLabel name="Overall Score" />}
                    />
                </RadialBarChart>
            </ChartContainer>
            
        </CardContent>
        <div className="p-4 text-center">
            <p className={`text-lg font-semibold ${readiness.color}`}>{readiness.label}</p>
        </div>
    </Card>
  );
}
    