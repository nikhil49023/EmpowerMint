
'use server';

/**
 * @fileOverview A Genkit flow for converting text to speech (TTS).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import { googleAI } from '@genkit-ai/google-genai';

export const GenerateTtsInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type GenerateTtsInput = z.infer<typeof GenerateTtsInputSchema>;

export const GenerateTtsOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a data URI.'),
});
export type GenerateTtsOutput = z.infer<typeof GenerateTtsOutputSchema>;

export async function generateTts(
  input: GenerateTtsInput
): Promise<GenerateTtsOutput> {
  return generateTtsFlow(input);
}

/**
 * Converts raw PCM audio data into a Base64 encoded WAV file.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d: Buffer) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

const generateTtsFlow = ai.defineFlow(
  {
    name: 'generateTtsFlow',
    inputSchema: GenerateTtsInputSchema,
    outputSchema: GenerateTtsOutputSchema,
  },
  async ({ text }) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: text,
    });

    if (!media?.url) {
      throw new Error('No audio media was returned from the TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
