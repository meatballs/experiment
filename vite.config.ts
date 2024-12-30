import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// @ts-expect-error - vite config is handled by tsconfig.vite.json
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    watch: {
      ignored: ['**/cucumber-report.*']
    }
  }
})
