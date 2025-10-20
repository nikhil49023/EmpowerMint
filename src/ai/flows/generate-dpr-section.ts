
'use server';

/**
 * @fileOverview A Genkit flow for generating a single section of a Detailed Project Report (DPR).
 */

import { ai } from '@/ai/genkit';
import {
  GenerateDprSectionInputSchema,
  GenerateDprSectionOutputSchema,
  GenerateDprOutputSchema,
  type GenerateDprSectionInput,
  type GenerateDprSectionOutput,
} from '@/ai/schemas/dpr';
import { z } from 'zod';

export async function generateDprSection(
  input: GenerateDprSectionInput
): Promise<GenerateDprSectionOutput> {
  return generateDprSectionFlow(input);
}


// Dynamically create a schema for the requested section.
const createPrompt = (section: string) => {
    let outputSchema;
    let sectionPrompt;

    if (section.toLowerCase().replace(/ /g, '') === 'financialprojections') {
        outputSchema = z.object({ content: GenerateDprOutputSchema.shape.financialProjections });
        sectionPrompt = `
- For "Financial Projections", create detailed, credible data based on the user's input. The 'costBreakdown' and 'yearlyProjections' must be valid JSON arrays for charts.
- The output for this section MUST be a JSON object that conforms to the FinancialProjections schema.
        `;
    } else {
        outputSchema = z.object({ content: z.string() });
        sectionPrompt = `
- Generate realistic and detailed content for the requested section.
- For "Promoter Details", use the provided promoter name and generate a plausible background based on the business context.
- The output for this section MUST be a JSON object with a single key "content" containing the markdown text as a string.
        `;
    }

    return ai.definePrompt({
        name: `generateDpr${section.replace(/ /g, '')}Prompt`,
        input: { schema: GenerateDprSectionInputSchema },
        output: { schema: outputSchema },
        prompt: `You are an expert consultant hired to write a bank-ready Detailed Project Report (DPR) for an entrepreneur in India.
You have been provided with structured information about the business. Your task is to write content for ONE specific section of the DPR.

**Section to Generate:**
${section}

**Formatting Instructions:**
- Use markdown for formatting, such as **bolding** key terms.

**Input Details:**
- Promoter's Name: {{{msmeDetails.promoterName}}}
- Business Name: {{{msmeDetails.businessName}}}
- Business Type: {{{msmeDetails.businessType}}}
- Location: {{{msmeDetails.location}}}
- Project Scope: {{{projectScope}}}
- Target Market: {{{targetMarket}}}
- Financial Data: {{{financialData}}}
- Additional Information: {{{additionalInfo}}}

**Instructions for the "${section}" section:**
${sectionPrompt}

- The tone must be professional, formal, and persuasive for a banking audience.
- Ensure the output is a single, complete JSON object matching the required schema for this section. Do NOT generate any other sections.
`,
    });
}


const generateDprSectionFlow = ai.defineFlow(
  {
    name: 'generateDprSectionFlow',
    inputSchema: GenerateDprSectionInputSchema,
    outputSchema: GenerateDprSectionOutputSchema,
  },
  async input => {
    const sectionPrompt = createPrompt(input.section);
    const { output } = await sectionPrompt(input);
    return output!;
  }
);
