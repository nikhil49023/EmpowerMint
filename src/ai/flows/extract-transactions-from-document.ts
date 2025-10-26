
'use server';

/**
 * @fileOverview A Genkit flow for extracting transaction data from a document.
 *
 * - extractTransactionsFromDocument - Extracts transaction data from a provided document.
 */

import { ai } from '@/ai/genkit';
import {
  ExtractTransactionsInputSchema,
  type ExtractTransactionsInput,
  ExtractTransactionsOutputSchema,
  type ExtractTransactionsOutput,
} from '@/ai/schemas/transactions';

export async function extractTransactionsFromDocument(
  input: ExtractTransactionsInput
): Promise<ExtractTransactionsOutput> {
  return extractTransactionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTransactionsPrompt',
  input: { schema: ExtractTransactionsInputSchema },
  output: { schema: ExtractTransactionsOutputSchema },
  prompt: `You are an expert at extracting structured data from documents.
You will be given a document that contains a list of financial transactions.
Extract all the transactions you can find from the document.

For each transaction, provide:
- A clear description.
- The date in DD/MM/YYYY format.
- The type (income or expense).
- The amount, including currency (e.g., INR 1,234.56).

Document: {{media url=documentDataUri}}`,
});

const extractTransactionsFlow = ai.defineFlow(
  {
    name: 'extractTransactionsFlow',
    inputSchema: ExtractTransactionsInputSchema,
    outputSchema: ExtractTransactionsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
