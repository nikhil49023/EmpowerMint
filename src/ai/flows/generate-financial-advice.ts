
'use server';

/**
 * @fileOverview A Genkit flow for providing financial advice.
 *
 * This flow is currently inactive.
 */

import { z } from 'genkit';
import { ExtractedTransactionSchema } from '../schemas/transactions';

export const GenerateFinancialAdviceInputSchema = z.object({
  query: z.string().describe("The user's financial question."),
  transactions: z
    .array(ExtractedTransactionSchema)
    .optional()
    .describe('An optional array of the user\'s financial transactions.'),
});
export type GenerateFinancialAdviceInput = z.infer<
  typeof GenerateFinancialAdviceInputSchema
>;

export const GenerateFinancialAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe('A simple, crisp, and concise response to the user\'s query.'),
});
export type GenerateFinancialAdviceOutput = z.infer<
  typeof GenerateFinancialAdviceOutputSchema
>;
