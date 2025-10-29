
'use server';

/**
 * @fileOverview A flow for generating a full Detailed Project Report (DPR) from an elaborated business profile.
 */

import type {
  ElaboratedBusinessProfile,
  GenerateDprOutput,
} from '@/ai/schemas/dpr';
import fetch from 'node-fetch';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const API_URL = 'https://api.sarvam.ai/chat/completions';

export async function generateDprFromElaboration(
  input: ElaboratedBusinessProfile
): Promise<GenerateDprOutput> {
  const prompt = `You are an expert consultant hired to write a bank-ready Detailed Project Report (DPR) for an entrepreneur in India.
You have been provided with a detailed, structured business profile. Your task is to write the complete DPR based on this information.

CRITICAL: You MUST output ONLY a valid JSON object that conforms to the final DPR output schema (GenerateDprOutputSchema). Do not include any other text, markdown, or explanations.
Every string field in the output must start with "*(Powered by FIn-Box AI)*".

For the "financialProjections" section, you must generate the full financial object with credible, realistic data based on the business profile.
The 'costBreakdown' and 'yearlyProjections' fields must be valid JSON arrays for charts.
All other fields should be markdown strings, providing detailed and well-structured content for each section of the DPR.

**Detailed Business Profile Input:**
${JSON.stringify(input, null, 2)}

Based on this profile, generate the complete JSON object for the DPR.
`;

  const headers = {
    'API-Subscription-Key': `${SARVAM_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const data = {
    model: 'sarvam-m', // Use deeper reasoning model for the full report
    messages: [
      {
        role: 'system',
        content: 'You are an expert AI assistant for writing Detailed Project Reports.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
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
  } catch (e: any) {
    console.error('Sarvam AI (DPR Generation) Error:', e.message);
    throw new Error(`Failed to generate the full DPR: ${e.message}`);
  }
}
