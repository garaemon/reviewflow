import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/server/index.ts',
      exportName: 'app',
    }),
  ],
  build: {
    outDir: 'dist',
    ssr: true,
    rollupOptions: {
      input: 'src/server/index.ts',
      output: {
        format: 'es',
        entryFileNames: 'server/[name].js',
      },
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, './src/shared'),
    },
  },
})