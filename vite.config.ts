import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function pollyDevPlugin(): Plugin {
  return {
    name: 'vite-plugin-polly-dev',
    configureServer(server) {
      server.middlewares.use('/api/speak', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const { text, voiceId = 'Kevin' } = JSON.parse(body || '{}');
            if (!text || !text.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Text is required' }));
              return;
            }

            const { PollyClient, SynthesizeSpeechCommand } = await import('@aws-sdk/client-polly');
            const polly = new PollyClient({ region: process.env.AWS_REGION || 'ap-south-1' });

            const command = new SynthesizeSpeechCommand({
              Engine: 'neural',
              OutputFormat: 'mp3',
              Text: text.trim().substring(0, 300),
              VoiceId: voiceId,
            });

            const pollyRes = await polly.send(command);
            const bytes = await pollyRes.AudioStream.transformToByteArray();
            const base64 = Buffer.from(bytes).toString('base64');

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                voiceId,
                audio: `data:audio/mp3;base64,${base64}`,
              })
            );
          } catch (err: any) {
            console.warn('[Polly Dev Server] Error:', err.message);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Polly error' }));
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), pollyDevPlugin()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // The `build.manualChunks` shorthand is ignored by Vite 6 — declare
        // the splits under rollupOptions.output so three.js stays out of the
        // landing bundle and React is cached across lazy routes.
        // Normalize separators so the matcher works on Windows and POSIX.
        manualChunks(id: string) {
          const normalized = id.split('\\').join('/');
          if (normalized.includes('node_modules/three')) return 'three';
          if (
            normalized.includes('node_modules/react-dom') ||
            normalized.includes('node_modules/react/') ||
            normalized.includes('node_modules/scheduler')
          ) {
            return 'react';
          }
        },
      },
    },
  },
});
