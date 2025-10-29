
'use server';

/**
 * @fileOverview A function for generating a budget report using Sarvam AI.
 */

import type {
  GenerateBudgetReportInput,
  GenerateBudgetReportOutput,
} from '@/ai/schemas/budget-report';
import fetch from 'node-fetch';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const API_URL = 'https://api.sarvam.ai/chat/completions';

export async function generateBudgetReport(
  input: GenerateBudgetReportInput
): Promise<GenerateBudgetReportOutput> {
  const transactionList = input.transactions
    .map(t => `- ${t.description}: ${t.amount} (${t.type}) on ${t.date}`)
    .join('\n');

  const prompt = `You are a financial analyst. Based on the following transactions, provide a spending analysis and an expense breakdown.

Group similar expenses into logical categories (e.g., "Food", "Transport", "Shopping"). Your response must be a valid JSON object.

Example Output:
\`\`\`json
{
  "summary": "*(Powered by FIn-Box AI)* Your spending is highest in Food...",
  "expenseBreakdown": [
    { "name": "Food", "value": 5000 },
    { "name": "Transport", "value": 2500 }
  ]
}
\`\`\`

Transactions:
${transactionList}
`;

  const headers = {
    'API-Subscription-Key': `${SARVAM_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const data = {
    model: 'sarvam-1',
    messages: [
      {
        role: 'system',
        content: 'You are an expert financial analyst AI.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
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

    // Clean the response to get only the JSON part
    const jsonString = message
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const parsedOutput = JSON.parse(jsonString);
    return parsedOutput;
  } catch (error: any) {
    console.error('Sarvam AI (generateBudgetReport) Error:', error);
    throw new Error(`Failed to generate budget report: ${error.message}`);
  }
}
