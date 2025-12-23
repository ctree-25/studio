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

interface PlayerSkillChartProps {
    feedback?: string;
}

const extractSkillData = (feedback: string) => {
    const assessments: { [key: string]: { [key: string]: number } } = {};
    const allSkills = new Set<string>();

    const feedbackSections = feedback.split('###').filter(s => s.trim() !== '');

    feedbackSections.forEach((section, index) => {
        const coachKey = `coach${index + 1}`;
        assessments[coachKey] = {};
        const lines = section.trim().split('\n');
        lines.forEach(line => {
            const match = line.match(/- ([\w\s]+): (\d+)\/10/);
            if (match) {
                const skillName = match[1].trim();
                const rating = parseInt(match[2], 10);
                assessments[coachKey][skillName] = rating;
                allSkills.add(skillName);
            }
        });
    });

    const chartData: any[] = [];
    allSkills.forEach(skill => {
        const skillEntry: { [key: string]: any } = { skill };
        Object.keys(assessments).forEach(coachKey => {
            skillEntry[coachKey] = assessments[coachKey][skill] || 0;
        });
        chartData.push(skillEntry);
    });

    return chartData;
}


export function PlayerSkillChart({ feedback }: PlayerSkillChartProps) {
    if (!feedback) {
        return null;
    }

    const chartData = extractSkillData(feedback);
    
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
          <Radar
            name="Coach 1"
            dataKey="coach1"
            fill="var(--color-coach1)"
            fillOpacity={0.2}
            stroke="var(--color-coach1)"
          />
          <Radar
            name="Coach 2"
            dataKey="coach2"
            fill="var(--color-coach2)"
            fillOpacity={0.2}
            stroke="var(--color-coach2)"
          />
           <Radar
            name="Coach 3"
            dataKey="coach3"
            fill="var(--color-coach3)"
            fillOpacity={0.2}
            stroke="var(--color-coach3)"
          />
        </RadarChart>
      </ChartContainer>
  );
}
