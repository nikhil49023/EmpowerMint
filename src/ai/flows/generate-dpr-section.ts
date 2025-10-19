
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

**Formatting Instructions:**
- Use markdown for formatting, like **bolding** key terms.
- For any data that is a placeholder or requires user input (like names, specific numbers, dates), wrap it in VAR{...}. For example: VAR{[Your Company Name]}, VAR{(x) months}.

**Promoter's Name:** {{{promoterName}}}
**Core Business Idea:** "{{{idea}}}"

{{#if variables}}
**User-Defined Variables (Use these values where appropriate):**
{{#each variables}}
- **{{@key}}**: {{this}}
{{/each}}
{{/if}}

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

Your task is to **REVISE** the original text based on the user's feedback. Generate a new version of the "{{targetSection}}" section that incorporates their changes. Do not repeat the feedback. Only provide the revised content for the section, following all formatting instructions.
{{else}}
**Current Task:**
Generate the content for the **"{{targetSection}}"** section of the DPR. Make the content detailed, professional, and suitable for a banking audience. Follow all formatting instructions.
{{/if}}

**If the "{{targetSection}}" is "Financial Projections", you MUST follow these special instructions:**
Your output for the 'content' field MUST be a single, valid, stringified JSON object. Do NOT include any markdown, introductory text, code fences (\`\`\`), or anything outside of the pure JSON structure. The entire 'content' output must be parsable with JSON.parse().
The JSON object must have the following structure:
{
  "summaryText": "A brief summary of the financial outlook in markdown format.",
  "projectCost": "Breakdown of total project costs in markdown format.",
  "meansOfFinance": "How the project will be financed (equity, debt) in markdown format.",
  "costBreakdown": [ { "name": "Item 1", "value": 100000 }, { "name": "Item 2", "value": 200000 } ],
  "yearlyProjections": [ { "year": "Year 1", "sales": 500000, "profit": 50000 }, { "year": "Year 2", "sales": 1000000, "profit": 200000 } ],
  "profitabilityAnalysis": "Analysis of profitability in markdown format.",
  "cashFlowStatement": "Projected cash flow statement in markdown format.",
  "loanRepaymentSchedule": "Loan repayment schedule in markdown format.",
  "breakEvenAnalysis": "Break-even point analysis in markdown format."
}
Generate detailed, credible data for all fields within this JSON structure.

**Otherwise, for all other sections,** please generate only the content for the "{{targetSection}}" section as a markdown-formatted string.
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
