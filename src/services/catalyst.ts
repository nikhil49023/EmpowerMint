
import type { GenerateRagAnswerInput } from '@/ai/schemas/rag-answer';
import { config } from 'dotenv';
import fetch from 'node-fetch';

config();

class CatalystService {
  private accessToken: string;
  private projectId: string;
  private orgId: string;

  constructor() {
    this.accessToken = process.env.ZOHO_STATIC_ACCESS_TOKEN!;
    this.projectId = process.env.ZOHO_PROJECT_ID!;
    this.orgId = process.env.ZOHO_CATALYST_ORG_ID!;

    if (!this.accessToken || !this.projectId || !this.orgId) {
        console.error("CRITICAL: One or more Zoho Catalyst environment variables (ZOHO_STATIC_ACCESS_TOKEN, ZOHO_PROJECT_ID, ZOHO_CATALYST_ORG_ID) are not configured.");
    }
  }

  public async getRagAnswer(input: GenerateRagAnswerInput): Promise<string> {
    const token = this.accessToken;
    const ragApiUrl = `https://api.catalyst.zoho.in/quickml/v1/project/${this.projectId}/rag/answer`;
    
    console.log(`Sending query to RAG API: "${input.query.substring(0, 100)}..."`);

    const body = {
        query: input.query,
        documents: input.documents || []
    };

    const apiResponse = await fetch(ragApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CATALYST-ORG': this.orgId,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error('RAG API request failed with status:', apiResponse.status);
      console.error('RAG API response body:', errorBody);
      throw new Error(`RAG API request failed: ${apiResponse.statusText}`);
    }

    const responseData: any = await apiResponse.json();
    
    // Check for a top-level `response` field, which is common for RAG APIs.
    if (responseData && responseData.response) {
       return responseData.response;
    }

    // Fallback for nested structure if the above fails.
    if (responseData.data && responseData.data.response) {
        return responseData.data.response;
    }
    
    // If neither is found, the response is malformed.
    console.error('RAG API returned a successful status but the response format is unexpected:', responseData);
    throw new Error('The RAG API response format was not recognized.');
  }
}

const catalystService = new CatalystService();
export default catalystService;
