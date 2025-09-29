'use server';

/**
 * @fileOverview A Genkit flow for providing financial advice.
 *
 * This flow takes a user's question as input and returns a conversational, helpful response.
 * - generateFinancialAdvice - A function that generates financial advice based on a user's query.
 * - GenerateFinancialAdviceInput - The input type for the generateFinancialAdvice function.
 * - GenerateFinancialAdviceOutput - The return type for the generateFinancialAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ExtractedTransactionSchema } from '../schemas/transactions';

const GenerateFinancialAdviceInputSchema = z.object({
  query: z.string().describe("The user's financial question."),
  transactions: z
    .array(ExtractedTransactionSchema)
    .optional()
    .describe('An optional array of the user\'s financial transactions.'),
});
export type GenerateFinancialAdviceInput = z.infer<
  typeof GenerateFinancialAdviceInputSchema
>;

const GenerateFinancialAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe('A simple, crisp, and concise response to the user\'s query.'),
});
export type GenerateFinancialAdviceOutput = z.infer<
  typeof GenerateFinancialAdviceOutputSchema
>;

export async function generateFinancialAdvice(
  input: GenerateFinancialAdviceInput
): Promise<GenerateFinancialAdviceOutput> {
  return generateFinancialAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialAdvicePrompt',
  input: { schema: GenerateFinancialAdviceInputSchema },
  output: { schema: GenerateFinancialAdviceOutputSchema },
  prompt: `You are "Uplift AI," a specialized financial mentor. Your goal is to provide simple, crisp, and concise financial advice. Be proactive and helpful.

When provided, use the user's transaction history to inform your response and offer personalized insights.

User's transaction history:
{{#if transactions}}
  {{#each transactions}}
  - {{this.description}}: {{this.amount}} ({{this.type}}) on {{this.date}}
  {{/each}}
{{else}}
  No transaction data provided.
{{/if}}

User's question: "{{{query}}}"

Provide a direct, helpful, and concise answer.
`,
});

const generateFinancialAdviceFlow = ai.defineFlow(
  {
    name: 'generateFinancialAdviceFlow',
    inputSchema: GenerateFinancialAdviceInputSchema,
    outputSchema: GenerateFinancialAdviceOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
