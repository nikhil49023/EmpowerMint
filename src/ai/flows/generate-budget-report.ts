
'use server';

/**
 * @fileOverview A Genkit flow for generating a budget report using SarvamAI.
 *
 * This flow analyzes a list of transactions to generate a summary and expense breakdown.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateBudgetReportInputSchema,
  GenerateBudgetReportOutputSchema,
  type GenerateBudgetReportInput,
  type GenerateBudgetReportOutput,
} from '@/ai/schemas/sarvam-schemas';
import { SarvamAIClient } from 'sarvamai';

// This is the exported function that the UI will call.
export async function generateBudgetReport(
  input: GenerateBudgetReportInput
): Promise<GenerateBudgetReportOutput> {
  return generateBudgetReportFlow(input);
}

const generateBudgetReportFlow = ai.defineFlow(
  {
    name: 'generateBudgetReportFlow',
    inputSchema: GenerateBudgetReportInputSchema,
    outputSchema: GenerateBudgetReportOutputSchema,
  },
  async ({ transactions }) => {
    // Construct a detailed prompt for SarvamAI
    const transactionsText = transactions
      .map(
        t => `- ${t.description}: ${t.amount} (${t.type}) on ${t.date}`
      )
      .join('\n');

    const prompt = `You are a financial analyst. Based on the following transactions, provide a spending analysis and an expense breakdown.

Transactions:
${transactionsText}

Your response must be a valid JSON object with two keys:
1. "summary": A string containing a 1-paragraph summary and analysis of spending habits.
2. "expenseBreakdown": An array of objects, where each object has a "name" (the category) and a "value" (the total amount). Group similar expenses into logical categories (e.g., "Food", "Transport", "Shopping").

Example of expenseBreakdown:
[
  {"name": "Groceries", "value": 5000},
  {"name": "Entertainment", "value": 1500}
]

Provide only the JSON object in your response.`;

    try {
      const client = new SarvamAIClient({
        apiSubscriptionKey: process.env.SARVAM_API_KEY,
      });
      
      const response = await client.chat.completions({
        model: 'sarvam-2b-v0.3',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 1024,
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("Received empty content from AI service.");
      }

      const jsonResponse = JSON.parse(content);
      const validationResult = GenerateBudgetReportOutputSchema.safeParse(jsonResponse);
      
      if (!validationResult.success) {
        console.error("SarvamAI response did not match Zod schema:", validationResult.error);
        throw new Error("Received malformed data from AI service.");
      }

      return validationResult.data;
    } catch (e: any) {
      console.error("Failed to process SarvamAI response:", e.message);
      throw new Error(`An error occurred while processing the AI response: ${e.message}`);
    }
  }
);
