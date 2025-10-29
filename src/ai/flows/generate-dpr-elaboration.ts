
'use server';

/**
 * @fileOverview A flow for elaborating on a user's business idea to create a rich profile for DPR generation.
 */

import type {
  ElaboratedBusinessProfile,
} from '@/ai/schemas/dpr';
import type { ElaborationInput } from '@/ai/schemas/dpr-elaboration';
import fetch from 'node-fetch';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const API_URL = 'https://api.sarvam.ai/v1/chat/completions';

export async function generateDprElaboration(
  input: ElaborationInput
): Promise<ElaboratedBusinessProfile> {
  const prompt = `You are a business consultant creating a detailed profile for a startup idea in India.
The user has provided a basic idea. Your task is to elaborate on it by filling in the details for a comprehensive business profile.
This profile will be used to generate a full Detailed Project Report (DPR).

CRITICAL: You MUST output ONLY a valid JSON object that conforms to the ElaboratedBusinessProfile schema. Do not include any other text, markdown, or explanations.
Be creative but realistic. Your elaborations should be plausible for the Indian market.

User's Business Idea: "${input.idea}"
Promoter's Name: "${input.promoterName}"

Now, generate the full JSON object for the ElaboratedBusinessProfile. The schema requires these fields: promoterName, businessName, businessType, location, detailedProjectDescription, targetAudienceAnalysis, competitiveLandscape, marketingStrategy, financialSummary, usp.
`;

  const headers = {
    'Authorization': `Bearer ${SARVAM_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const data = {
    model: 'sarvam-m', // Using the more powerful model for creative elaboration
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful AI assistant for startup business plan elaboration.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
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
    
    // Try to fix common JSON issues
    jsonString = jsonString
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\n/g, '\\n') // Escape newlines
      .replace(/\r/g, '\\r') // Escape carriage returns
      .replace(/\t/g, '\\t'); // Escape tabs
    
    // Find the JSON object boundaries
    const startIndex = jsonString.indexOf('{');
    const lastIndex = jsonString.lastIndexOf('}');
    
    if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
      jsonString = jsonString.substring(startIndex, lastIndex + 1);
    }

    const parsedOutput = JSON.parse(jsonString);
    
    // Convert object fields to strings if needed for DPR elaboration
    if (parsedOutput.targetAudienceAnalysis && typeof parsedOutput.targetAudienceAnalysis === 'object') {
      parsedOutput.targetAudienceAnalysis = JSON.stringify(parsedOutput.targetAudienceAnalysis);
    }
    if (parsedOutput.marketingStrategy && typeof parsedOutput.marketingStrategy === 'object') {
      parsedOutput.marketingStrategy = JSON.stringify(parsedOutput.marketingStrategy);
    }
    if (parsedOutput.financialSummary && typeof parsedOutput.financialSummary === 'object') {
      parsedOutput.financialSummary = JSON.stringify(parsedOutput.financialSummary);
    }
    
    return parsedOutput;
  } catch (e: any) {
    console.error('Sarvam AI (DPR Elaboration) Error:', e.message);
    throw new Error(`Failed to elaborate on business idea: ${e.message}`);
  }
}
