
'use server';

/**
 * @fileOverview A flow for converting text to speech (TTS) using Sarvam AI.
 */

import type {
  GenerateTtsInput,
  GenerateTtsOutput,
} from '@/ai/schemas/tts';
import { SarvamAIClient } from 'sarvamai';
import wav from 'wav';

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY!,
});


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

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}


export async function generateTts(
  input: GenerateTtsInput
): Promise<GenerateTtsOutput> {
  try {
    const response = await client.voice.tts({
      input: input.text,
      voice: 'hi-IN-Standard-A',
      language_code: 'hi-IN',
      encoding: 'pcm_16',
    });

    if (!response.audio_content) {
      throw new Error('No audio content returned from Sarvam AI.');
    }

    const audioBuffer = Buffer.from(response.audio_content, 'base64');
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  } catch (error: any) {
    console.error("Sarvam AI TTS Error:", error.message);
    throw new Error(`Failed to generate audio: ${error.message}`);
  }
}
