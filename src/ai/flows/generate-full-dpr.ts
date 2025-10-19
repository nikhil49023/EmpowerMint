
'use server';

/**
 * @fileOverview A Genkit flow for generating a full Detailed Project Report (DPR) from a business idea.
 *
 * - generateFullDpr - A function that generates a complete DPR.
 * - GenerateFullDprInput - The input type for the function.
 * - GenerateFullDprOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFullDprInputSchema = z.object({
  idea: z.string().describe('The core business idea to be fleshed out into a DPR.'),
  userName: z.string().optional().describe('The name of the promoter/founder.'),
  userEmail: z.string().optional().describe('The email of the promoter/founder.'),
});
export type GenerateFullDprInput = z.infer<typeof GenerateFullDprInputSchema>;

const GenerateFullDprOutputSchema = z.object({
  executiveSummary: z.string().describe('1. Executive Summary: A concise overview of the entire project, including the business concept, objectives, key financial highlights, and promoter details. This should be a compelling summary that captures the essence of the business plan.'),
  projectIntroduction: z.string().describe('2. Project Introduction & Objective: A detailed introduction to the project, its mission, vision, and specific, measurable objectives.'),
  promoterDetails: z.string().describe('3. Promoter/Entrepreneur Profile: Detailed background of the promoter(s), including qualifications, relevant experience, and team details. Should inspire confidence in their ability to execute the project.'),
  businessModel: z.string().describe('4. Business Model & Project Details: A comprehensive description of the product or service, the unique selling proposition (USP), and how the business will create, deliver, and capture value.'),
  marketAnalysis: z.string().describe('5. Market Analysis: In-depth analysis of the industry, market size, demand and supply scenario, target customer profile, growth prospects, and a thorough competitor analysis.'),
  locationAndSite: z.string().describe('6. Location and Site Analysis: Details about the chosen site, its suitability, location advantages (like proximity to raw materials, markets), and ownership details (rented/owned).'),
  technicalFeasibility: z.string().describe('7. Technical Feasibility & Infrastructure: A description of the project layout, technology used, machinery and equipment required, raw material sourcing, and utility requirements (power, water).'),
  implementationSchedule: z.string().describe('8. Implementation Schedule & Project Timeline: A realistic, phased timeline for project implementation from conception to commencement of operations.'),
  financialProjections: z.object({
    summaryText: z.string().describe('A text summary analyzing the overall financial plan, including project cost, funding sources, revenue projections, and profitability.'),
    projectCost: z.string().describe('Detailed breakdown of the estimated total project cost, including capital expenditure and working capital.'),
    meansOfFinance: z.string().describe('The proposed means of financing the project, detailing the mix of equity from promoters, bank loans, and any subsidies.'),
    costBreakdown: z.array(z.object({ name: z.string(), value: z.number() })).describe('An array of objects representing the project cost breakdown for a pie chart. Example: [{ "name": "Machinery", "value": 500000 }, { "name": "Working Capital", "value": 200000 }]'),
    yearlyProjections: z.array(z.object({ year: z.string(), sales: z.number(), profit: z.number() })).describe('An array of objects for projected sales and profit over 3-5 years. Example: [{ "year": "Year 1", "sales": 1000000, "profit": 200000 }]'),
    profitabilityAnalysis: z.string().describe('Detailed profitability statement projecting revenues, costs, and profits for the next 3-5 years.'),
    cashFlowStatement: z.string().describe('Projected cash flow statement for 3-5 years, showing the movement of cash in and out of the business.'),
    loanRepaymentSchedule: z.string().describe('A detailed schedule showing the repayment of the proposed bank loan with interest over the loan tenure.'),
    breakEvenAnalysis: z.string().describe('Calculation and analysis of the break-even point for the business.'),
  }).describe('9. Financial Projections: Comprehensive financial plan including costs, funding, revenue, profit, cash flow, and loan repayment feasibility.'),
  swotAnalysis: z.string().describe('10. SWOT Analysis: A strategic analysis of the project\'s Strengths, Weaknesses, Opportunities, and Threats.'),
  regulatoryCompliance: z.string().describe('11. Regulatory & Statutory Compliance: A list of all required licenses, registrations (e.g., GST, MSME), and legal compliances for the business.'),
  riskAssessment: z.string().describe('12. Risk Assessment & Mitigation Strategy: Identification of potential business risks (market, operational, financial) and well-defined strategies to mitigate them.'),
  annexures: z.string().describe('13. Annexures: A summary list of supporting documents that would be attached, such as promoter CVs, quotations for machinery, site maps, etc. Do not generate the documents themselves, just list what would be included.'),
});
export type GenerateFullDprOutput = z.infer<typeof GenerateFullDprOutputSchema>;

export async function generateFullDpr(
  input: GenerateFullDprInput
): Promise<GenerateFullDprOutput> {
  return generateFullDprFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFullDprPrompt',
  input: { schema: GenerateFullDprInputSchema },
  output: { schema: GenerateFullDprOutputSchema },
  prompt: `You are an expert business consultant specializing in creating bank-ready Detailed Project Reports (DPRs) for Indian MSMEs and startups.
  
  Your task is to generate a comprehensive, detailed, and lengthy (40-80 pages in equivalent content) DPR. The report must be structured professionally and contain in-depth analysis and realistic projections for each section. Ensure all financial data is plausible for a business of this nature in India.

  **Business Idea**: "{{{idea}}}"
  **Promoter Name**: {{#if userName}}"{{userName}}"{{else}}Not provided{{/if}}

  Generate the full DPR based on the provided output schema. Each section must be thoroughly detailed.
  `,
});

const generateFullDprFlow = ai.defineFlow(
  {
    name: 'generateFullDprFlow',
    inputSchema: GenerateFullDprInputSchema,
    outputSchema: GenerateFullDprOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
