export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },

  ssr: false, // Enable SSR, which works for static site generation

  generate: {
    routes: [],
  },

  nitro: {
    prerender: {
      routes: ["/404"],
    },
  },

  build: {
    transpile: ['vuetify']
  },
});
