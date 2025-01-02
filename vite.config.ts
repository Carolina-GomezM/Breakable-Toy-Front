
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {configDefaults} from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port:8080
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/vitest.setup.ts'
  }


})
 