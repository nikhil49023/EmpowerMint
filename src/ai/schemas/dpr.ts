import { z } from 'genkit';
import { GenerateInvestmentIdeaAnalysisOutputSchema } from './investment-idea-analysis';

const RevisionRequestSchema = z.object({
  originalText: z.string().describe('The original text of the section.'),
  feedback: z.string().describe("The user's feedback for revision."),
});

export const GenerateDprSectionInputSchema = z.object({
  idea: z.string().describe('The core business idea.'),
  promoterName: z.string().describe("The entrepreneur's name."),
  targetSection: z
    .string()
    .describe('The specific DPR section to be generated.'),
  previousSections: z
    .record(z.string())
    .optional()
    .describe(
      'A map of previously completed sections and their content for context.'
    ),
  variables: z
    .record(z.string())
    .optional()
    .describe('A map of user-defined values for placeholders.'),
  revisionRequest: RevisionRequestSchema.optional().describe(
    'A request to revise the section based on user feedback.'
  ),
});

export const GenerateDprSectionOutputSchema = z.object({
  content: z
    .string()
    .describe('The generated content for the specified DPR section.'),
});

export type GenerateDprSectionInput = z.infer<
  typeof GenerateDprSectionInputSchema
>;
export type GenerateDprSectionOutput = z.infer<
  typeof GenerateDprSectionOutputSchema
>;

// Schema for the full, monolithic DPR generation.
export const GenerateDprFromAnalysisInputSchema = z.object({
  analysis: GenerateInvestmentIdeaAnalysisOutputSchema.describe(
    'The detailed analysis of the business idea.'
  ),
  promoterName: z.string().describe('The name of the promoter/entrepreneur.'),
});
export type GenerateDprFromAnalysisInput = z.infer<
  typeof GenerateDprFromAnalysisInputSchema
>;

const FinancialProjectionsSchema = z.object({
  summaryText: z
    .string()
    .describe('A brief summary of the financial outlook.'),
  projectCost: z.string().describe('Breakdown of total project costs.'),
  meansOfFinance: z
    .string()
    .describe('How the project will be financed (equity, debt).'),
  costBreakdown: z
    .array(z.object({ name: z.string(), value: z.number() }))
    .describe('A JSON array for a pie chart of cost breakdown.'),
  yearlyProjections: z
    .array(z.object({ year: z.string(), sales: z.number(), profit: z.number() }))
    .describe('A JSON array for a bar chart of yearly sales and profit.'),
  profitabilityAnalysis: z.string().describe('Analysis of profitability.'),
  cashFlowStatement: z.string().describe('Projected cash flow statement.'),
  loanRepaymentSchedule: z.string().describe('Loan repayment schedule.'),
  breakEvenAnalysis: z.string().describe('Break-even point analysis.'),
});

export const GenerateDprFromAnalysisOutputSchema = z.object({
  executiveSummary: z.string(),
  projectIntroduction: z.string(),
  promoterDetails: z.string(),
  businessModel: z.string(),
  marketAnalysis: z.string(),
  locationAndSite: z.string(),
  technicalFeasibility: z.string(),
  implementationSchedule: z.string(),
  financialProjections: FinancialProjectionsSchema,
  swotAnalysis: z.string(),
  regulatoryCompliance: z.string(),
  riskAssessment: z.string(),
  annexures: z.string(),
});
export type GenerateDprFromAnalysisOutput = z.infer<
  typeof GenerateDprFromAnalysisOutputSchema
>;
