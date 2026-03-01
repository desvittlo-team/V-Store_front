import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7059',
        changeOrigin: true,
        rewrite: (path) => path,
        secure: false, // accept self-signed certificates
      }
    }
  }
})
