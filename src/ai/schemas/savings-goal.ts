/**
 * @fileOverview Zod schemas and TypeScript types for the savings goal recommendation.
 */

import { z } from 'genkit';

export const GenerateEmergencyFundSuggestionInputSchema = z.object({
  totalIncome: z.number().describe('The user\'s total monthly income.'),
  totalExpenses: z.number().describe('The user\'s total monthly expenses.'),
});

export const GenerateEmergencyFundSuggestionOutputSchema = z.object({
  recommendedAmount: z
    .number()
    .describe('The recommended amount for an emergency fund, typically 3-6 times monthly expenses.'),
  recommendationReasoning: z
    .string()
    .describe('A brief explanation for the recommended amount.'),
});
