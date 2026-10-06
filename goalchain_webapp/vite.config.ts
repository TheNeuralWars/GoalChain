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
  build: {
    rollupOptions: {
      output: {
        // Group the heavy vendor libs into stable, cacheable chunks. The Solana
        // groups are only referenced from lazy (on-demand) modules — see
        // src/wallet/gate.tsx — so they are fetched when a wallet/chain feature
        // is used, not on first paint.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          const norm = id.replace(/\\/g, '/');
          if (/node_modules\/(@solana\/web3\.js|@solana\/spl-token|@coral-xyz\/)/.test(norm)) {
            return 'solana-core';
          }
          if (/node_modules\/(@solana\/wallet-adapter|@solana\/wallet-standard|@wallet-standard\/)/.test(norm)) {
            return 'wallet-adapter';
          }
          if (/node_modules\/(react|react-dom|scheduler)\//.test(norm)) {
            return 'react-vendor';
          }
          // buffer is needed eagerly by src/polyfills.ts — keep it out of the
          // on-demand Solana chunks so they stay lazy.
          if (/node_modules\/buffer\//.test(norm)) {
            return 'polyfill';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
