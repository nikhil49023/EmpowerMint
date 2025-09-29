'use server';

import { generateSuggestionsFromPrompt, GenerateSuggestionsFromPromptInput, GenerateSuggestionsFromPromptOutput } from '@/ai/flows/generate-suggestions-from-prompt';

export async function generateSuggestionsAction(
  input: GenerateSuggestionsFromPromptInput
): Promise<{ success: true; data: GenerateSuggestionsFromPromptOutput } | { success: false; error: string }> {
  try {
    const suggestions = await generateSuggestionsFromPrompt(input);
    return { success: true, data: suggestions };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate suggestions. Please try again.' };
  }
}
