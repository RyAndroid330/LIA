// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-quasar-ui',
    '@sidebase/nuxt-auth'
  ],
  auth: {
    // globalAppMiddleware: true,
    isEnabled: true,
    // disableServerSideAuth: true,
    originEnvKey: 'AUTH_ORIGIN',
    baseURL: 'http://localhost:5000/api/auth',
    provider: {
      type: 'authjs',
      trustHost: false,
      defaultProvider: 'google',
      addDefaultCallbackUrl: true
    }
  },
  // router: {
  //   middleware: ['auth.global']
  // },
  ssr: false,
  sourcemap: {
    client: true
  },
  build: {},
  quasar: {
    plugins: ['Dialog', 'Notify', 'Dark'],
    cssAddon: true,
    config: {
      brand: {
        primary: '#3498db',
        primaryLight: '#aed6f1',
        secondary: '#1abc9c',
        warning: '#f5b041',
        warningLight: '#fdebd0'
      }
    }
  },
  css: [
    '@vue-flow/core/dist/style.css',
    '@vue-flow/core/dist/theme-default.css'
  ],
  plugins: [{ src: '~/plugins/db.js', mode: 'server' }],
  compatibilityDate: '2024-09-09',
  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET || 'default_secret_for_dev',
    public: {
      authOrigin: process.env.AUTH_ORIGIN,
      apiBase: process.env.API_BASE_URL || 'http://localhost:5000/api'
    }
  }
});
