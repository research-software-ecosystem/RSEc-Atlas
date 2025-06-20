export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  ssr: false,

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || "/",
  },

  build: {
    transpile: ["vuetify"],
  },

  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss", "@nuxt/ui"],
  css: ["@/assets/css/main.css"],
});
