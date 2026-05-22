import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Modules
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/google-fonts',
    '@nuxtjs/i18n',
  ],

  // Tailwind CSS v4 via Vite plugin
  vite: {
    plugins: [tailwindcss()],
  },

  // CSS
  css: ['~/assets/css/main.css'],

  // Components Configuration
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // Google Fonts
  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700],
    },
    display: 'swap',
  },

  // Supabase
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/dashboard',
      exclude: ['/', '/auth/*', '/onboarding', '/dashboard', '/chat', '/chat/*', '/mood', '/mood/*', '/community', '/community/*', '/profile'],
    },
  },

  // i18n
  i18n: {
    locales: [
      { code: 'id', file: 'id.json', name: 'Bahasa Indonesia' },
      { code: 'en', file: 'en.json', name: 'English' },
    ],
    defaultLocale: 'id',
    strategy: 'no_prefix',
  },

  // Runtime config
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    public: {
      appName: 'RuangTeduh',
    },
  },

  // App config
  app: {
    head: {
      title: 'RuangTeduh — Tempat Beristirahat Saat Hidup Terasa Berat',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Platform dukungan emosional yang aman dan menenangkan. Berbagi perasaan, chat dengan AI, dan terhubung dengan komunitas yang suportif.' },
        { name: 'theme-color', content: '#5B6CFA' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  // Experimental features
  experimental: {
    typedPages: true,
  },
})
