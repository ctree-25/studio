'use server';

/**
 * @fileOverview AI-powered volleyball footage analysis for player improvement.
 *
 * - analyzePlayerFootage - Analyzes volleyball footage to identify strengths and weaknesses.
 * - AnalyzePlayerFootageInput - The input type for the analyzePlayerFootage function.
 * - AnalyzePlayerFootageOutput - The return type for the analyzePlayerFootage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePlayerFootageInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of a volleyball player, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Can be a placeholder if only a URL is available."
    ),
  targetLevel: z
    .enum(['D1', 'D2', 'D3'])
    .describe('The target level of play (D1, D2, or D3).'),
  preferredSchools: z.string().describe('The player\'s preferred schools.'),
});
export type AnalyzePlayerFootageInput = z.infer<typeof AnalyzePlayerFootageInputSchema>;

const AnalyzePlayerFootageOutputSchema = z.object({
  strengths: z.string().describe('Identified strengths of the player.'),
  weaknesses: z.string().describe('Areas for improvement for the player.'),
  overallAssessment: z
    .string()
    .describe('An overall assessment of the player\'s abilities.'),
});
export type AnalyzePlayerFootageOutput = z.infer<typeof AnalyzePlayerFootageOutputSchema>;

export async function analyzePlayerFootage(
  input: AnalyzePlayerFootageInput
): Promise<AnalyzePlayerFootageOutput> {
  return analyzePlayerFootageFlow(input);
}

const analyzePlayerFootagePrompt = ai.definePrompt({
  name: 'analyzePlayerFootagePrompt',
  input: {schema: AnalyzePlayerFootageInputSchema},
  output: {schema: AnalyzePlayerFootageOutputSchema},
  prompt: `You are an expert volleyball coach providing an evaluation of player highlight footage.

  Identify the player's strengths and weaknesses based on the footage provided, tailored to their target level of play.
  Consider the player's preferred schools when providing your assessment to give context, but do not frame this as a recruiting evaluation. The goal is to provide constructive feedback.

  Video Footage: {{media url=videoDataUri}}
  Target Level: {{{targetLevel}}}
  Preferred Schools: {{{preferredSchools}}}

  Provide a detailed assessment, focusing on areas where the player excels and areas that need improvement to reach their target level.
  Ensure your feedback is actionable and specific.

  Strengths:
  Weaknesses:
  Overall Assessment: `,
});

const analyzePlayerFootageFlow = ai.defineFlow(
  {
    name: 'analyzePlayerFootageFlow',
    inputSchema: AnalyzePlayerFootageInputSchema,
    outputSchema: AnalyzePlayerFootageOutputSchema,
  },
  async input => {
    const {output} = await analyzePlayerFootagePrompt(input);
    return output!;
  }
);
