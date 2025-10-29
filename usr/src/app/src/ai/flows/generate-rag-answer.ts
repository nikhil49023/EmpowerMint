
'use server';

/**
 * @fileOverview A function for making authenticated requests to the Zoho Catalyst RAG endpoint.
 * This file uses a centralized service to handle authentication and API calls.
 */

import type {
  GenerateRagAnswerInput,
  GenerateRagAnswerOutput,
} from '@/ai/schemas/rag-answer';
import catalystService from '@/services/catalyst';

export async function generateRagAnswer(
  input: GenerateRagAnswerInput
): Promise<GenerateRagAnswerOutput> {
  try {
    const completion = await catalystService.getRagAnswer(input);

    if (!completion) {
      console.error('Received empty or malformed content from RAG service.');
      throw new Error('Received empty or malformed content from RAG service.');
    }

    console.log("Successfully received RAG API response.");
    return { answer: completion };
  } catch (e: any) {
    console.error('Failed to get response from RAG service. Full error:', e);
    throw new Error(`An error occurred while processing the AI response. Check the server logs. Error: ${e.message}`);
  }
}
