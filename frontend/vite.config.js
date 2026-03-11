import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    allowedHosts: ['.up.railway.app'],
  },
  preview: {
    allowedHosts: ['.up.railway.app'],
  },
})
