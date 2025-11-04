export default defineNuxtPlugin(() => {
  // Only run on client side
  if (import.meta.client) {
    try {
      // Set up Monaco Environment for Nuxt/Vite
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).MonacoEnvironment = {
        getWorker(_: unknown, label: string): Worker {
          // Dynamic imports with proper worker URLs for Vite
          try {
            if (label === "json") {
              return new Worker(
                new URL(
                  "monaco-editor/esm/vs/language/json/json.worker",
                  import.meta.url,
                ),
                { type: "module" },
              );
            }
            if (label === "css" || label === "scss" || label === "less") {
              return new Worker(
                new URL(
                  "monaco-editor/esm/vs/language/css/css.worker",
                  import.meta.url,
                ),
                { type: "module" },
              );
            }
            if (
              label === "html" ||
              label === "handlebars" ||
              label === "razor"
            ) {
              return new Worker(
                new URL(
                  "monaco-editor/esm/vs/language/html/html.worker",
                  import.meta.url,
                ),
                { type: "module" },
              );
            }
            if (label === "typescript" || label === "javascript") {
              return new Worker(
                new URL(
                  "monaco-editor/esm/vs/language/typescript/ts.worker",
                  import.meta.url,
                ),
                { type: "module" },
              );
            }
            // Default editor worker
            return new Worker(
              new URL(
                "monaco-editor/esm/vs/editor/editor.worker",
                import.meta.url,
              ),
              { type: "module" },
            );
          } catch (error) {
            console.error(
              `Failed to create Monaco worker for ${label}:`,
              error,
            );
            // Fallback to default worker on error
            return new Worker(
              new URL(
                "monaco-editor/esm/vs/editor/editor.worker",
                import.meta.url,
              ),
              { type: "module" },
            );
          }
        },
      };
    } catch (error) {
      console.error("Failed to initialize Monaco Editor environment:", error);
    }
  }
});
