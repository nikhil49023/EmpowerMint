
'use server';

/**
 * @fileOverview A Genkit flow for generating a detailed analysis of a business investment idea.
 *
 * This flow takes a business idea as input and returns a structured analysis covering
 * investment strategy, target audience, ROI, and future-proofing.
 * - generateInvestmentIdeaAnalysis - A function that generates the analysis.
 * - GenerateInvestmentIdeaAnalysisInput - The input type for the function.
 * - GenerateInvestmentIdeaAnalysisOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateInvestmentIdeaAnalysisInputSchema,
  GenerateInvestmentIdeaAnalysisOutputSchema,
  type GenerateInvestmentIdeaAnalysisInput,
  type GenerateInvestmentIdeaAnalysisOutput,
} from '@/ai/schemas/investment-idea-analysis';
import { SarvamAIClient } from 'sarvamai';

// Initialize the SarvamAI client
const sarvamClient = new SarvamAIClient({
  apiSubscriptionKey: 'sk_rwksevkv_TwVnTobosDGGrfIGl7bvxhg6',
});

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

    // Call SarvamAI's text generation endpoint
    const response = await sarvamClient.text.completions.create({
      model: 'Open-Hathi-7B-v0.1-Base',
      prompt: prompt,
      max_tokens: 2048, // Increased tokens for a more detailed analysis
      temperature: 0.3,
    });

    try {
      // The model's response text needs to be parsed as JSON.
      const jsonResponse = JSON.parse(response.choices[0].text);
      
      // Validate the parsed JSON against our output schema.
      const validationResult = GenerateInvestmentIdeaAnalysisOutputSchema.safeParse(jsonResponse);
      
      if (!validationResult.success) {
        console.error("SarvamAI response did not match Zod schema:", validationResult.error);
        throw new Error("Received malformed data from AI service.");
      }

      return validationResult.data;
    } catch (e) {
      console.error("Failed to parse or validate SarvamAI response:", e);
      throw new Error("An error occurred while processing the AI response.");
    }
  }
);
