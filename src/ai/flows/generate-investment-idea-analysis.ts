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
import { z } from 'genkit';

const GenerateInvestmentIdeaAnalysisInputSchema = z.object({
  idea: z.string().describe('The business investment idea to be analyzed.'),
});
export type GenerateInvestmentIdeaAnalysisInput = z.infer<
  typeof GenerateInvestmentIdeaAnalysisInputSchema
>;

const GenerateInvestmentIdeaAnalysisOutputSchema = z.object({
  title: z.string().describe('The title of the business idea.'),
  summary: z.string().describe('A brief summary of the business idea.'),
  investmentStrategy: z
    .string()
    .describe(
      'A detailed investment strategy, including initial capital, equipment, and operational costs.'
    ),
  targetAudience: z
    .string()
    .describe(
      'A description of the target audience and marketing strategy for the business.'
    ),
  roi: z
    .string()
    .describe(
      'An analysis of the potential Return on Investment (ROI), including revenue projections and profitability.'
    ),
  futureProofing: z
    .string()
    .describe(
      'An analysis of the future-proofing of the business, including scalability, competition, and market trends.'
    ),
});
export type GenerateInvestmentIdeaAnalysisOutput = z.infer<
  typeof GenerateInvestmentIdeaAnalysisOutputSchema
>;

export async function generateInvestmentIdeaAnalysis(
  input: GenerateInvestmentIdeaAnalysisInput
): Promise<GenerateInvestmentIdeaAnalysisOutput> {
  return generateInvestmentIdeaAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInvestmentIdeaAnalysisPrompt',
  input: { schema: GenerateInvestmentIdeaAnalysisInputSchema },
  output: { schema: GenerateInvestmentIdeaAnalysisOutputSchema },
  prompt: `You are "Uplift AI," a specialized financial mentor for early-stage entrepreneurs in India.

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
  
  **Formatting instructions**:
  - Use simple, easy-to-understand language.
  - Use markdown to **bold** important keywords and phrases.
  - When mentioning any currency amount, wrap it in the format \`CURRENCY{...\}\`. For example, instead of "INR 50,000", write "CURRENCY{INR 50,000}".

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
