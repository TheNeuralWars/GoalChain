import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fromAppNodeModules = (pkg: string) =>
  path.resolve(__dirname, 'node_modules', pkg);

export default defineConfig({
  plugins: [react()],
  resolve: {
    // @goalchain/sdk is file:../goalchain-sdk (symlink to a sibling dir).
    // Rollup follows the realpath, then walks node_modules from the SDK —
    // never the webapp. Vercel `npm install` in this package does not
    // populate goalchain-sdk/node_modules, so pin SDK externals here.
    alias: {
      // Web app only — avoid bundling optional mobile wallet stack (react-native).
      'react-native': path.resolve(__dirname, 'src/stubs/empty.ts'),
      '@solana/web3.js': fromAppNodeModules('@solana/web3.js'),
      '@solana/spl-token': fromAppNodeModules('@solana/spl-token'),
      '@coral-xyz/anchor': fromAppNodeModules('@coral-xyz/anchor'),
    },
    dedupe: ['@solana/web3.js', '@solana/spl-token', '@coral-xyz/anchor', 'react', 'react-dom'],
  },
  optimizeDeps: {
    exclude: ['react-native'],
    include: ['@solana/web3.js', '@solana/spl-token', '@coral-xyz/anchor'],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
