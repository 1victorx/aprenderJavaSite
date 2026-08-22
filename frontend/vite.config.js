import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import { fileURLToPath } from 'node:url';

const projectDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectDir, '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080';
  const base = env.VITE_BASE_PATH || '/';

  return {
    base,
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
          target: apiProxyTarget,
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
  };
});
