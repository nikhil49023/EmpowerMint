
'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/generate-suggestions-from-prompt.ts';
import '@/ai/flows/extract-transactions-from-document';
import '@/ai/flows/generate-fin-bite';
import '@/ai/flows/generate-dashboard-summary';
import '@/ai/flows/generate-investment-idea-analysis';
import '@/ai/flows/generate-dpr-conversation';
import '@/ai/flows/generate-financial-advice';
