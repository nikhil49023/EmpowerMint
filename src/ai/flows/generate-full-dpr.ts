
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
  executiveSummary: z.string().describe('A brief overview of the business idea, objectives, and project highlights.'),
  promoterDetails: z.string().describe('Background, experience, and education of the founder.'),
  businessProfile: z.string().describe('Details on the type of enterprise, products/services, and market need.'),
  marketAnalysis: z.string().describe('Analysis of the target market, customer profile, local demand, competition, and marketing strategy.'),
  operationalPlan: z.string().describe('Description of the production process, required machinery, raw materials, location, and workforce.'),
  legalRequirements: z.string().describe('A list of required licenses, registrations, and compliances (e.g., GST, MSME).'),
  financialProjections: z.object({
    summaryText: z.string().describe('A text summary analyzing total project cost, funding, costs, and profit projections.'),
    costBreakdown: z.array(z.object({ name: z.string(), value: z.number() })).describe('An array of objects representing the project cost breakdown for a pie chart. Example: [{ "name": "Machinery", "value": 500000 }, { "name": "Working Capital", "value": 200000 }]'),
    yearlyProjections: z.array(z.object({ year: z.string(), sales: z.number(), profit: z.number() })).describe('An array of objects for projected sales and profit over 3-5 years. Example: [{ "year": "Year 1", "sales": 1000000, "profit": 200000 }]'),
  }).describe('Detailed financial projections including text summary and data for charts.'),
  swotAnalysis: z.string().describe('An analysis of the Strengths, Weaknesses, Opportunities, and Threats for the business.'),
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
  prompt: `You are "FIn-Box," a professional business consultant specializing in creating bank-ready Detailed Project Reports (DPRs) for Indian entrepreneurs.

Your task is to generate a comprehensive, well-structured, and realistic DPR based on the provided business idea and promoter details. Use markdown for formatting, including **bolding** key terms and using bullet points for lists.

**Business Idea**: "{{{idea}}}"
**Promoter Name**: {{#if userName}}"{{userName}}"{{else}}Not provided{{/if}}

Generate a detailed report covering the following sections. Be thorough and practical.

1.  **Executive Summary**: A concise and compelling overview of the business, its objectives, and key highlights.
2.  **Promoter/Owner Details**: Write a brief professional profile for the promoter. If a name is provided, use it. Infer potential strengths based on the business idea (e.g., if it's a tech idea, assume some technical acumen).
3.  **Business Profile**: Define the type of enterprise (manufacturing, service, or trading). Detail the products or services. Explain the unique value proposition and the market need it addresses.
4.  **Market Analysis**: Identify the target market and customer profile. Analyze local demand and competition. Propose a practical marketing and sales strategy for an early-stage business in India.
5.  **Technical/Operational Plan**: Describe the operational workflow. List potential machinery, equipment, and raw materials needed. Suggest location requirements and estimate the initial workforce.
6.  **Legal & Statutory Requirements**: List the essential licenses and registrations required to operate this business in India (e.g., GST Registration, MSME/Udyam Registration, FSSAI license if applicable, etc.).
7.  **Financial Projections**: This section is critical.
    - First, provide a **text summary** analyzing the total project cost, funding sources, a high-level cost breakup, and projected sales and profitability.
    - Second, provide a structured JSON array for the **cost breakdown** suitable for a pie chart. Use realistic categories like 'Machinery & Equipment', 'Raw Materials (First Batch)', 'Rent Deposit', 'Working Capital', etc. All values must be numbers.
    - Third, provide a structured JSON array for **yearly projections** (3 to 5 years) suitable for a bar chart. Include 'year', 'sales' (revenue), and 'profit'. All values must be numbers.
8.  **SWOT Analysis**: Conduct a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for the business idea.

Your output must be in the specified JSON format.
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
