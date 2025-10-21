
'use server';

/**
 * @fileOverview A Genkit flow for generating a detailed budget report from transaction data.
 *
 * This flow analyzes expense transactions to create a categorized breakdown and summary
 * suitable for financial reporting and IT return purposes.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateBudgetReportInputSchema,
  GenerateBudgetReportOutputSchema,
  type GenerateBudgetReportInput,
  type GenerateBudgetReportOutput,
} from '@/ai/schemas/budget-report';

export async function generateBudgetReport(
  input: GenerateBudgetReportInput
): Promise<GenerateBudgetReportOutput> {
  return generateBudgetReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBudgetReportPrompt',
  input: { schema: GenerateBudgetReportInputSchema },
  output: { schema: GenerateBudgetReportOutputSchema },
  prompt: `You are an expert financial analyst. Your task is to analyze a list of expense transactions and create a detailed report suitable for IT return filing.

Analyze the following transactions:
{{#each transactions}}
- {{this.description}}: {{this.amount}} on {{this.date}}
{{/each}}

Based on this data, you must:
1.  **Categorize Expenses**: Group all expenses into logical categories (e.g., "Food", "Transport", "Rent", "Utilities", "Entertainment", "Other").
2.  **Calculate Totals**: Sum the total amount for each category.
3.  **Generate Expense Breakdown**: Create a JSON array for a pie chart. Each object in the array should have a "name" (the category) and a "value" (the total amount for that category).
4.  **Write a Summary**: Provide a professional, analytical summary of the spending habits. This summary should be formal and suitable for inclusion in a financial report.

Your output must be a single, complete JSON object matching the required schema. Ensure all numerical values are numbers, not strings.
`,
});

const generateBudgetReportFlow = ai.defineFlow(
  {
    name: 'generateBudgetReportFlow',
    inputSchema: GenerateBudgetReportInputSchema,
    outputSchema: GenerateBudgetReportOutputSchema,
  },
  async input => {
    // Filter for expenses only, as income is not relevant for this report.
    const expenseTransactions = input.transactions.filter(
      t => t.type === 'expense'
    );
    const { output } = await prompt({ transactions: expenseTransactions });
    return output!;
  }
);
