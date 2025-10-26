
'use server';

/**
 * @fileOverview A Genkit flow for generating an emergency fund recommendation.
 *
 * This flow calculates a recommended emergency fund amount based on the user's income and expenses.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateEmergencyFundSuggestionInputSchema,
  GenerateEmergencyFundSuggestionOutputSchema,
  type GenerateEmergencyFundSuggestionInput,
  type GenerateEmergencyFundSuggestionOutput,
} from '@/ai/schemas/savings-goal';

export async function generateEmergencyFundSuggestion(
  input: GenerateEmergencyFundSuggestionInput
): Promise<GenerateEmergencyFundSuggestionOutput> {
  return generateEmergencyFundSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmergencyFundSuggestionPrompt',
  input: { schema: GenerateEmergencyFundSuggestionInputSchema },
  output: { schema: GenerateEmergencyFundSuggestionOutputSchema },
  prompt: `You are a financial advisor for an entrepreneur in India. Your task is to recommend an emergency fund amount.

An emergency fund should ideally cover 3 to 6 months of essential living expenses.

User's Financials:
- Monthly Income: {{totalIncome}}
- Monthly Expenses: {{totalExpenses}}

Calculate a recommended emergency fund amount. A sensible default is 3 times the monthly expenses. If expenses are zero but income is positive, suggest a small starter fund (e.g., 25% of one month's income). If both are zero, the recommendation should be zero.

Provide the calculated amount and a brief, encouraging reason for why this amount is recommended.
`,
});

const generateEmergencyFundSuggestionFlow = ai.defineFlow(
  {
    name: 'generateEmergencyFundSuggestionFlow',
    inputSchema: GenerateEmergencyFundSuggestionInputSchema,
    outputSchema: GenerateEmergencyFundSuggestionOutputSchema,
  },
  async ({ totalIncome, totalExpenses }) => {
    // For predictability and cost-saving, we can apply the logic directly
    // and use a simpler LLM call if needed, or just return a structured response.
    if (totalExpenses > 0) {
      const recommendedAmount = totalExpenses * 3;
      return {
        recommendedAmount,
        recommendationReasoning: `It's wise to have at least 3 months of your expenses saved for unexpected events. This provides a solid financial safety net.`,
      };
    }
    if (totalIncome > 0) {
      const recommendedAmount = totalIncome * 0.25;
      return {
        recommendedAmount,
        recommendationReasoning: `Since you don't have expenses logged, starting with a small fund is a great first step towards building a financial safety net.`,
      };
    }
    return {
      recommendedAmount: 0,
      recommendationReasoning: `Add your income and expenses to get a personalized emergency fund recommendation.`,
    };

    // Below is the LLM-based implementation if more nuanced reasoning is required in the future.
    // const { output } = await prompt({ totalIncome, totalExpenses });
    // return output!;
  }
);
