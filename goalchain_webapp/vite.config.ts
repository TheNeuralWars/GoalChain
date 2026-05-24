import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Web app only — avoid bundling optional mobile wallet stack (react-native).
      'react-native': path.resolve(__dirname, 'src/stubs/empty.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['react-native'],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
