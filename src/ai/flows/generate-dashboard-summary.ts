
'use server';

/**
 * @fileOverview A Genkit flow for generating a dashboard summary from transaction data.
 *
 * This flow analyzes a list of transactions to calculate financial metrics and provide a personalized suggestion.
 * - generateDashboardSummary - A function that generates a dashboard summary.
 * - GenerateDashboardSummaryInput - The input type for the generateDashboardSummary function.
 * - GenerateDashboardSummaryOutput - The return type for the generateDashboardSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ExtractedTransaction } from '../schemas/transactions';
import {
  GenerateDashboardSummaryInputSchema,
  GenerateDashboardSummaryOutputSchema,
} from '../schemas/dashboard-summary';

export type GenerateDashboardSummaryInput = z.infer<
  typeof GenerateDashboardSummaryInputSchema
>;
export type GenerateDashboardSummaryOutput = z.infer<
  typeof GenerateDashboardSummaryOutputSchema
>;

export async function generateDashboardSummary(
  input: GenerateDashboardSummaryInput
): Promise<GenerateDashboardSummaryOutput> {
  return generateDashboardSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDashboardSummaryPrompt',
  input: { schema: GenerateDashboardSummaryInputSchema },
  output: { schema: GenerateDashboardSummaryOutputSchema },
  prompt: `You are "Uplift AI," a financial analyst. Your task is to analyze a list of financial transactions and provide a summary.

  Based on the provided transactions, calculate the following:
  1.  **Total Income**: Sum of all 'income' type transactions.
  2.  **Total Expenses**: Sum of all 'expense' type transactions.
  3.  **Savings Rate**: The percentage of income that is saved. Calculate as ((Total Income - Total Expenses) / Total Income) * 100. If Total Income is zero, Savings Rate should be 0.
  4.  **Personalized Suggestion**: Provide one short, actionable financial tip based on the user's spending patterns or savings rate. This should be in the style of a "Fin Bite".

  Here is the list of transactions:
  {{#each transactions}}
  - {{this.description}}: {{this.amount}} ({{this.type}}) on {{this.date}}
  {{/each}}

  Your output must be in the specified JSON format. Ensure all numerical values are returned as numbers, not strings.
  `,
});

function parseCurrency(amount: string | number): number {
  if (typeof amount === 'number') {
    return amount;
  }
  if (typeof amount === 'string') {
    // Attempt to parse directly, then fall back to stripping characters if that fails.
    const parsed = parseFloat(amount);
    if (!isNaN(parsed)) {
      return parsed;
    }
    // Remove currency symbols, commas, and whitespace, then parse as a float.
    return parseFloat(amount.replace(/[^0-9.-]+/g, ''));
  }
  return 0;
}

const generateDashboardSummaryFlow = ai.defineFlow(
  {
    name: 'generateDashboardSummaryFlow',
    inputSchema: GenerateDashboardSummaryInputSchema,
    outputSchema: GenerateDashboardSummaryOutputSchema,
  },
  async (input: { transactions: ExtractedTransaction[] }) => {
    // If there are no transactions, return a default zero-state summary.
    if (!input.transactions || input.transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        savingsRate: 0,
        suggestion:
          'Start by adding some transactions to see your financial summary.',
      };
    }
    // For a small number of transactions, we can calculate totals directly and just use the LLM for the suggestion.
    if (input.transactions.length < 20) {
      let totalIncome = 0;
      let totalExpenses = 0;

      input.transactions.forEach(t => {
        const amount = parseCurrency(t.amount);
        if (t.type === 'income') {
          totalIncome += amount;
        } else {
          totalExpenses += amount;
        }
      });

      const savingsRate =
        totalIncome > 0
          ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
          : 0;

      // Now, call the LLM just for the suggestion.
      const suggestionPrompt = ai.definePrompt({
        name: 'generateSuggestionOnlyPrompt',
        input: {
          schema: z.object({
            transactions: z.any(),
            totalIncome: z.number(),
            totalExpenses: z.number(),
            savingsRate: z.number(),
          }),
        },
        output: {
          schema: z.object({
            suggestion: z
              .string()
              .describe(
                'A short, actionable financial tip based on the transactions.'
              ),
          }),
        },
        prompt: `Based on the following financial summary, provide one short, actionable "Fin Bite" for an entrepreneur.

        - Total Income: {{totalIncome}}
        - Total Expenses: {{totalExpenses}}
        - Savings Rate: {{savingsRate}}%

        Transaction List:
        {{#each transactions}}
        - {{this.description}}: {{this.amount}} ({{this.type}}) on {{this.date}}
        {{/each}}
        `,
      });

      const { output } = await suggestionPrompt({
        transactions: input.transactions,
        totalIncome,
        totalExpenses,
        savingsRate,
      });

      return {
        totalIncome,
        totalExpenses,
        savingsRate,
        suggestion: output!.suggestion,
      };
    } else {
      // If there's a large number of transactions, let the LLM handle everything.
      const { output } = await prompt(input);
      return output!;
    }
  }
);
