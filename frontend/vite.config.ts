import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  base: mode === "demo" ? "./" : "/",
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          data: ["@tanstack/react-query", "axios", "zod", "react-hook-form"],
          motion: ["framer-motion"],
        },
      },
    },
  },
}));
