
'use server';

/**
 * @fileOverview A Genkit flow for having an interactive conversation to build a Detailed Project Report (DRP).
 *
 * - generateDprConversation - A function that handles the conversational turn.
 * - GenerateDprConversationInput - The input type for the function.
 * - GenerateDprConversationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the structure for a single message in the conversation history
const DprMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

// Define the input schema for the flow
const GenerateDprConversationInputSchema = z.object({
  idea: z
    .string()
    .describe(
      'A string containing the core business idea and other details collected from the user, such as Project Name, Promoter Name, etc.'
    ),
  history: z
    .array(DprMessageSchema)
    .describe('The history of the conversation so far.'),
});
export type GenerateDprConversationInput = z.infer<
  typeof GenerateDprConversationInputSchema
>;

// Define the output schema for the flow
const GenerateDprConversationOutputSchema = z.object({
  response: z
    .string()
    .describe("The AI's response in the conversation."),
  suggestions: z
    .array(z.string())
    .optional()
    .describe(
      'A list of 3 suggested replies for the user to choose from to continue the conversation.'
    ),
});
export type GenerateDprConversationOutput = z.infer<
  typeof GenerateDprConversationOutputSchema
>;

// Export the main function that the server action will call
export async function generateDprConversation(
  input: GenerateDprConversationInput
): Promise<GenerateDprConversationOutput> {
  return generateDprConversationFlow(input);
}

// Define the prompt for the AI model
const prompt = ai.definePrompt({
  name: 'generateDprConversationPrompt',
  input: { schema: GenerateDprConversationInputSchema },
  output: { schema: GenerateDprConversationOutputSchema },
  prompt: `You are "Uplift AI," a business development expert. Your goal is to help an early-stage entrepreneur in India brainstorm and build a bank-ready Detailed Project Report (DRP) through an interactive conversation.

The user's initial project details are: "{{{idea}}}"

Your tasks are:
1.  Analyze the conversation history to understand the context.
2.  Ask clarifying questions to gather more details about the project. Cover key DRP sections like Market Analysis, Financial Projections, Marketing Strategy, and Operations Plan.
3.  Based on the user's input, provide suggestions and insights relevant to the Indian market.
4.  After providing a response, you MUST offer exactly three distinct, actionable suggestions as the next conversation step for the user to choose from. These suggestions should help build out a section of the DRP (e.g., "Let's define the target audience.", "What is the initial investment?", "Flesh out the marketing plan.").
5.  Once sufficient detail has been gathered across the key sections, suggest generating the report as one of the options. For example: "I think we have enough information to create a draft. Shall we generate the report now?".

Keep your responses concise, encouraging, and professional. Guide the user step-by-step. Use markdown for formatting, like making text **bold**.

Conversation History:
{{#each history}}
- {{this.role}}: {{this.text}}
{{/each}}

Based on this, what is your next question or suggestion, and what are the three follow-up options?`,
});

// Define the main Genkit flow
const generateDprConversationFlow = ai.defineFlow(
  {
    name: 'generateDprConversationFlow',
    inputSchema: GenerateDprConversationInputSchema,
    outputSchema: GenerateDprConversationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
