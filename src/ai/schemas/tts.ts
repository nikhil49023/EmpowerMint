
import { z } from 'zod';

export const GenerateTtsInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type GenerateTtsInput = z.infer<typeof GenerateTtsInputSchema>;

export const GenerateTtsOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a data URI.'),
});
export type GenerateTtsOutput = z.infer<typeof GenerateTtsOutputSchema>;
