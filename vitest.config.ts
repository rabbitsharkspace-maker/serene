import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

// Standalone test config so the app's Vite dev server settings (HMR, tailwind) stay untouched.
export default defineConfig({
  // Cast: vitest bundles its own copy of vite, whose Plugin type differs nominally
  // from the app's vite. The plugin is runtime-compatible; the cast silences the clash.
  plugins: [react() as any],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
