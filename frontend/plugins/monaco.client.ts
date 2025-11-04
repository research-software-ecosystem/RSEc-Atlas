import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (import.meta.client) {
    try {
      // Set up Monaco Environment for Nuxt/Vite
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).MonacoEnvironment = {
        getWorker(_: unknown, label: string): Worker {
          try {
            if (label === "json") {
              return new jsonWorker();
            }
            if (label === "css" || label === "scss" || label === "less") {
              return new cssWorker();
            }
            if (
              label === "html" ||
              label === "handlebars" ||
              label === "razor"
            ) {
              return new htmlWorker();
            }
            if (label === "typescript" || label === "javascript") {
              return new tsWorker();
            }
            // Default editor worker
            return new editorWorker();
          } catch (error) {
            console.error(
              `Failed to create Monaco worker for ${label}:`,
              error,
            );
            // Fallback to default worker on error
            return new editorWorker();
          }
        },
      };
    } catch (error) {
      console.error("Failed to initialize Monaco Editor environment:", error);
    }
  }
});
