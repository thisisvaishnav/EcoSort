import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const region = process.env.AWS_REGION || 'ap-south-1';
const voiceId = process.env.VITE_POLLY_VOICE_ID || process.argv[2] || 'Kevin';
const text = process.argv[3] || 'Hello hero! I am Eco. Clean paper and cardboard go in the blue recycling bin!';

console.log(`\n🎤 Amazon Polly Voice Test`);
console.log(`Region:   ${region}`);
console.log(`Voice ID: ${voiceId} (Neural Engine)`);
console.log(`Speech:   "${text}"\n`);

async function testPolly() {
  try {
    const polly = new PollyClient({ region });
    const command = new SynthesizeSpeechCommand({
      Engine: 'neural',
      OutputFormat: 'mp3',
      Text: text,
      VoiceId: voiceId,
    });

    console.log('⏳ Synthesizing voice with Amazon Polly...');
    const startTime = Date.now();
    const response = await polly.send(command);
    const audioBytes = await response.AudioStream.transformToByteArray();
    const duration = Date.now() - startTime;

    const outDir = path.resolve(__dirname, '../public/audio');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const outFile = path.join(outDir, 'test-eco-polly.mp3');
    fs.writeFileSync(outFile, Buffer.from(audioBytes));

    console.log(`✅ Success! Synthesized in ${duration}ms`);
    console.log(`📁 File saved to: ${outFile} (${audioBytes.length} bytes)`);
    console.log(`🔊 You can test-listen to this file or hear it live in the browser.\n`);
  } catch (err) {
    console.error('❌ Amazon Polly Test Error:', err.message);
    if (err.name === 'ValidationException' && err.message.includes('neural')) {
      console.log(`💡 Note: Voice "${voiceId}" might only support standard engine. Retrying with standard engine...`);
      try {
        const polly = new PollyClient({ region });
        const fallbackCmd = new SynthesizeSpeechCommand({
          Engine: 'standard',
          OutputFormat: 'mp3',
          Text: text,
          VoiceId: voiceId,
        });
        const res = await polly.send(fallbackCmd);
        const bytes = await res.AudioStream.transformToByteArray();
        const outFile = path.resolve(__dirname, '../public/audio/test-eco-polly.mp3');
        fs.writeFileSync(outFile, Buffer.from(bytes));
        console.log(`✅ Standard engine fallback success! Saved to ${outFile}`);
      } catch (retryErr) {
        console.error('Standard retry failed:', retryErr.message);
      }
    }
  }
}

testPolly();
