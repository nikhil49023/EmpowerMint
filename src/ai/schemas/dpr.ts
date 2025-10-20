
import { z } from 'genkit';

const MsmeDetailsSchema = z.object({
  promoterName: z.string().describe("The entrepreneur's name."),
  businessName: z.string().describe('The name of the business/project.'),
  businessType: z.string().describe('The type of business (e.g., Manufacturing, Service).'),
  location: z.string().describe('The proposed city/state for the business.'),
});

// Schema for the full, monolithic DPR generation.
export const GenerateDprInputSchema = z.object({
  msmeDetails: MsmeDetailsSchema,
  projectScope: z.string().describe("A definition of the project's scope, objectives, and deliverables."),
  targetMarket: z.string().describe('A description of the target market, customer segments, and competition.'),
  financialData: z.string().describe('A summary of financial data, including estimated startup costs, funding sources, and revenue projections.'),
  additionalInfo: z.string().describe('Any other relevant information, unique selling propositions, or specific details.'),
});
export type GenerateDprInput = z.infer<typeof GenerateDprInputSchema>;

const FinancialProjectionsSchema = z.object({
  summaryText: z
    .string()
    .describe('A brief summary of the financial outlook in markdown format.'),
  projectCost: z.string().describe('Breakdown of total project costs in markdown format.'),
  meansOfFinance: z
    .string()
    .describe('How the project will be financed (equity, debt) in markdown format.'),
  costBreakdown: z
    .array(z.object({ name: z.string(), value: z.number() }))
    .describe('A JSON array for a pie chart of cost breakdown.'),
  yearlyProjections: z
    .array(z.object({ year: z.string(), sales: z.number(), profit: z.number() }))
    .describe('A JSON array for a bar chart of yearly sales and profit.'),
  profitabilityAnalysis: z.string().describe('Analysis of profitability in markdown format.'),
  cashFlowStatement: z.string().describe('Projected cash flow statement in markdown format.'),
  loanRepaymentSchedule: z.string().describe('Loan repayment schedule in markdown format.'),
  breakEvenAnalysis: z.string().describe('Break-even point analysis in markdown format.'),
});

export const GenerateDprOutputSchema = z.object({
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
export type GenerateDprOutput = z.infer<
  typeof GenerateDprOutputSchema
>;
