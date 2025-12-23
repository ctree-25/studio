'use client';

import { TrendingUp } from 'lucide-react';
import {
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface PlayerSkillChartProps {
    feedback?: string;
}

const extractSkillData = (feedback: string) => {
    const skills: { [key: string]: number[] } = {};
    const lines = feedback.split('\n');

    lines.forEach(line => {
        const match = line.match(/- ([\w\s]+): (\d+)\/10/);
        if (match) {
            const skillName = match[1].trim();
            const rating = parseInt(match[2], 10);
            if (!skills[skillName]) {
                skills[skillName] = [];
            }
            skills[skillName].push(rating);
        }
    });

    return Object.keys(skills).map(skill => {
        const ratings = skills[skill];
        const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        return {
            skill,
            averageRating: parseFloat(average.toFixed(1)),
        };
    });
}


export function PlayerSkillChart({ feedback }: PlayerSkillChartProps) {
    if (!feedback) {
        return null;
    }

    const chartData = extractSkillData(feedback);
    
    const chartConfig = {
        averageRating: {
            label: 'Avg. Rating',
            color: 'hsl(var(--primary))',
        },
    };

  return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full w-full"
      >
        <RadarChart
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
          domain={[0, 10]}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <PolarGrid gridType='polygon' />
          <Radar
            dataKey="averageRating"
            fill="var(--color-averageRating)"
            fillOpacity={0.6}
            stroke="var(--color-averageRating)"
          />
        </RadarChart>
      </ChartContainer>
  );
}
