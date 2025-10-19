
import { z } from 'genkit';

export const GenerateInvestmentIdeaAnalysisInputSchema = z.object({
  idea: z.string().describe('The business investment idea to be analyzed.'),
});
export type GenerateInvestmentIdeaAnalysisInput = z.infer<
  typeof GenerateInvestmentIdeaAnalysisInputSchema
>;

export const GenerateInvestmentIdeaAnalysisOutputSchema = z.object({
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
