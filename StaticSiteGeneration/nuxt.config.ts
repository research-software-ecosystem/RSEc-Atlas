export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },

  ssr: false, // Enable SSR, which works for static site generation

  app: {
    baseURL: '/StudyProject/',
  },

  generate: {
    routes: [],
  },

  build: {
    transpile: ['vuetify']
  },
});
