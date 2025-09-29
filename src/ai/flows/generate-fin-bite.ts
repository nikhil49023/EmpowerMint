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
  tip: z.string().describe('A short, insightful piece of financial wisdom for an entrepreneur.'),
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
  prompt: `You are "Uplift AI," a specialized financial mentor for aspiring and early-stage entrepreneurs in India. Your tagline is "Your venture, elevated."

  Generate a single, short, and insightful "Fin Bite" for an entrepreneur. This should be a practical, actionable tip grounded in the principles of financial planning and business management for Micro & Small Enterprises (MSEs) in India.

  Base your tip on one of the following concepts:
  - The importance of a business plan.
  - The "Save First" mantra for businesses.
  - The value of an emergency fund for business continuity.
  - Differentiating between "good debt" (for assets) and "bad debt" (for consumption).
  - The existence of collateral-free loans for MSEs up to ₹10 lakhs.
  - Understanding a key financial term like Operating Expenses, COGS, or Profit.

  Examples:
  - "For your venture, 'Save First' isn't just a personal mantra, it's a business strategy. Before any other expense, set aside a portion of your revenue for taxes, emergencies, and future growth."
  - "Don't fear business loans, but know their purpose. Good debt builds your venture's assets, like new machinery. Bad debt just adds to your expenses. Choose wisely to elevate your business."
  - "Starting small? Remember that banks are instructed not to ask for collateral for business loans up to ₹10 lakhs for Micro & Small Enterprises. Your powerful business plan is your greatest asset."

  Generate a new, unique Fin Bite that is calm, clear, and empowering.`,
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
