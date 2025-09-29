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

const GenerateFinancialAdviceInputSchema = z.object({
  query: z.string().describe('The user\'s financial question.'),
});
export type GenerateFinancialAdviceInput = z.infer<
  typeof GenerateFinancialAdviceInputSchema
>;

const GenerateFinancialAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe('A helpful and conversational response to the user\'s query.'),
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
  prompt: `You are a friendly and knowledgeable AI Financial Advisor. Your goal is to provide clear, helpful, and encouraging advice on personal finance topics.

A user has the following question:
"{{{query}}}"

Provide a concise, easy-to-understand answer. Start with a friendly tone and break down complex topics into simple steps if necessary. Do not provide any investment advice or recommend specific financial products.`,
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
