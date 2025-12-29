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

const getReadinessStyle = (score: number) => {
    if (score >= 9) {
        return { label: 'Proficient', color: 'text-green-500', fill: 'var(--color-green-500)' };
    } else if (score >= 7) {
        return { label: `Developing`, color: 'text-sky-500', fill: 'var(--color-sky-500)' };
    } else {
        return { label: "Basic", color: 'text-orange-500', fill: 'var(--color-orange-500)' };
    }
}

export function PlayerOverallScore({ score, targetLevel }: { score: number, targetLevel: 'D1' | 'D2' | 'D3' }) {
  const readiness = getReadinessStyle(score);
  const chartData = [{ name: 'score', value: score, fill: `hsl(${readiness.fill})` }];

  const chartConfig = {
    score: {
      label: "Score",
      color: `hsl(${readiness.fill})`
    },
    green: { color: "hsl(var(--chart-2))" },
    sky: { color: "hsl(var(--chart-1))" },
    orange: { color: "hsl(var(--chart-5))" },
  }
  
  return (
    <Card className="flex flex-col items-center justify-center h-full relative">
      <style>
        {`
        :root {
          --color-green-500: 142 76% 42%;
          --color-sky-500: 199 89% 48%;
          --color-orange-500: 25 95% 53%;
        }
        .dark {
          --color-green-500: 142 71% 45%;
          --color-sky-500: 199 98% 55%;
          --color-orange-500: 25 95% 58%;
        }
        `}
      </style>
        <CardHeader className="items-center pb-2">
            <CardTitle className='text-2xl tracking-tight'>
                Readiness: <span className={`font-semibold ${readiness.color}`}>{readiness.label}</span>
            </CardTitle>
            <CardDescription className="pt-2">Targeting {targetLevel}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-0 w-full relative">
            <ChartContainer
                config={chartConfig}
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
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-4xl font-bold" style={{color: `hsl(${readiness.fill})`}}>{score.toFixed(1)}</p>
            </div>
        </CardContent>
    </Card>
  );
}
    