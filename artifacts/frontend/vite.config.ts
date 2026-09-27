import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  // Defaults to standard '/' unless a BASE_PATH is explicitly provided by your hosting provider
  base: process.env.BASE_PATH || '/',
  
  plugins: [
    react(),
    tailwindcss(),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  
  root: path.resolve(import.meta.dirname),
  
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  
  server: {
    // Falls back to Vite's standard port 5173 if no PORT env var is present
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: process.env.API_PROXY_TARGET
      ? { '/api': { target: process.env.API_PROXY_TARGET, changeOrigin: true } }
      : undefined,
    fs: {
      strict: true,
    },
  },
  
  preview: {
    port: Number(process.env.PORT) || 4173,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});