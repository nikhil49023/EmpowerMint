
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
Your task is to provide a detailed analysis of the following business idea: "${input.idea}"

CRITICAL: You MUST output ONLY a valid JSON object. Do not include any extra text, markdown, or explanations outside of the JSON structure.

The JSON must have these exact fields: title, summary, investmentStrategy, targetAudience, roi, futureProofing, relevantSchemes. All values must be strings.

Example format:
{
  "title": "Business Name",
  "summary": "Brief overview...",
  "investmentStrategy": "Investment details...",
  "targetAudience": "Target customer description...",
  "roi": "ROI analysis...",
  "futureProofing": "Long-term viability...",
  "relevantSchemes": "Government schemes..."
}
`;

  const headers = {
    'Authorization': `Bearer ${SARVAM_API_KEY}`,
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
    temperature: 0.3,
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
    
    // Clean the response to get only the JSON part
    let jsonString = message
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Find the JSON object boundaries
    const startIndex = jsonString.indexOf('{');
    const lastIndex = jsonString.lastIndexOf('}');
    
    if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
      jsonString = jsonString.substring(startIndex, lastIndex + 1);
    }

    const parsedOutput = JSON.parse(jsonString);
    return parsedOutput;
  } catch (error: any) {
    console.error('Sarvam AI (generateInvestmentIdeaAnalysis) Error:', error);
    throw new Error(
      `Failed to generate investment idea analysis: ${error.message}`
    );
  }
}
