
import { z } from 'zod';

const FinBiteUpdateSchema = z.object({
  category: z.string().describe('The category of the news (e.g., "MSME Schemes", "Finance & Tax", "Market News").'),
  title: z.string().describe('The headline of the news update.'),
  summary: z.string().describe('A brief, easy-to-understand summary of the news and its impact on entrepreneurs.'),
});

export const GenerateFinBiteOutputSchema = z.object({
  updates: z.array(FinBiteUpdateSchema),
});
export type GenerateFinBiteOutput = z.infer<typeof GenerateFinBiteOutputSchema>;
