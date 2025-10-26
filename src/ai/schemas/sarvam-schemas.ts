
import { z } from 'genkit';
import { ExtractedTransactionSchema } from './transactions';

// Schemas for Investment Idea Analysis
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
  relevantSchemes: z
    .string()
    .describe(
      'A summary of 2-3 relevant Indian government schemes or policies that could support this type of business. Include what the scheme offers and who is eligible.'
    ),
});
export type GenerateInvestmentIdeaAnalysisOutput = z.infer<
  typeof GenerateInvestmentIdeaAnalysisOutputSchema
>;


// Schemas for Budget Report
export const GenerateBudgetReportInputSchema = z.object({
  transactions: z
    .array(ExtractedTransactionSchema)
    .describe('An array of financial transactions, primarily expenses.'),
});
export type GenerateBudgetReportInput = z.infer<typeof GenerateBudgetReportInputSchema>;

export const GenerateBudgetReportOutputSchema = z.object({
  summary: z.string().describe('An AI-generated summary and analysis of the spending habits, suitable for including in a report for IT returns.'),
  expenseBreakdown: z
    .array(z.object({ name: z.string(), value: z.number() }))
    .describe('A JSON array of expense categories and their total amounts for a pie chart. The name should be the category and value should be the total expense for that category.'),
});
export type GenerateBudgetReportOutput = z.infer<typeof GenerateBudgetReportOutputSchema>;
