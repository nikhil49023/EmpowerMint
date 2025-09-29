'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a "Fin Bite", a short, insightful piece of financial wisdom.
 *
 * This flow does not take any input and returns a single financial tip.
 * - generateFinBite - A function that generates a single financial tip.
 * - GenerateFinBiteOutput - The return type for the generateFinBite function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFinBiteOutputSchema = z.object({
  tip: z.string().describe('A short, insightful piece of financial wisdom.'),
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
  prompt: `You are a financial expert. Generate a single, short, and insightful piece of financial wisdom. This "Fin Bite" should be a practical and actionable tip for personal finance.

Examples:
- "Automate your savings. Even a small amount transferred automatically to your savings account each month can grow into a significant sum over time."
- "The 30-day rule: Before making a non-essential purchase, wait 30 days. If you still want it after a month, then consider buying it. This helps curb impulse spending."
- "Pay off your highest-interest debt first. This strategy, known as the 'avalanche method,' can save you the most money in interest payments over time."

Generate a new, unique Fin Bite.`,
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
