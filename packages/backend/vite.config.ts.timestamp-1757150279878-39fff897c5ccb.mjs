// vite.config.ts
import { defineConfig } from "file:///Users/garaemon/gprog/reviewflow/node_modules/.pnpm/vite@5.4.19_@types+node@20.19.13/node_modules/vite/dist/node/index.js";
import { VitePluginNode } from "file:///Users/garaemon/gprog/reviewflow/node_modules/.pnpm/vite-plugin-node@3.1.0_vite@5.4.19/node_modules/vite-plugin-node/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    ...VitePluginNode({
      adapter: "express",
      appPath: "./src/index.ts",
      exportName: "app",
      tsCompiler: "esbuild"
    })
  ],
  build: {
    outDir: "dist",
    target: "node18",
    lib: {
      entry: "src/index.ts",
      name: "backend",
      fileName: "index",
      formats: ["es"]
    },
    rollupOptions: {
      external: [
        "express",
        "cors",
        "simple-git",
        "sqlite3",
        "diff",
        "uuid"
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZ2FyYWVtb24vZ3Byb2cvcmV2aWV3Zmxvdy9wYWNrYWdlcy9iYWNrZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZ2FyYWVtb24vZ3Byb2cvcmV2aWV3Zmxvdy9wYWNrYWdlcy9iYWNrZW5kL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9nYXJhZW1vbi9ncHJvZy9yZXZpZXdmbG93L3BhY2thZ2VzL2JhY2tlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgVml0ZVBsdWdpbk5vZGUgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgLi4uVml0ZVBsdWdpbk5vZGUoe1xuICAgICAgYWRhcHRlcjogJ2V4cHJlc3MnLFxuICAgICAgYXBwUGF0aDogJy4vc3JjL2luZGV4LnRzJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdhcHAnLFxuICAgICAgdHNDb21waWxlcjogJ2VzYnVpbGQnLFxuICAgIH0pXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgdGFyZ2V0OiAnbm9kZTE4JyxcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiAnc3JjL2luZGV4LnRzJyxcbiAgICAgIG5hbWU6ICdiYWNrZW5kJyxcbiAgICAgIGZpbGVOYW1lOiAnaW5kZXgnLFxuICAgICAgZm9ybWF0czogWydlcyddXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogW1xuICAgICAgICAnZXhwcmVzcycsXG4gICAgICAgICdjb3JzJyxcbiAgICAgICAgJ3NpbXBsZS1naXQnLFxuICAgICAgICAnc3FsaXRlMycsXG4gICAgICAgICdkaWZmJyxcbiAgICAgICAgJ3V1aWQnXG4gICAgICBdXG4gICAgfVxuICB9XG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVUsU0FBUyxvQkFBb0I7QUFDbFcsU0FBUyxzQkFBc0I7QUFFL0IsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsR0FBRyxlQUFlO0FBQUEsTUFDaEIsU0FBUztBQUFBLE1BQ1QsU0FBUztBQUFBLE1BQ1QsWUFBWTtBQUFBLE1BQ1osWUFBWTtBQUFBLElBQ2QsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLEtBQUs7QUFBQSxNQUNILE9BQU87QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLFNBQVMsQ0FBQyxJQUFJO0FBQUEsSUFDaEI7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
