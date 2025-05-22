import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/CSE442/2025-Spring/cse-442aj/frontend/',
  server: {
    proxy: {
      '/api': {
        target: 'https://cattle.cse.buffalo.edu/CSE442/2025-Spring/cse-442aj/backend/', // PHP server address
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Host', 'https://cattle.cse.buffalo.edu/CSE442/2025-Spring/cse-442aj/backend/');
          });
        },
      }, 
    }, 
  },
});