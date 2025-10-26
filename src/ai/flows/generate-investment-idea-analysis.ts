
'use server';

/**
 * @fileOverview A Genkit flow for generating a detailed analysis of a business investment idea.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateInvestmentIdeaAnalysisInputSchema,
  GenerateInvestmentIdeaAnalysisOutputSchema,
  type GenerateInvestmentIdeaAnalysisInput,
  type GenerateInvestmentIdeaAnalysisOutput,
} from '@/ai/schemas/sarvam-schemas';
import { SarvamAIClient } from 'sarvamai';

export async function generateInvestmentIdeaAnalysis(
  input: GenerateInvestmentIdeaAnalysisInput
): Promise<GenerateInvestmentIdeaAnalysisOutput> {
  return generateInvestmentIdeaAnalysisFlow(input);
}

const generateInvestmentIdeaAnalysisFlow = ai.defineFlow(
  {
    name: 'generateInvestmentIdeaAnalysisFlow',
    inputSchema: GenerateInvestmentIdeaAnalysisInputSchema,
    outputSchema: GenerateInvestmentIdeaAnalysisOutputSchema,
  },
  async ({ idea }) => {
    const userPrompt = `Your task is to provide a detailed, structured, and organized analysis of the following business idea:
"${idea}"

Your response must be a valid JSON object that covers the following sections:
1.  **title**: The name of the business idea.
2.  **summary**: A brief overview of the business concept.
3.  **investmentStrategy**: Detail the required initial investment. Include estimates for equipment, raw materials, location (if applicable), and initial operational costs. Be specific about what an entrepreneur needs to get started. Use simple, easy-to-understand language and **bold** important keywords and phrases.
4.  **targetAudience**: Describe the ideal customer for this business. Outline a basic marketing and distribution strategy suitable for an early-stage venture in India. Use simple, easy-to-understand language and **bold** important keywords and phrases.
5.  **roi**: Provide a realistic projection of potential revenue and profit. Explain the factors that influence profitability and a possible timeline to break even and achieve profitability. Use simple, easy-to-understand language and **bold** important keywords and phrases.
6.  **futureProofing**: Discuss the long-term viability of the business. Cover aspects like scalability, potential for product diversification, market trends, and a competitive landscape. Use simple, easy-to-understand language and **bold** important keywords and phrases.
7.  **relevantSchemes**: Identify 2-3 relevant Indian government schemes (e.g., Startup India, MUDRA, CGTMSE) that could support this business. For each scheme, briefly explain its benefits and eligibility criteria. Use simple, easy-to-understand language and **bold** important keywords and phrases.

Provide only the JSON object in your response.`;

    try {
      const client = new SarvamAIClient({
        apiSubscriptionKey: process.env.SARVAM_API_KEY,
      });

      const response = await client.chat.completions({
        model: 'sarvam-2b-v0.3',
        messages: [
          { role: 'system', content: 'You are "FIn-Box," a specialized financial mentor for early-stage entrepreneurs in India.' },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Received empty content from AI service.');
      }
      
      // The response might be wrapped in markdown, so let's clean it.
      const jsonString = content.replace(/```json\n|```/g, '').trim();
      const jsonResponse = JSON.parse(jsonString);

      const validationResult =
        GenerateInvestmentIdeaAnalysisOutputSchema.safeParse(jsonResponse);

      if (!validationResult.success) {
        console.error(
          'SarvamAI response did not match Zod schema:',
          validationResult.error.flatten()
        );
        throw new Error('Received malformed data from AI service.');
      }

      return validationResult.data;
    } catch (e: any) {
      console.error('Failed to process SarvamAI response:', e.message);
      // Log the raw content for debugging if it exists
      if (e instanceof SyntaxError) {
          console.error("Raw content from AI:", (await new SarvamAIClient({apiSubscriptionKey: process.env.SARVAM_API_KEY}).chat.completions({model: 'sarvam-2b-v0.3', messages: [{role:'user', content: userPrompt}], max_tokens: 4000, temperature: 0.7})).choices[0]?.message?.content);
      }
      throw new Error(
        `An error occurred while processing the AI response: ${e.message}`
      );
    }
  }
);
