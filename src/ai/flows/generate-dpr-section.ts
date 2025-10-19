
'use server';

/**
 * @fileOverview A Genkit flow for generating a single section of a Detailed Project Report (DPR).
 *
 * - generateDprSection - A function that generates or revises a single DPR section.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateDprSectionInputSchema,
  type GenerateDprSectionInput,
  GenerateDprSectionOutputSchema,
  type GenerateDprSectionOutput,
} from '@/ai/schemas/dpr';

// Export the main function that the server action will call
export async function generateDprSection(
  input: GenerateDprSectionInput
): Promise<GenerateDprSectionOutput> {
  return generateDprSectionFlow(input);
}

// Define the prompt for the AI model
const prompt = ai.definePrompt({
  name: 'generateDprSectionPrompt',
  input: { schema: GenerateDprSectionInputSchema },
  output: { schema: GenerateDprSectionOutputSchema },
  prompt: `You are "FIn-Box," an expert business consultant helping an entrepreneur in India build a bank-ready Detailed Project Report (DPR).

The user's overall project details are: "{{{idea}}}"

{{#if previousSections}}
We have already completed the following sections:
{{#each previousSections}}
### {{this.title}}
{{{this.content}}}
---
{{/each}}
{{/if}}

Your current task is to **generate the content for the "{{sectionTitle}}" section**.

Analyze the conversation history and the previously completed sections to generate a detailed, comprehensive, and professionally written draft for the "{{sectionTitle}}" section. The content should be suitable for a formal bank loan application in India.

After generating the section content, provide a concise follow-up question to the user. The question should be something like: "Here is a draft for the {{sectionTitle}}. Please review it. Are there any changes you'd like to make, or shall we proceed to the next section?"

Conversation History:
{{#each history}}
- {{this.role}}: {{this.text}}
{{/each}}

Based on all the information above, generate the content for the "{{sectionTitle}}" section and the follow-up question.`,
});

// Define the main Genkit flow
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
