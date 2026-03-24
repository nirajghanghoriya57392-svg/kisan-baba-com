import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  root: './',
  server: {
    proxy: {
      '/api/ogd': {
        target: 'https://api.data.gov.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ogd/, ''),
        secure: true,
      },
      '/api/pib': {
        target: 'https://pib.gov.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pib/, ''),
        secure: true,
      }
    }
  }
})
