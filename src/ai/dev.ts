
'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/generate-suggestions-from-prompt.ts';
import '@/ai/flows/extract-transactions-from-document';
import '@/ai/flows/generate-dashboard-summary';
import '@/ai/flows/generate-investment-idea-analysis';
import '@/ai/flows/generate-dpr-from-analysis';
import '@/ai/flows/generate-dpr-section';
import '@/ai/flows/generate-emergency-fund-recommendation';
import '@/ai/flows/generate-fin-bite';
