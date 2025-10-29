
'use server';

/**
 * @fileOverview A function for generating a dashboard summary from transaction data using Sarvam AI.
 */

import type { z } from 'zod';
import {
  GenerateDashboardSummaryInputSchema,
  GenerateDashboardSummaryOutputSchema,
} from '../schemas/dashboard-summary';
import fetch from 'node-fetch';


type GenerateDashboardSummaryInput = z.infer<
  typeof GenerateDashboardSummaryInputSchema
>;
type GenerateDashboardSummaryOutput = z.infer<
  typeof GenerateDashboardSummaryOutputSchema
>;

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const API_URL = 'https://api.sarvam.ai/v1/chat/completions';


function parseCurrency(amount: string | number): number {
  if (typeof amount === 'number') {
    return amount;
  }
  if (typeof amount === 'string') {
    const sanitizedAmount = amount.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(sanitizedAmount);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export async function generateDashboardSummary(
  input: GenerateDashboardSummaryInput
): Promise<GenerateDashboardSummaryOutput> {
  const { transactions } = input;

  if (!transactions || transactions.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      savingsRate: 0,
      suggestion:
        'Start by adding some transactions to see your financial summary.',
    };
  }

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(t => {
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

  const transactionSample = transactions
    .slice(0, 15)
    .map(t => `- ${t.description}: ${t.amount} (${t.type}) on ${t.date}`)
    .join('\n');

  const prompt = `You are "FIn-Box," a financial analyst. Based on the following financial summary and transaction list for an entrepreneur, provide one short, actionable "Fin Bite" (a financial tip). Your response MUST be a valid JSON object with a "suggestion" key.

Example Output:
\`\`\`json
{
  "suggestion": "Your spending on subscriptions is high. Consider reviewing them."
}
\`\`\`

Financial Summary:
- Total Income: ${totalIncome}
- Total Expenses: ${totalExpenses}
- Savings Rate: ${savingsRate}%

Transaction List (sample):
${transactionSample}
`;

  const headers = {
    'Authorization': `Bearer ${SARVAM_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const data = {
    model: 'sarvam-m',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful AI assistant that provides financial tips.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  };


  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Sarvam AI Error Body:", errorBody);
        throw new Error(`Sarvam AI API request failed with status: ${response.status}`);
    }
    
    const responseJson: any = await response.json();
    const message = responseJson.choices[0].message.content;

    const jsonString = message
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const parsedOutput = JSON.parse(jsonString);

    return {
      totalIncome,
      totalExpenses,
      savingsRate,
      suggestion:
        parsedOutput?.suggestion ||
        'Review your spending to find potential savings opportunities.',
    };
  } catch (e: any) {
    console.error('Failed to generate dashboard suggestion from AI:', e.message);
    // Fallback suggestion
    return {
      totalIncome,
      totalExpenses,
      savingsRate,
      suggestion:
        'Review your spending to find potential savings opportunities.',
    };
  }
}
