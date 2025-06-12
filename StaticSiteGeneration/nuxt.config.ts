import path from "path";

const repoName = path.basename(__dirname);

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },

  ssr: false,

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || `/${repoName}/`,
  },

  generate: {
    routes: [],
  },

  build: {
    transpile: ["vuetify"],
  },

  modules: ["@pinia/nuxt"],
});
