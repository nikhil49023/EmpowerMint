
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
  // By using a fine-tuned model, the prompt can be much shorter and more direct,
  // as the model has already learned the desired output structure.
  // This significantly reduces the number of input tokens for each API call.
  prompt: `Generate a bank-ready Detailed Project Report (DPR) for an Indian entrepreneur.
  
  **Business Idea**: "{{{idea}}}"
  **Promoter Name**: {{#if userName}}"{{userName}}"{{else}}Not provided{{/if}}
  `,
  // Once fine-tuned in Vertex AI, you would replace the general model
  // with your custom model's unique endpoint ID.
  model: 'tunedModels/your-custom-dpr-model-id',
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
