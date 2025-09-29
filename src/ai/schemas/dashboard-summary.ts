/**
 * @fileOverview Zod schemas and TypeScript types for the dashboard summary.
 *
 * - GenerateDashboardSummaryInputSchema - The input schema for the dashboard summary flow.
 * - GenerateDashboardSummaryOutputSchema - The output schema for the dashboard summary flow.
 */

import { z } from 'genkit';
import { ExtractedTransactionSchema } from './transactions';

export const GenerateDashboardSummaryInputSchema = z.object({
  transactions: z
    .array(ExtractedTransactionSchema)
    .describe('An array of financial transactions.'),
});

export const GenerateDashboardSummaryOutputSchema = z.object({
  totalIncome: z.number().describe('The total income for the period.'),
  totalExpenses: z.number().describe('The total expenses for the period.'),
  savingsRate: z
    .number()
    .describe('The savings rate as a percentage of income.'),
  suggestion: z
    .string()
    .describe(
      'A personalized financial suggestion based on the transaction data.'
    ),
});
