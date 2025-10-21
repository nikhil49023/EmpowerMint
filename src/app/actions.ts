
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
import { generateDashboardSummary } from '@/ai/flows/generate-dashboard-summary';
import type { GenerateDashboardSummaryOutput } from '@/ai/flows/generate-dashboard-summary';
import { generateInvestmentIdeaAnalysis } from '@/ai/flows/generate-investment-idea-analysis';
import type {
  GenerateInvestmentIdeaAnalysisInput,
  GenerateInvestmentIdeaAnalysisOutput,
} from '@/ai/schemas/investment-idea-analysis';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import {
  generateFinancialAdvice,
  type GenerateFinancialAdviceInput,
  type GenerateFinancialAdviceOutput,
} from '@/ai/flows/generate-financial-advice';
import {
  generateDpr,
  type GenerateDprInput,
  type GenerateDprOutput,
} from '@/ai/flows/generate-dpr-from-analysis';
import {
  generateDprSection,
  type GenerateDprSectionInput,
  type GenerateDprSectionOutput,
} from '@/ai/flows/generate-dpr-section';
import {
  generateEmergencyFundSuggestion,
  type GenerateEmergencyFundSuggestionInput,
  type GenerateEmergencyFundSuggestionOutput,
} from '@/ai/flows/generate-emergency-fund-recommendation';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import { db } from '@/lib/firebase';

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

export async function saveFeedbackAction(input: {
  message: string;
  userId?: string;
  userName?: string | null;
  userEmail?: string | null;
}): Promise<{ success: true } | { success: false; error: string }> {
  if (!input.message) {
    return { success: false, error: 'Feedback message cannot be empty.' };
  }

  try {
    const feedbackCollectionRef = collection(db, 'feedback');
    const feedbackData = {
      ...input,
      createdAt: serverTimestamp(),
    };

    addDoc(feedbackCollectionRef, feedbackData).catch(async serverError => {
      const permissionError = new FirestorePermissionError({
        path: feedbackCollectionRef.path,
        operation: 'create',
        requestResourceData: feedbackData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });

    return { success: true };
  } catch (error) {
    console.error('Error saving feedback:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      error: `Failed to save feedback: ${errorMessage}`,
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

export async function generateDprAction(
  input: GenerateDprInput
): Promise<
  | { success: true; data: GenerateDprOutput }
  | { success: false; error: string }
> {
  try {
    const result = await generateDpr(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to generate DPR. Please try again.',
    };
  }
}


export async function generateDprSectionAction(
  input: GenerateDprSectionInput
): Promise<
  | { success: true; data: GenerateDprSectionOutput }
  | { success: false; error: string }
> {
  try {
    const result = await generateDprSection(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to generate DPR section. Please try again.',
    };
  }
}

export async function generateEmergencyFundSuggestionAction(
  input: GenerateEmergencyFundSuggestionInput
): Promise<
  | { success: true; data: GenerateEmergencyFundSuggestionOutput }
  | { success: false; error: string }
> {
  try {
    const result = await generateEmergencyFundSuggestion(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in emergency fund suggestion action:', error);
    return {
      success: false,
      error: 'Failed to generate emergency fund suggestion.',
    };
  }
}
