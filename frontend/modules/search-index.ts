import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { defineNuxtModule, useLogger } from "nuxt/kit";
import { buildSearchFiles } from "../utils/search-index";
// The global types of the app, which the build does not see by itself.
import type {} from "../types/tool";

// The home page searches a slim index of the catalogue rather than the full
// records, and fetches the descriptions in a second file once it shows the
// first results. Both are built from metadata/combined_metadata.json, written
// by backend/merge_data_files.py, with the getters the pages use.
export default defineNuxtModule({
  meta: { name: "search-index" },
  setup(_options, nuxt) {
    // nuxt prepare (postinstall, CI) only writes types: skip the 32 MB parse.
    if (nuxt.options._prepare) return;

    const logger = useLogger("search-index");
    const outputDir = join(nuxt.options.buildDir, "search-index");
    const combinedFile = resolve(
      nuxt.options.rootDir,
      nuxt.options.dir.public,
      "metadata/combined_metadata.json",
    );

    nuxt.options.nitro.publicAssets ||= [];
    nuxt.options.nitro.publicAssets.push({
      dir: outputDir,
      baseURL: "/metadata",
      maxAge: 0,
    });

    // Built with the app, so that nuxt dev and generate both emit it.
    nuxt.hook("build:before", async () => {
      await mkdir(outputDir, { recursive: true });

      if (!existsSync(combinedFile)) {
        logger.warn(
          `${combinedFile} not found: run backend/merge_data_files.py first. The home page cannot list tools without the search index.`,
        );
        return;
      }

      const tools: Tool[] = JSON.parse(await readFile(combinedFile, "utf8"));
      const { index, descriptions } = buildSearchFiles(tools);

      await writeFile(
        join(outputDir, "search_index.json"),
        JSON.stringify(index),
      );
      await writeFile(
        join(outputDir, "search_descriptions.json"),
        JSON.stringify(descriptions),
      );
      logger.success(`Search index built for ${index.length} tools`);
    });
  },
});
