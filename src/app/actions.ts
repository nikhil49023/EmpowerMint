
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
import { generateDashboardSummary } from '@/ai/flows/generate-dashboard-summary';
import type { GenerateDashboardSummaryOutput } from '@/ai/flows/generate-dashboard-summary';
import { generateInvestmentIdeaAnalysis } from '@/ai/flows/generate-investment-idea-analysis';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/flows/generate-investment-idea-analysis';
import type { ExtractedTransaction } from './ai/schemas/transactions';
import { generateDprConversation } from '@/ai/flows/generate-dpr-conversation';
import type {
  GenerateDprConversationInput,
  GenerateDprConversationOutput,
} from '@/ai/flows/generate-dpr-conversation';

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

export async function generateDashboardSummaryAction(
  transactions: ExtractedTransaction[]
): Promise<
  | { success: true; data: GenerateDashboardSummaryOutput }
  | { success: false; error: string }
> {
  try {
    const result = await generateDashboardSummary({ transactions });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to generate dashboard summary. Please try again.',
    };
  }
}

export async function generateInvestmentIdeaAnalysisAction(
  idea: string
): Promise<
  | { success: true; data: GenerateInvestmentIdeaAnalysisOutput }
  | { success: false; error: string }
> {
  try {
    const result = await generateInvestmentIdeaAnalysis({ idea });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to generate investment idea analysis. Please try again.',
    };
  }
}

export async function generateDprConversationAction(
  input: GenerateDprConversationInput
): Promise<
  | { success: true; data: GenerateDprConversationOutput }
  | { success: false; error: string }
> {
  try {
    const result = await generateDprConversation(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to get a response. Please try again.',
    };
  }
}
