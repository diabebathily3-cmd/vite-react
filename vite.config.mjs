import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',   // output folder for Vercel
    sourcemap: true   // optional: generates source maps for debugging
  },
  server: {
    port: 5173,       // local dev server port
    open: true        // automatically open the browser when running dev
  }
})
