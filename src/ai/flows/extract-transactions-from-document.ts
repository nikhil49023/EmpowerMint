'use server';

/**
 * @fileOverview A Genkit flow for extracting transaction data from a document.
 *
 * - extractTransactionsFromDocument - Extracts transaction data from a provided document.
 * - ExtractTransactionsInput - The input type for the extraction function.
 * - ExtractedTransaction - The schema for a single extracted transaction.
 * - ExtractTransactionsOutput - The return type for the extraction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ExtractedTransactionSchema = z.object({
  description: z.string().describe('The description of the transaction.'),
  date: z
    .string()
    .describe('The date of the transaction in DD/MM/YYYY format.'),
  type: z
    .enum(['income', 'expense'])
    .describe('The type of transaction (income or expense).'),
  amount: z
    .string()
    .describe('The transaction amount, formatted as a string with currency.'),
});
export type ExtractedTransaction = z.infer<typeof ExtractedTransactionSchema>;

export const ExtractTransactionsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document (like a bank statement) containing transactions, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTransactionsInput = z.infer<
  typeof ExtractTransactionsInputSchema
>;

export const ExtractTransactionsOutputSchema = z.object({
  transactions: z
    .array(ExtractedTransactionSchema)
    .describe('An array of extracted transactions.'),
});
export type ExtractTransactionsOutput = z.infer<
  typeof ExtractTransactionsOutputSchema
>;

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
