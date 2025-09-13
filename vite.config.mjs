import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // dossier que Vercel doit servir
    sourcemap: true // optionnel, utile pour déboguer
  },
  server: {
    port: 5173, // port local par défaut
    open: true  // ouvre le navigateur automatiquement
  }
})
