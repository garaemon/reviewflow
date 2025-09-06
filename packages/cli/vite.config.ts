import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    target: 'node18',
    ssr: true,
    rollupOptions: {
      input: 'src/index.ts',
      output: {
        format: 'es',
        entryFileNames: 'index.js'
      },
      external: [
        'commander',
        'open',
        'chalk',
        'ora',
        'fs',
        'path',
        'child_process'
      ]
    }
  }
})