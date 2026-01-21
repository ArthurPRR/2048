import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

const __dirname = new URL('.', import.meta.url).pathname

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': __dirname,
      '~': __dirname,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.spec.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['utils/**/*.ts', 'composables/**/*.ts', 'stores/**/*.ts'],
      exclude: [
        'node_modules/',
        'tests/',
      ],
    },
  },
})
