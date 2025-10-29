
'use server';

import { extractTransactionsFromDocument } from '@/ai/flows/extract-transactions-from-document';
import type {
  ExtractTransactionsInput,
  ExtractTransactionsOutput,
} from '@/ai/schemas/transactions';
import { generateDashboardSummary } from '@/ai/flows/generate-dashboard-summary';
import { generateInvestmentIdeaAnalysis } from '@/ai/flows/generate-investment-idea-analysis';
import type {
  GenerateInvestmentIdeaAnalysisInput,
  GenerateInvestmentIdeaAnalysisOutput,
} from '@/ai/schemas/investment-idea-analysis';
import type { ExtractedTransaction } from '@/ai/schemas/transactions';
import {
  generateRagAnswer,
} from '@/ai/flows/generate-rag-answer';
import type {
  GenerateRagAnswerInput,
  GenerateRagAnswerOutput,
} from '@/ai/schemas/rag-answer';
import {
  generateDprSection,
  type GenerateDprSectionInput,
  type GenerateDprSectionOutput,
} from '@/ai/flows/generate-dpr-section';
import {
  generateFinBite,
  type GenerateFinBiteOutput
} from '@/ai/flows/generate-fin-bite';
import { generateBudgetReport } from '@/ai/flows/generate-budget-report';
import type {
  GenerateBudgetReportInput,
  GenerateBudgetReportOutput,
} from '@/ai/schemas/budget-report';
import { generateTts } from '@/ai/flows/generate-tts';
import type { GenerateTtsInput, GenerateTtsOutput } from '@/ai/flows/generate-tts';
import type { AuthenticateUserInput, AuthenticateUserOutput } from '@/app/lib/auth-types';


export async function authenticateUserAction(
  input: AuthenticateUserInput
): Promise<
  | { success: true; data: AuthenticateUserOutput }
  | { success: false; error: string }
> {
  try {
    const projectId = process.env.ZOHO_PROJECT_ID;
    const authKey = process.env.ZOHO_AUTHENTICATION_FUNCTION_KEY;
    const orgId = process.env.ZOHO_CATALYST_ORG_ID;

    if (!projectId || !authKey || !orgId) {
        throw new Error("Zoho authentication credentials (Project ID, Auth Key, Org ID) are not configured in the environment.");
    }
    
    const functionUrl = `https://api.catalyst.zoho.com/baas/v1/project/${projectId}/function/user_authentication_function/execute`;

    const fetch = (await import('node-fetch')).default;
    const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ZCF-KEY': authKey,
            'CATALYST-ORG': orgId,
        },
        body: JSON.stringify(input)
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.message || 'Authentication failed.');
    }

    const result = await response.json();
    return { success: true, data: result };

  } catch (error: any) {
    console.error('Error in authenticateUserAction:', error.message);
    return {
      success: false,
      error: `Authentication failed: ${error.message}`,
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
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      error: `Failed to extract transactions: ${error.message}`,
    };
  }
}

export async function generateDashboardSummaryAction(
  transactions: ExtractedTransaction[]
): Promise<
  | { success: true; data: any }
  | { success: false; error: string }
> {
  try {
    const result = await generateDashboardSummary({ transactions });
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error in dashboard summary action:', error);
    return {
      success: false,
      error: `Failed to generate dashboard summary: ${error.message}`,
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
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      error: `Failed to generate investment idea analysis: ${error.message}`,
    };
  }
}

export async function generateRagAnswerAction(
  input: GenerateRagAnswerInput
): Promise<
  | { success: true; data: GenerateRagAnswerOutput }
  | { success: false; error: string }
> {
  try {
    const result = await generateRagAnswer(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error in generateRagAnswerAction:', error);
    return {
      success: false,
      error: `Failed to get advice from AI: ${error.message}`,
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
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      error: `Failed to generate DPR section: ${error.message}`,
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
  } catch (error: any) {
    console.error('Error generating Fin Bite:', error);
    return {
      success: false,
      error: `Failed to generate the latest update: ${error.message}`,
    };
  }
}

export async function generateBudgetReportAction(
  input: GenerateBudgetReportInput
): Promise<
  | { success: true; data: GenerateBudgetReportOutput }
  | { success: false; error: string }
> {
  try {
    const result = await generateBudgetReport(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error in budget report action:', error);
    return {
      success: false,
      error: `Failed to generate budget report: ${error.message}`,
    };
  }
}

export async function generateTtsAction(
  input: GenerateTtsInput
): Promise<
  | { success: true; data: GenerateTtsOutput }
  | { success: false; error: string }
> {
  try {
    const result = await generateTts(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error in TTS action:', error);
    return {
      success: false,
      error: `Failed to generate audio: ${error.message}`,
    };
  }
}
