
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
import type {
  GenerateInvestmentIdeaAnalysisInput,
  GenerateInvestmentIdeaAnalysisOutput,
} from '@/ai/flows/generate-investment-idea-analysis';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import { generateDprConversation } from '@/ai/flows/generate-dpr-conversation';
import type {
  GenerateDprConversationInput,
  GenerateDprConversationOutput,
} from '@/ai/flows/generate-dpr-conversation';
import {
  generateFinancialAdvice,
  type GenerateFinancialAdviceInput,
  type GenerateFinancialAdviceOutput,
} from '@/ai/flows/generate-financial-advice';
import { getDb } from '@/lib/firebase-admin';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
  input: GenerateInvestmentIdeaAnalysisInput
): Promise<
  | { success: true; data: GenerateInvestmentIdeaAnalysisOutput }
  | { success: false; error: string }
> {
  try {
    const result = await generateInvestmentIdeaAnalysis(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to generate investment idea analysis. Please try again.',
    };
  }
}

// This server action is no longer used, as writes are handled on the client.
// It is kept here for reference but can be removed in the future.
export async function saveInvestmentIdeaAction(
  userId: string,
  idea: GenerateInvestmentIdeaAnalysisOutput
): Promise<{ success: true } | { success: false; error: string }> {
  if (!userId || !idea) {
    return { success: false, error: 'User ID and idea data are required.' };
  }

  try {
    const db = getDb();
    const ideasCollectionRef = collection(db, 'users', userId, 'ideas');
    await addDoc(ideasCollectionRef, {
      title: idea.title,
      summary: idea.summary,
      savedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving investment idea:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      error: `Failed to save investment idea: ${errorMessage}`,
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
      error: 'Failed to get a response from the AI Advisor.',
    };
  }
}
