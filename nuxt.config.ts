import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  devtools: { enabled: true },
  compatibilityDate: '2024-01-01',
  
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // Auto-import components
  components: true,

  // Auto-import composables
  imports: {
    dirs: ['./composables', './utils'],
  },

  // Nuxi aliases
  alias: {
    '@': '.',
    '~': '.',
  },

  // Build optimization
  build: {
    transpile: [],
  },

  // SSR disabled for client-side only game
  ssr: false,
})
