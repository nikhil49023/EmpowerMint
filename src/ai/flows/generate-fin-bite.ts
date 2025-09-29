'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a "Fin Bite", a concise update on startup schemes in India.
 *
 * This flow does not take any input and returns a single update.
 * - generateFinBite - A function that generates a single startup scheme update.
 * - GenerateFinBiteOutput - The return type for the generateFinBite function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFinBiteOutputSchema = z.object({
  title: z.string().describe('The name of the scheme or policy.'),
  summary: z.string().describe('A brief, easy-to-understand summary of its key benefits for an early-stage entrepreneur.'),
});
export type GenerateFinBiteOutput = z.infer<
  typeof GenerateFinBiteOutputSchema
>;

export async function generateFinBite(): Promise<GenerateFinBiteOutput> {
  return generateFinBiteFlow();
}

const generateFinBitePrompt = ai.definePrompt({
  name: 'generateFinBitePrompt',
  output: { schema: GenerateFinBiteOutputSchema },
  prompt: `You are "Uplift AI," a specialized financial mentor. Your task is to provide the latest, most relevant update on a startup scheme or policy from the Indian central government, RBI, or Startup India.

  Generate a concise bulletin that includes:
  1.  **Title**: The name of the scheme or policy.
  2.  **Summary**: A brief, easy-to-understand summary of its key benefits for an early-stage entrepreneur.

  The information must be up-to-date and factual. Your tone should be informative and encouraging. Ensure the output is in the specified JSON format.`,
});

const generateFinBiteFlow = ai.defineFlow(
  {
    name: 'generateFinBiteFlow',
    outputSchema: GenerateFinBiteOutputSchema,
  },
  async () => {
    const { output } = await generateFinBitePrompt({});
    return output!;
  }
);
