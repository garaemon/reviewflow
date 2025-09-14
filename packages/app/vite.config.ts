import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'src/ui',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/ui'),
      '@shared': resolve(__dirname, './src/shared'),
    },
  },
  build: {
    outDir: '../../dist/public',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
})