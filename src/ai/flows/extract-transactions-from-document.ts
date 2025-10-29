
'use server';

/**
 * @fileOverview A flow for extracting transaction data from a document using Google Gemini (for OCR).
 * Using Gemini because it has better OCR/vision capabilities than Sarvam AI.
 */

import type {
  ExtractTransactionsInput,
  ExtractTransactionsOutput,
} from '@/ai/schemas/transactions';
import fetch from 'node-fetch';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function extractTransactionsFromDocument(
  input: ExtractTransactionsInput
): Promise<ExtractTransactionsOutput> {
  const prompt = `You are an expert at extracting structured data from financial documents.
Analyze the provided document image and extract all financial transactions you can find.

CRITICAL: You MUST output ONLY a valid JSON object with a single key "transactions".
The value should be an array of transaction objects.

For each transaction, provide:
- "description": A clear description of the transaction.
- "date": The date in DD/MM/YYYY format.
- "type": "income" or "expense".
- "amount": The amount as a string with currency (e.g., "INR 1,234.56").

Example output:
{
  "transactions": [
    {
      "description": "Salary Payment",
      "date": "15/01/2024",
      "type": "income",
      "amount": "INR 50,000.00"
    }
  ]
}
`;

  // Extract the base64 data and mime type
  const [mimeInfo, base64Data] = input.documentDataUri.split(',');
  const mimeType = mimeInfo.match(/:(.*?);/)?.[1] || 'image/jpeg';

  const data = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error Body:', errorBody);
      throw new Error(`Gemini API request failed with status: ${response.status}`);
    }

    const responseJson: any = await response.json();
    const message = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!message) {
      throw new Error('No response from Gemini API');
    }

    // Clean the response to get only the JSON part
    const jsonString = message
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsedOutput = JSON.parse(jsonString);
    return parsedOutput;
  } catch (error: any) {
    console.error('Gemini (extractTransactions) Error:', error);
    throw new Error(
      `Failed to extract transactions from document: ${error.message}`
    );
  }
}
