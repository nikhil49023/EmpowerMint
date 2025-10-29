
'use server';

/**
 * @fileOverview A flow for extracting transaction data from a document using Sarvam AI.
 */

import type {
  ExtractTransactionsInput,
  ExtractTransactionsOutput,
} from '@/ai/schemas/transactions';
import fetch from 'node-fetch';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const API_URL = 'https://api.sarvam.ai/chat/completions';

export async function extractTransactionsFromDocument(
  input: ExtractTransactionsInput
): Promise<ExtractTransactionsOutput> {
  const prompt = `You are an expert at extracting structured data from financial documents.
Analyze the provided document content and extract all financial transactions you can find.

CRITICAL: You MUST output ONLY a valid JSON object with a single key "transactions".
The value should be an array of transaction objects.

For each transaction, provide:
- "description": A clear description of the transaction.
- "date": The date in DD/MM/YYYY format.
- "type": "income" or "expense".
- "amount": The amount as a string with currency (e.g., "INR 1,234.56").

Document Content (Base64 Encoded):
${input.documentDataUri.split(',')[1]}
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
        content:
          'You are a helpful AI for extracting financial transaction data.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
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
    console.error('Sarvam AI (extractTransactions) Error:', error);
    throw new Error(
      `Failed to extract transactions from document: ${error.message}`
    );
  }
}
