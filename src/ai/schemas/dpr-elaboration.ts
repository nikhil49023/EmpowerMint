
import { z } from 'zod';

export const ElaborationInputSchema = z.object({
  idea: z.string().describe("The user's initial business idea."),
  promoterName: z.string().describe("The name of the entrepreneur."),
});
export type ElaborationInput = z.infer<typeof ElaborationInputSchema>;
