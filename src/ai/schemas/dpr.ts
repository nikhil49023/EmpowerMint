
import { z } from 'genkit';

const RevisionRequestSchema = z.object({
  originalText: z.string().describe('The original text of the section.'),
  feedback: z.string().describe('The user\'s feedback for revision.'),
});

export const GenerateDprSectionInputSchema = z.object({
  idea: z.string().describe('The core business idea.'),
  promoterName: z.string().describe("The entrepreneur's name."),
  targetSection: z
    .string()
    .describe('The specific DPR section to be generated.'),
  previousSections: z
    .record(z.string())
    .optional()
    .describe(
      'A map of previously completed sections and their content for context.'
    ),
  revisionRequest: RevisionRequestSchema.optional().describe(
    'A request to revise the section based on user feedback.'
  ),
});

export const GenerateDprSectionOutputSchema = z.object({
  content: z
    .string()
    .describe('The generated content for the specified DPR section.'),
});

export type GenerateDprSectionInput = z.infer<
  typeof GenerateDprSectionInputSchema
>;
export type GenerateDprSectionOutput = z.infer<
  typeof GenerateDprSectionOutputSchema
>;

    