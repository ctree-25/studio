'use server';

/**
 * @fileOverview Generates a personalized training plan for a volleyball player based on coach feedback.
 *
 * - generateTrainingPlan - Creates a training plan with actionable steps and video resources.
 * - GenerateTrainingPlanInput - The input type for the generateTrainingPlan function.
 * - GenerateTrainingPlanOutput - The return type for the generateTrainingPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTrainingPlanInputSchema = z.object({
  coachFeedback: z
    .string()
    .describe(
      'A compilation of feedback from one or more coaches, detailing the player\'s performance.'
    ),
  position: z.string().describe('The player\'s volleyball position.'),
});
export type GenerateTrainingPlanInput = z.infer<
  typeof GenerateTrainingPlanInputSchema
>;

const TrainingStepSchema = z.object({
  title: z.string().describe('A concise title for the training exercise.'),
  description: z
    .string()
    .describe('A detailed description of the exercise and its purpose.'),
});

const VideoSuggestionSchema = z.object({
  title: z.string().describe('The title of the suggested training video.'),
  url: z.string().url().describe('A direct URL to the training video.'),
});

const GenerateTrainingPlanOutputSchema = z.object({
  actionableSteps: z
    .array(TrainingStepSchema)
    .describe('A list of specific, actionable training exercises.'),
  suggestedVideos: z
    .array(VideoSuggestionSchema)
    .describe('A list of suggested videos to demonstrate the exercises.'),
});
export type GenerateTrainingPlanOutput = z.infer<
  typeof GenerateTrainingPlanOutputSchema
>;

export async function generateTrainingPlan(
  input: GenerateTrainingPlanInput
): Promise<GenerateTrainingPlanOutput> {
  return generateTrainingPlanFlow(input);
}

const generateTrainingPlanPrompt = ai.definePrompt({
  name: 'generateTrainingPlanPrompt',
  input: {schema: GenerateTrainingPlanInputSchema},
  output: {schema: GenerateTrainingPlanOutputSchema},
  prompt: `You are a world-class volleyball skills development coach. Based on the coach feedback provided for a player who is a {{position}}, create a personalized training plan.

The plan should include:
1.  A set of clear, actionable steps and drills the player can perform.
2.  A list of suggested YouTube videos that demonstrate these drills or related concepts.

Prioritize the most critical areas for improvement identified in the feedback.

Coach Feedback:
"{{{coachFeedback}}}"

Generate a training plan with actionable steps and video suggestions. Ensure the video URLs are valid and relevant.`,
});

const generateTrainingPlanFlow = ai.defineFlow(
  {
    name: 'generateTrainingPlanFlow',
    inputSchema: GenerateTrainingPlanInputSchema,
    outputSchema: GenerateTrainingPlanOutputSchema,
  },
  async input => {
    const {output} = await generateTrainingPlanPrompt(input);
    return output!;
  }
);
