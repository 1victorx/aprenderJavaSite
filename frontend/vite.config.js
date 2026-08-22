import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'node:url';

const projectDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(projectDir, 'src/index.html')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(projectDir, 'src')
    }
  },
  // Ensure SPA fallback only applies to HTML navigation, not module requests
  appType: 'spa'
});