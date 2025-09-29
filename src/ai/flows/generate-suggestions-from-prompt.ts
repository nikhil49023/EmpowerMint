'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating UI suggestions based on a user-provided prompt.
 *
 * The flow takes a prompt as input and returns suggestions for layout, UI components, and styling.
 * @file
 * - generateSuggestionsFromPrompt - A function that generates UI suggestions from a prompt.
 * - GenerateSuggestionsFromPromptInput - The input type for the generateSuggestionsFromPrompt function.
 * - GenerateSuggestionsFromPromptOutput - The return type for the generateSuggestionsFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSuggestionsFromPromptInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the type of application or feature to build.'),
});
export type GenerateSuggestionsFromPromptInput = z.infer<typeof GenerateSuggestionsFromPromptInputSchema>;

const GenerateSuggestionsFromPromptOutputSchema = z.object({
  layoutSuggestion: z.string().describe('A suggestion for the layout of the application or feature.'),
  componentSuggestions: z.array(z.string()).describe('A list of suggested UI components.'),
  stylingSuggestions: z.string().describe('A suggestion for the styling of the UI components.'),
});
export type GenerateSuggestionsFromPromptOutput = z.infer<typeof GenerateSuggestionsFromPromptOutputSchema>;

export async function generateSuggestionsFromPrompt(
  input: GenerateSuggestionsFromPromptInput
): Promise<GenerateSuggestionsFromPromptOutput> {
  return generateSuggestionsFromPromptFlow(input);
}

const generateSuggestionsFromPromptPrompt = ai.definePrompt({
  name: 'generateSuggestionsFromPromptPrompt',
  input: {schema: GenerateSuggestionsFromPromptInputSchema},
  output: {schema: GenerateSuggestionsFromPromptOutputSchema},
  prompt: `You are a UI/UX design assistant. A user will provide a prompt describing the type of application or feature they want to build. Based on the prompt, suggest a layout, UI components, and styling to accelerate their design process.

Prompt: {{{prompt}}}

Consider the following when making suggestions:

*   Layout: Suggest a layout that is appropriate for the type of application or feature described in the prompt. Consider the overall structure and organization of the UI.
*   UI Components: Suggest a set of UI components that would be useful for building the application or feature. Consider the functionality of each component and how it would be used in the UI.
*   Styling: Suggest a styling approach that would be appropriate for the type of application or feature described in the prompt. Consider the overall look and feel of the UI.

Output MUST be valid JSON conforming to the schema.
`,
});

const generateSuggestionsFromPromptFlow = ai.defineFlow(
  {
    name: 'generateSuggestionsFromPromptFlow',
    inputSchema: GenerateSuggestionsFromPromptInputSchema,
    outputSchema: GenerateSuggestionsFromPromptOutputSchema,
  },
  async input => {
    const {output} = await generateSuggestionsFromPromptPrompt(input);
    return output!;
  }
);
