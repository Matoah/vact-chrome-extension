import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/dist",
  build: {
    outDir: "plugin/dist",
    rollupOptions: {
      input: {
        index: "index.html",
        inject: "injectscripts/index.ts",
      },
    },
  },
  plugins: [react()],
});
