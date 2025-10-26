
'use server';

/**
 * @fileOverview A function for providing financial advice using SarvamAI.
 * This is NOT a Genkit flow and is called directly.
 */

import { z } from 'zod';
import type { ExtractedTransaction } from '../schemas/transactions';
import { SarvamAIClient } from 'sarvamai';

const GenerateFinancialAdviceInputSchema = z.object({
  query: z.string().describe("The user's financial question."),
  transactions: z
    .array(
      z.object({
        description: z.string(),
        date: z.string(),
        type: z.enum(['income', 'expense']),
        amount: z.union([z.string(), z.number()]),
      })
    )
    .optional()
    .describe("An optional array of the user's financial transactions."),
});
type GenerateFinancialAdviceInput = z.infer<
  typeof GenerateFinancialAdviceInputSchema
>;

const GenerateFinancialAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe('A simple, crisp, and concise response to the user\'s query.'),
});
type GenerateFinancialAdviceOutput = z.infer<
  typeof GenerateFinancialAdviceOutputSchema
>;

export async function generateFinancialAdvice(
  input: GenerateFinancialAdviceInput
): Promise<GenerateFinancialAdviceOutput> {
  let transactionContext = '';
  if (input.transactions && input.transactions.length > 0) {
    const recentTransactions = input.transactions.slice(-15); // Use last 15 transactions
    const transactionsText = recentTransactions
      .map(t => `- ${t.description}: ${t.amount} (${t.type}) on ${t.date}`)
      .join('\n');
    transactionContext = `Here is the user's recent transaction history for context:\n${transactionsText}\n\n`;
  }

  const userPrompt = `${transactionContext}The user's question is: "${input.query}"

Provide a simple, crisp, and concise answer.`;

  try {
    const client = new SarvamAIClient({
      apiSubscriptionKey: process.env.SARVAM_API_KEY,
    });

    const response = await client.chat.completions({
      model: 'sarvam-2b-v0.3',
      messages: [
        {
          role: 'system',
          content:
            'You are "FIn-Box", a friendly and helpful AI financial advisor for entrepreneurs in India, powered by SarvamAI. Your goal is to provide clear, simple, and actionable financial advice. Keep your answers concise and always start your response by mentioning you are using SarvamAI.',
        },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 256,
      temperature: 0.4,
    });

    const advice = response.choices[0]?.message?.content;
    if (!advice) {
      throw new Error('Received empty content from AI service.');
    }

    return { advice };
  } catch (e: any) {
    console.error('Failed to process SarvamAI response:', e.message);
    throw new Error(
      `An error occurred while processing the AI response: ${e.message}`
    );
  }
}

export type {
  GenerateFinancialAdviceInput,
  GenerateFinancialAdviceOutput
};
