import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'

export default defineConfig({
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/index.ts',
      exportName: 'app',
      tsCompiler: 'esbuild',
    })
  ],
  build: {
    outDir: 'dist',
    target: 'node18',
    lib: {
      entry: 'src/index.ts',
      name: 'backend',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        'express',
        'cors',
        'simple-git',
        'sqlite3',
        'diff',
        'uuid'
      ]
    }
  }
})