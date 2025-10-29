
'use server';

/**
 * @fileOverview This file defines a function for generating investment idea analysis using Sarvam AI.
 */

import type {
  GenerateInvestmentIdeaAnalysisInput,
  GenerateInvestmentIdeaAnalysisOutput,
} from '@/ai/schemas/investment-idea-analysis';
import fetch from 'node-fetch';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const API_URL = 'https://api.sarvam.ai/v1/chat/completions';

export async function generateInvestmentIdeaAnalysis(
  input: GenerateInvestmentIdeaAnalysisInput
): Promise<GenerateInvestmentIdeaAnalysisOutput> {
  const prompt = `You are a specialized financial mentor for early-stage entrepreneurs in India.
Your task is to provide a detailed, structured, and organized analysis of the following business idea:
"${input.idea}"

CRITICAL: You MUST output ONLY a valid JSON object that conforms to the specified output schema. Do not include any extra text, markdown, or explanations outside of the JSON structure.

Use the following guidelines for each section of the JSON output:
- **title**: The name of the business idea.
- **summary**: A brief overview of the business concept.
- **investmentStrategy**: Detail the required initial investment. Include estimates for equipment, raw materials, location (if applicable), and initial operational costs. Be specific about what an entrepreneur needs to get started. Use simple, easy-to-understand language and use markdown for **bolding** important keywords and phrases.
- **targetAudience**: Describe the ideal customer for this business. Outline a basic marketing and distribution strategy suitable for an early-stage venture in India. Use simple, easy-to-understand language and use markdown for **bolding** important keywords and phrases.
- **roi**: Provide a realistic projection of potential revenue and profit. Explain the factors that influence profitability and a possible timeline to break even and achieve profitability. Use simple, easy-to-understand language.
- **futureProofing**: Discuss the long-term viability of the business. Cover aspects like scalability, potential for product diversification, market trends, and a competitive landscape. Use simple, easy-to-understand language and use markdown for **bolding** important keywords and phrases.
- **relevantSchemes**: Identify 2-3 relevant Indian government schemes (e.g., Startup India, MUDRA, CGTMSE) that could support this business. For each scheme, briefly explain its benefits and eligibility criteria. Use simple, easy-to-understand language and use markdown for **bolding** important keywords and phrases.
`;

  const headers = {
    Authorization: `Bearer ${SARVAM_API_KEY}`,
    'Content-Type': 'application/json',
  };
  const data = {
    model: 'sarvam-m', // Use deeper reasoning model for analysis
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful AI for Indian startup analysis.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Sarvam AI Error Body:", errorBody);
        throw new Error(`Sarvam AI API request failed with status: ${response.status}`);
    }

    const responseJson: any = await response.json();
    const message = responseJson.choices[0].message.content;
    const jsonString = message
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsedOutput = JSON.parse(jsonString);
    return parsedOutput;
  } catch (error: any) {
    console.error('Sarvam AI (generateInvestmentIdeaAnalysis) Error:', error);
    throw new Error(
      `Failed to generate investment idea analysis: ${error.message}`
    );
  }
}
