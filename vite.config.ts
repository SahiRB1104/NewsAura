import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ✅ Full working configuration
export default defineConfig({
  plugins: [react()],

  // ✅ Proxy backend API requests to Express/Node server
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
