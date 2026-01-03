
'use client';

import {
  PolarGrid,
  PolarAngleAxis,
  Radar,
  RadarChart,
  Legend,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Assessment } from '@/context/AppContext';


interface PlayerSkillChartProps {
    assessments?: Assessment[];
}

const extractSkillData = (assessments: Assessment[]) => {
    const allSkills = new Set<string>();
    const chartDataMap: { [key: string]: any } = {};

    assessments.forEach((assessment, index) => {
        Object.entries(assessment.skillRatings).forEach(([skill, rating]) => {
            allSkills.add(skill);
            if (!chartDataMap[skill]) {
                chartDataMap[skill] = { skill };
            }
            chartDataMap[skill][`coach${index + 1}`] = rating;
        });
    });

    return Array.from(allSkills).map(skill => chartDataMap[skill]);
}


export function PlayerSkillChart({ assessments }: PlayerSkillChartProps) {
    if (!assessments || assessments.length === 0) {
        return null;
    }

    const chartData = extractSkillData(assessments);
    
    const chartConfig = {
        coach1: {
            label: 'Coach 1',
            color: 'hsl(var(--chart-1))',
        },
        coach2: {
            label: 'Coach 2',
            color: 'hsl(var(--chart-2))',
        },
        coach3: {
            label: 'Coach 3',
            color: 'hsl(var(--chart-3))',
        },
    };

  return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full max-h-[450px]"
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
            content={<ChartTooltipContent indicator="line" labelClassName="hidden" />}
          />
          <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <PolarGrid gridType='polygon' />
          <Legend />
          {Object.keys(chartConfig).map((key, index) => {
            if (assessments.length > index) {
                return (
                    <Radar
                        key={key}
                        name={`Coach ${index + 1}`}
                        dataKey={key}
                        fill={`var(--color-${key})`}
                        fillOpacity={0.2}
                        stroke={`var(--color-${key})`}
                    />
                )
            }
            return null;
          })}
        </RadarChart>
      </ChartContainer>
  );
}
