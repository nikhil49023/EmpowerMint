
'use server';

/**
 * @fileOverview A Genkit flow for generating a detailed analysis of a business investment idea.
 *
 * This flow takes a business idea as input and returns a structured analysis covering
 * investment strategy, target audience, ROI, and future-proofing.
 * - generateInvestmentIdeaAnalysis - A function that generates the analysis.
 * - GenerateInvestmentIdeaAnalysisInput - The input type for the function.
 * - GenerateInvestmentIdeaAnalysisOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateInvestmentIdeaAnalysisInputSchema,
  GenerateInvestmentIdeaAnalysisOutputSchema,
  type GenerateInvestmentIdeaAnalysisInput,
  type GenerateInvestmentIdeaAnalysisOutput,
} from '@/ai/schemas/investment-idea-analysis';

export async function generateInvestmentIdeaAnalysis(
  input: GenerateInvestmentIdeaAnalysisInput
): Promise<GenerateInvestmentIdeaAnalysisOutput> {
  return generateInvestmentIdeaAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInvestmentIdeaAnalysisPrompt',
  input: { schema: GenerateInvestmentIdeaAnalysisInputSchema },
  output: { schema: GenerateInvestmentIdeaAnalysisOutputSchema },
  prompt: `You are "FIn-Box," a specialized financial mentor for early-stage entrepreneurs in India.

  Your task is to provide a detailed, structured, and organized analysis of the following business idea:
  "{{{idea}}}"

  The analysis must be comprehensive and cover the following sections:
  1.  **Title**: The name of the business idea.
  2.  **Summary**: A brief overview of the business concept.
  3.  **Investment Strategy**: Detail the required initial investment. Include estimates for equipment, raw materials, location (if applicable), and initial operational costs. Be specific about what an entrepreneur needs to get started.
  4.  **Target Audience**: Describe the ideal customer for this business. Outline a basic marketing and distribution strategy suitable for an early-stage venture in India.
  5.  **Return on Investment (ROI)**: Provide a realistic projection of potential revenue and profit. Explain the factors that influence profitability and a possible timeline to break even and achieve profitability.
  6.  **Future Proofing**: Discuss the long-term viability of the business. Cover aspects like scalability, potential for product diversification, market trends, and a competitive landscape.

  Your tone should be encouraging, clear, and practical, providing actionable insights for an aspiring entrepreneur. 
  
  Use simple, easy-to-understand language and **bold** important keywords and phrases.

  Ensure the output is in the specified JSON format.`,
});

const generateInvestmentIdeaAnalysisFlow = ai.defineFlow(
  {
    name: 'generateInvestmentIdeaAnalysisFlow',
    inputSchema: GenerateInvestmentIdeaAnalysisInputSchema,
    outputSchema: GenerateInvestmentIdeaAnalysisOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
