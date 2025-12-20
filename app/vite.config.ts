  build: {
    rollupOptions: {
      external: ['@solana/spl-token'],
    },
  },
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'stream': 'stream-browserify',
      'buffer': 'buffer',
      'process': 'process/browser',
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@solana/web3.js', '@coral-xyz/anchor', '@solana/spl-token'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
