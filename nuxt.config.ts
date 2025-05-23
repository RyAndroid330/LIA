export default defineNuxtConfig({
  meta: {
    script: [
      {
        src: 'https://cdn.jsdelivr.net/gh/MarketingPipeline/Markdown-Tag/markdown-tag-GitHub.js'
      }
    ]
  },
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
    isEnabled: true,
    originEnvKey: 'AUTH_ORIGIN',
    baseURL: 'http://localhost:4000/api/auth',
    providers: [
      {
        type: 'authjs',
        trustHost: false,
        defaultProvider: 'google',
        addDefaultCallbackUrl: true
      },
      {
        type: 'local',
        endpoints: {
          signIn: { path: '/login', method: 'post' },
          signOut: { path: '/logout', method: 'post' },
          getSession: { path: '/user/session', method: 'get' }
        }
      }
    ]
  },
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
  compatibilityDate: '2024-09-09',
  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET || 'default_secret_for_dev',
    public: {
      authOrigin: process.env.AUTH_ORIGIN,
      apiBase: process.env.API_BASE_URL || 'http://localhost:4000/api'
    }
  }
});
