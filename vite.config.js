import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Note: tests run on Vitest rather than Jest — same describe/it/expect API,
// but zero extra config needed on top of the existing Vite setup (Jest
// requires a separate Babel/ESM transform pipeline that duplicates what
// Vite already does). `npm test` runs them.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  build: {
    chunkSizeWarningLimit: 1000, // Suppress warning for chunks up to 1MB
  },
});
