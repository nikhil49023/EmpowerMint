
'use server';

/**
 * @fileOverview This file defines a function for generating "Fin Bites",
 * concise updates on startup schemes and financial news in India, using Sarvam AI.
 */

import type { GenerateFinBiteOutput } from '@/ai/schemas/fin-bite';
import fetch from 'node-fetch';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const API_URL = 'https://api.sarvam.ai/chat/completions';

export async function generateFinBite(): Promise<GenerateFinBiteOutput> {
  const prompt = `You are "FIn-Box," a specialized financial news anchor for early-stage entrepreneurs in India.
Your task is to provide the single latest, most relevant news update for EACH of the following 3 categories: "MSME Schemes", "Finance & Tax", and "Market News".

Your response MUST be a valid JSON object.

Example Output:
\`\`\`json
{
  "updates": [
    {
      "category": "MSME Schemes",
      "title": "New 'Udyam Assist' Platform Launched",
      "summary": "The government has launched the Udyam Assist Platform to formalize Informal Micro Enterprises (IMEs) and help them avail benefits under Priority Sector Lending."
    },
    {
      "category": "Finance & Tax",
      "title": "GST Council Announces Changes to E-Invoicing",
      "summary": "The threshold for e-invoicing for B2B transactions has been reduced to ₹5 crore, impacting a larger number of small businesses."
    },
    {
      "category": "Market News",
      "title": "SEBI Introduces New Framework for SME IPOs",
      "summary": "The new framework aims to make it easier for small and medium enterprises to raise capital through Initial Public Offerings (IPOs) on the SME platforms of stock exchanges."
    }
  ]
}
\`\`\`
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
        content: 'You are a helpful AI assistant for financial news.',
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
    return parsedOutput;
  } catch (error: any) {
    console.error('Sarvam AI (generateFinBite) Error:', error);
    throw new Error(`Failed to generate FinBite updates: ${error.message}`);
  }
}
