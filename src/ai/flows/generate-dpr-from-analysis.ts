
'use server';

/**
 * @fileOverview A Genkit flow for generating a full Detailed Project Report (DPR)
 * from a pre-existing business idea analysis.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateDprInputSchema,
  GenerateDprOutputSchema,
  type GenerateDprInput,
  type GenerateDprOutput,
} from '@/ai/schemas/dpr';

export async function generateDpr(
  input: GenerateDprInput
): Promise<GenerateDprOutput> {
  return generateDprFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDprPrompt',
  input: { schema: GenerateDprInputSchema },
  output: { schema: GenerateDprOutputSchema },
  prompt: `You are an expert consultant hired to write a bank-ready Detailed Project Report (DPR) for an entrepreneur in India.
You have been provided with structured information about the business. Your task is to expand this into a comprehensive, bank-ready DPR of approximately 40 pages.

**Formatting Instructions:**
- Use markdown for formatting, such as **bolding** key terms.

**MSME Details:**
- Promoter's Name: {{{msmeDetails.promoterName}}}
- Business Name: {{{msmeDetails.businessName}}}
- Business Type: {{{msmeDetails.businessType}}}
- Location: {{{msmeDetails.location}}}

**Project Scope:**
{{{projectScope}}}

**Target Market:**
{{{targetMarket}}}

**Financial Data:**
{{{financialData}}}

**Additional Information:**
{{{additionalInfo}}}


**Instructions:**
- Elaborate on each point from the provided details to create detailed chapters for the DPR.
- Generate realistic and detailed content for ALL sections defined in the output schema.
- For "Promoter Details", use the provided promoter name and generate a plausible background based on the business context.
- For "Financial Projections", create detailed, credible data based on the user's input. The 'costBreakdown' and 'yearlyProjections' must be valid JSON arrays for charts.
- The tone must be professional, formal, and persuasive for a banking audience.
- Ensure the output is a single, complete JSON object matching the required schema.
`,
});

const generateDprFlow = ai.defineFlow(
  {
    name: 'generateDprFlow',
    inputSchema: GenerateDprInputSchema,
    outputSchema: GenerateDprOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
