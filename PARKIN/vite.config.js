import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

/**
 * Plugin: intercept semua SPA route di dev server
 * dan redirect ke /index-demo.html.
 *
 * Tanpa ini, Vite fallback ke index.html (production)
 * yang me-load src/main.js → error virtual:pwa-register.
 */
function HtmlFallback() {
  return {
    name: 'html-fallback',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET') return next()

        // Hanya intercept request yang meminta halaman HTML
        if (req.headers.accept && req.headers.accept.includes('text/html')) {
          // Abaikan request ke assets/API/vite internals
          if (!req.url.startsWith('/@') && !req.url.includes('.')) {
            req.url = '/index.html'
          }
        }
        next()
      })
    },
  }
}

/**
 * Vite Demo Config
 * Build target: src-demo/
 * Output dir  : dist-demo/
 * Entry       : index-demo.html
 * Port        : 5174 (berbeda dari dev production 5173)
 */
export default defineConfig({
  plugins: [
    vue(),
    HtmlFallback(),
  ],
  root: '.',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 5174,
    open: '/index.html',
  },
  preview: {
    port: 4174,
  },
})
