
'use server';

/**
 * @fileOverview A Genkit flow for generating a full Detailed Project Report (DPR)
 * from a pre-existing business idea analysis.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateDprFromAnalysisInputSchema,
  GenerateDprFromAnalysisOutputSchema,
  type GenerateDprFromAnalysisInput,
  type GenerateDprFromAnalysisOutput,
} from '@/ai/schemas/dpr';

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
