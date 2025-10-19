
'use server';

/**
 * @fileOverview A Genkit flow for generating a full Detailed Project Report (DPR)
 * from a pre-existing business idea analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GenerateInvestmentIdeaAnalysisOutputSchema } from '../schemas/investment-idea-analysis';

// Input: The full analysis object and the promoter's name.
export const GenerateDprFromAnalysisInputSchema = z.object({
  analysis: GenerateInvestmentIdeaAnalysisOutputSchema.describe(
    'The detailed analysis of the business idea.'
  ),
  promoterName: z.string().describe('The name of the promoter/entrepreneur.'),
});
export type GenerateDprFromAnalysisInput = z.infer<
  typeof GenerateDprFromAnalysisInputSchema
>;

// Output: A structured, multi-chapter DPR.
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

export async function generateDprFromAnalysis(
  input: GenerateDprFromAnalysisInput
): Promise<GenerateDprFromAnalysisOutput> {
  return generateDprFromAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDprFromAnalysisPrompt',
  input: { schema: GenerateDprFromAnalysisInputSchema },
  output: { schema: GenerateDprFromAnalysisOutputSchema },
  prompt: `You are an expert consultant hired to write a bank-ready Detailed Project Report (DPR) for an entrepreneur in India.
You have been provided with a preliminary analysis of the business idea. Your task is to expand this analysis into a comprehensive, 40-80 page DPR suitable for obtaining an MSME or startup loan.

**Promoter's Name:** {{{promoterName}}}

**Core Business Idea Analysis:**
- **Title**: {{{analysis.title}}}
- **Summary**: {{{analysis.summary}}}
- **Investment Strategy**: {{{analysis.investmentStrategy}}}
- **Target Audience**: {{{analysis.targetAudience}}}
- **Return on Investment (ROI)**: {{{analysis.roi}}}
- **Future Proofing**: {{{analysis.futureProofing}}}

**Instructions:**
- Elaborate on each point from the analysis to create detailed chapters for the DPR.
- Generate realistic and detailed content for ALL sections defined in the output schema.
- For "Promoter Details", use the provided promoter name and generate a plausible background.
- For "Financial Projections", create detailed, credible data. The 'costBreakdown' and 'yearlyProjections' must be valid JSON arrays for charts.
- The tone must be professional, formal, and persuasive for a banking audience.
- Use markdown for formatting, such as **bolding** key terms.
- Ensure the output is a single, complete JSON object matching the required schema.
`,
});

const generateDprFromAnalysisFlow = ai.defineFlow(
  {
    name: 'generateDprFromAnalysisFlow',
    inputSchema: GenerateDprFromAnalysisInputSchema,
    outputSchema: GenerateDprFromAnalysisOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
