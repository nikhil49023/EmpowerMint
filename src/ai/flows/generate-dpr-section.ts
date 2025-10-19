
'use server';
/**
 * @fileOverview A Genkit flow for generating a single section of a Detailed Project Report (DPR).
 *
 * - generateDprSection - A function that generates content for a specific DPR section.
 * - GenerateDprSectionInput - The input type for the generateDprSection function.
 * - GenerateDprSectionOutput - The return type for the generateDprSection function.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateDprSectionInputSchema,
  GenerateDprSectionOutputSchema,
  type GenerateDprSectionInput,
  type GenerateDprSectionOutput,
} from '@/ai/schemas/dpr';

export async function generateDprSection(
  input: GenerateDprSectionInput
): Promise<GenerateDprSectionOutput> {
  return generateDprSectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDprSectionPrompt',
  input: { schema: GenerateDprSectionInputSchema },
  output: { schema: GenerateDprSectionOutputSchema },
  prompt: `You are an expert consultant hired to write a bank-ready Detailed Project Report (DPR) for an entrepreneur in India.
Your current task is to generate the content for a specific section of the DPR.

**Promoter's Name:** {{{promoterName}}}
**Core Business Idea:** "{{{idea}}}"

{{#if previousSections}}
**Previously Completed Sections (for context):**
{{#each previousSections}}
- **{{@key}}**: {{this}}
{{/each}}
{{/if}}

{{#if revisionRequest}}
**User Revision Request:**
You have already generated a draft for the "{{targetSection}}" section. The user has requested the following changes:
- **User Feedback:** "{{revisionRequest.feedback}}"
- **Original Text:** "{{revisionRequest.originalText}}"

Your task is to **REVISE** the original text based on the user's feedback. Generate a new version of the "{{targetSection}}" section that incorporates their changes. Do not repeat the feedback. Only provide the revised content for the section.
{{else}}
**Current Task:**
Generate the content for the **"{{targetSection}}"** section of the DPR.

Make the content detailed, professional, and suitable for a banking audience. Use markdown for formatting, like **bolding** key terms.
{{/if}}

Please generate only the content for the "{{targetSection}}" section.
`,
});

const generateDprSectionFlow = ai.defineFlow(
  {
    name: 'generateDprSectionFlow',
    inputSchema: GenerateDprSectionInputSchema,
    outputSchema: GenerateDprSectionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

    