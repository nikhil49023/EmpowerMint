/**
 * @fileOverview Zod schemas and TypeScript types for Detailed Project Report (DPR) generation.
 */

import { z } from 'genkit';

const DprMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

const PreviousSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const GenerateDprSectionInputSchema = z.object({
  idea: z
    .string()
    .describe(
      'A string containing the core business idea and other details collected from the user, such as Project Name, Promoter Name, etc.'
    ),
  history: z
    .array(DprMessageSchema)
    .describe('The history of the conversation so far.'),
  sectionTitle: z
    .string()
    .describe('The title of the DPR section to be generated or revised.'),
  previousSections: z
    .array(PreviousSectionSchema)
    .optional()
    .describe(
      'Content of the previously completed sections to provide context.'
    ),
});
export type GenerateDprSectionInput = z.infer<
  typeof GenerateDprSectionInputSchema
>;

export const GenerateDprSectionOutputSchema = z.object({
  sectionContent: z
    .string()
    .describe('The detailed content for the requested DPR section.'),
  followupQuestion: z
    .string()
    .describe(
      "A follow-up question to the user to confirm the generated content or ask for more details."
    ),
});
export type GenerateDprSectionOutput = z.infer<
  typeof GenerateDprSectionOutputSchema
>;
