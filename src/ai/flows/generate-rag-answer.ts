
'use server';

/**
 * @fileOverview A flow for answering questions using Sarvam AI.
 * This implementation uses a direct fetch call to Sarvam AI.
 */

import type {
  GenerateRagAnswerInput,
  GenerateRagAnswerOutput,
} from '@/ai/schemas/rag-answer';
import fetch from 'node-fetch';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const API_URL = 'https://api.sarvam.ai/v1/chat/completions';

export async function generateRagAnswer(
  input: GenerateRagAnswerInput
): Promise<GenerateRagAnswerOutput> {
  const { query, transactions } = input;

  // Construct a clear, structured prompt for the AI
  const prompt = `Based on the following context, please answer the user's query.

**User's Recent Transactions (for context):**
${transactions
  ?.map(t => `- ${t.date}: ${t.description} - ${t.amount} (${t.type})`)
  .join('\n') || 'No transactions available.'}

---

**User's Query:**
"${query}"
`;

  const headers = {
    Authorization: `Bearer ${SARVAM_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const data = {
    model: 'sarvam-1',
    messages: [
      {
        role: 'system',
        content: 'You are FIn-Box, a helpful financial advisor AI for Indian entrepreneurs. Your answers should be simple, crisp, and concise. Analyze the user\'s transaction history and their query to provide a relevant and personalized response.',
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

    return { answer: message };
  } catch (e: any) {
    console.error(`Sarvam RAG service failed: ${e.message}.`);
    throw e;
  }
}
