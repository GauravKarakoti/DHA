import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";

export default defineConfig({
  // Defaults to standard '/' unless a BASE_PATH is explicitly provided by your CI/CD
  base: process.env.BASE_PATH || "/",
  
  plugins: [
    react(),
    tailwindcss(),
    mockupPreviewPlugin(), 
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  
  root: path.resolve(import.meta.dirname),
  
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  
  server: {
    // Falls back to Vite's standard port 5173 if no PORT env var is present
    port: Number(process.env.PORT) || 5173,
    host: true, // Resolves to "0.0.0.0" to allow network access
  },
  
  preview: {
    port: Number(process.env.PORT) || 4173,
    host: true,
  },
});