export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },

  ssr: false,

  app: {
    baseURL: "/StudyProject/",
  },

  generate: {
    routes: [],
  },

  build: {
    transpile: ["vuetify"],
  },

  modules: ["@pinia/nuxt"],
});
