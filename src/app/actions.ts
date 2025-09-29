'use server';

import {
  generateSuggestionsFromPrompt,
  GenerateSuggestionsFromPromptInput,
  GenerateSuggestionsFromPromptOutput,
} from '@/ai/flows/generate-suggestions-from-prompt';
import { extractTransactionsFromDocument } from '@/ai/flows/extract-transactions-from-document';
import type {
  ExtractTransactionsInput,
  ExtractTransactionsOutput,
} from '@/ai/schemas/transactions';
import { generateFinBite } from '@/ai/flows/generate-fin-bite';
import type { GenerateFinBiteOutput } from '@/ai/flows/generate-fin-bite';
import { generateFinancialAdvice } from '@/ai/flows/generate-financial-advice';
import type {
  GenerateFinancialAdviceInput,
  GenerateFinancialAdviceOutput,
} from '@/ai/flows/generate-financial-advice';

export async function generateSuggestionsAction(
  input: GenerateSuggestionsFromPromptInput
): Promise<
  | { success: true; data: GenerateSuggestionsFromPromptOutput }
  | { success: false; error: string }
> {
  try {
    const suggestions = await generateSuggestionsFromPrompt(input);
    return { success: true, data: suggestions };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to generate suggestions. Please try again.',
    };
  }
}

export async function extractTransactionsAction(
  input: ExtractTransactionsInput
): Promise<
  | { success: true; data: ExtractTransactionsOutput }
  | { success: false; error: string }
> {
  try {
    const result = await extractTransactionsFromDocument(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to extract transactions. Please try again.',
    };
  }
}

export async function generateFinBiteAction(): Promise<
  | { success: true; data: GenerateFinBiteOutput }
  | { success: false; error: string }
> {
  try {
    const result = await generateFinBite();
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to generate a Fin Bite. Please try again.',
    };
  }
}

export async function askAIAdvisorAction(
  input: GenerateFinancialAdviceInput
): Promise<
  | { success: true; data: GenerateFinancialAdviceOutput }
  | { success: false; error: string }
> {
  try {
    const result = await generateFinancialAdvice(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to get a response. Please try again.',
    };
  }
}
