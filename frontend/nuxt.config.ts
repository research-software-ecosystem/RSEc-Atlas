import monacoEditorPlugin from "vite-plugin-monaco-editor-esm";

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  ssr: false,

  runtimeConfig: {
    public: {
      appTitle: process.env.APP_TITLE || "RSEc Atlas",
    },
  },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || "/",
    head: {
      title: process.env.APP_TITLE || "RSEc Atlas",
      meta: [
        {
          name: "description",
          content:
            process.env.APP_DESCRIPTION ||
            "A webapp to browse through all the bio tools and containers in the Research Software Ecosystem repository.",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/img/logo-rsec.svg" }],
    },
  },

  modules: [
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxt/ui",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxt/eslint",
  ],

  css: ["@/assets/css/main.css"],

  vite: {
    plugins: [
      monacoEditorPlugin({
        languageWorkers: [],
        customWorkers: [
          {
            label: "editorWorkerService",
            entry: "monaco-editor/esm/vs/editor/editor.worker.js",
          },
          {
            label: "css",
            entry: "monaco-editor/esm/vs/language/css/css.worker.js",
          },
          {
            label: "html",
            entry: "monaco-editor/esm/vs/language/html/html.worker.js",
          },
          {
            label: "json",
            entry: "monaco-editor/esm/vs/language/json/json.worker.js",
          },
          {
            label: "typescript",
            entry: "monaco-editor/esm/vs/language/typescript/ts.worker.js",
          },
        ],
      }),
    ],
    optimizeDeps: {
      include: ["monaco-editor"],
    },
  },
});
