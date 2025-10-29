'use server';

import type { GenerateRagAnswerInput } from '@/ai/schemas/rag-answer';
import { config } from 'dotenv';
import fetch from 'node-fetch';

config();

class CatalystService {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private projectId: string;
  private orgId: string;

  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID!;
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET!;
    this.refreshToken = process.env.ZOHO_REFRESH_TOKEN!;
    this.projectId = process.env.ZOHO_PROJECT_ID!;
    this.orgId = process.env.ZOHO_CATALYST_ORG_ID!;

    if (!this.clientId || !this.clientSecret || !this.refreshToken || !this.projectId || !this.orgId) {
        console.error("CRITICAL: One or more Zoho Catalyst environment variables are not configured.");
    }
  }

  private async getValidAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      console.log('Using cached Zoho access token.');
      return this.accessToken;
    }

    console.log('Access token is missing or expired. Refreshing...');
    const tokenUrl = 'https://accounts.zoho.in/oauth/v2/token'; // Using .in domain
    const params = new URLSearchParams();
    params.append('refresh_token', this.refreshToken);
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'refresh_token');

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        body: params,
      });

      const data: any = await response.json();

      if (data.error) {
        console.error('Error fetching Zoho access token:', data.error);
        throw new Error(`Zoho token refresh failed: ${data.error}`);
      }

      this.accessToken = data.access_token;
      // Zoho tokens typically expire in 1 hour (3600 seconds)
      this.tokenExpiry = new Date(new Date().getTime() + (data.expires_in_sec - 300) * 1000); 

      console.log('Successfully fetched and cached new Zoho access token.');
      return this.accessToken!;
    } catch (error: any) {
      console.error('Catastrophic error during token refresh:', error.message);
      throw new Error(`Failed to refresh Zoho access token: ${error.message}`);
    }
  }

  public async getRagAnswer(input: GenerateRagAnswerInput): Promise<string> {
    const token = await this.getValidAccessToken();
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
        'Authorization': `Zoho-oauthtoken ${token}`,
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
    return responseData?.response;
  }
}

const catalystService = new CatalystService();
export default catalystService;
