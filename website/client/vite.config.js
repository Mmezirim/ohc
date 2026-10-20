import fs from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy to whatever PORT the API uses (server/.env), so the two never drift apart.
function apiPort() {
  try {
    const env = fs.readFileSync(new URL('../server/.env', import.meta.url), 'utf8');
    const m = env.match(/^\s*PORT\s*=\s*["']?(\d+)/m);
    if (m) return m[1];
  } catch {
    /* no .env — use the default */
  }
  return process.env.API_PORT || '5000';
}

const api = `http://localhost:${apiPort()}`;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Allow tunnelled previews (e.g. testing on a phone through ngrok).
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.io'],
    // Keep the browser's Host header so the API's same-origin (CSRF) checks see the real origin.
    proxy: {
      '/api': { target: api, changeOrigin: false },
      '/uploads': { target: api, changeOrigin: false },
    },
  },
});
