
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
    // Construct a detailed prompt for SarvamAI
    const prompt = `You are "FIn-Box," a specialized financial mentor for early-stage entrepreneurs in India.

Your task is to provide a detailed, structured, and organized analysis of the following business idea:
"${idea}"

Your response must be a valid JSON object that covers the following sections:
1.  **title**: The name of the business idea.
2.  **summary**: A brief overview of the business concept.
3.  **investmentStrategy**: Detail the required initial investment. Include estimates for equipment, raw materials, location (if applicable), and initial operational costs. Be specific about what an entrepreneur needs to get started. Use simple, easy-to-understand language and **bold** important keywords and phrases.
4.  **targetAudience**: Describe the ideal customer for this business. Outline a basic marketing and distribution strategy suitable for an early-stage venture in India. Use simple, easy-to-understand language and **bold** important keywords and phrases.
5.  **roi**: Provide a realistic projection of potential revenue and profit. Explain the factors that influence profitability and a possible timeline to break even and achieve profitability. Use simple, easy-to-understand language and **bold** important keywords and phrases.
6.  **futureProofing**: Discuss the long-term viability of the business. Cover aspects like scalability, potential for product diversification, market trends, and a competitive landscape. Use simple, easy-to-understand language and **bold** important keywords and phrases.
7.  **relevantSchemes**: Identify 2-3 relevant Indian government schemes (e.g., Startup India, MUDRA, CGTMSE) that could support this business. For each scheme, briefly explain its benefits and eligibility criteria. Use simple, easy-to-understand language and **bold** important keywords and phrases.

The tone should be encouraging, clear, and practical, providing actionable insights for an aspiring entrepreneur. 
Provide only the JSON object in your response.`;

    try {
      const response = await fetch('https://api.sarvam.ai/text-generation/v1/chat-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SARVAM_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'sarvam-2b-v0.3',
          messages: [{ role: 'system', content: prompt }],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("SarvamAI API request failed:", response.status, errorBody);
        throw new Error(`SarvamAI API request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      const content = responseData.choices[0]?.message?.content;

      if (!content) {
        throw new Error("Received empty content from AI service.");
      }
      
      const jsonResponse = JSON.parse(content);
      const validationResult = GenerateInvestmentIdeaAnalysisOutputSchema.safeParse(jsonResponse);
      
      if (!validationResult.success) {
        console.error("SarvamAI response did not match Zod schema:", validationResult.error.flatten());
        throw new Error("Received malformed data from AI service.");
      }

      return validationResult.data;
    } catch (e: any) {
      console.error("Failed to process SarvamAI response:", e.message);
      throw new Error(`An error occurred while processing the AI response: ${e.message}`);
    }
  }
);
