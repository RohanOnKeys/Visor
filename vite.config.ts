import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, copyFileSync, mkdirSync, existsSync } from 'fs';

// Custom plugin to write manifest.json to dist on build completion
function chromeExtensionManifest() {
  return {
    name: 'chrome-extension-manifest',
    closeBundle() {
      const distPath = resolve(__dirname, 'dist');
      if (!existsSync(distPath)) {
        mkdirSync(distPath, { recursive: true });
      }
      
      // Copy manifest.json to dist
      copyFileSync(
        resolve(__dirname, 'manifest.json'),
        resolve(distPath, 'manifest.json')
      );
      
      console.log('Copied manifest.json to dist/');
    }
  };
}

export default defineConfig({
  plugins: [react(), chromeExtensionManifest()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        options: resolve(__dirname, 'options.html'),
        preview: resolve(__dirname, 'preview.html'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
        content: resolve(__dirname, 'src/content/content-script.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'service-worker.js';
          }
          if (chunkInfo.name === 'content') {
            return 'content-script.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    }
  }
});
