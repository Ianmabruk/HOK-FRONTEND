import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts')) return 'vendor-charts'
          if (id.includes('socket.io')) return 'vendor-socket'
          if (id.includes('zustand') || id.includes('axios')) return 'vendor-state'
          if (id.includes('react-icons') || id.includes('react-hot-toast')) return 'vendor-ui'
          if (id.includes('react-router') || (id.includes('node_modules/react') && !id.includes('react-icons'))) return 'vendor-react'
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
