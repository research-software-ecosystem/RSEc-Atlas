import { defineStore } from "pinia";

export const useToolsStore = defineStore(
  "tools",
  () => {
    // Favorites are keyed by tool_name, unique to each page. They used to be
    // kept in favoriteTools by display name, which homonyms from different
    // sources share; these move to favoriteToolNames once the tools load.
    const favoriteTools = ref<string[]>([]);
    const favoriteToolNames = ref<string[]>([]);

    // A page merged into this one may have been saved under its own name,
    // which is now one of the identifiers of this one (bioconda/samtools).
    function toolKeys(tool: Tool): string[] {
      return [
        tool.tool_name,
        ...(tool.identifiers || []).map((id) => id.replace(":", "/")),
      ];
    }

    const isFavoriteTool = computed(() => {
      return (tool: Tool) => {
        return (
          toolKeys(tool).some((key) => favoriteToolNames.value.includes(key)) ||
          favoriteTools.value.includes(getToolName(tool))
        );
      };
    });

    function toggleFavoriteTool(tool: Tool): void {
      if (isFavoriteTool.value(tool)) {
        const keys = toolKeys(tool);
        favoriteToolNames.value = favoriteToolNames.value.filter(
          (name) => !keys.includes(name),
        );
        favoriteTools.value = favoriteTools.value.filter(
          (name) => name !== getToolName(tool),
        );
      } else {
        favoriteToolNames.value.push(tool.tool_name);
      }
    }

    // Saved names that are no longer a page, because their page was merged
    // into another one, resolve through the aliases of the Atlas.
    async function resolveToolName(
      name: string,
      toolNames: Set<string>,
    ): Promise<string | undefined> {
      if (toolNames.has(name)) return name;
      const canonicalName = await fetchToolAlias(name);
      return canonicalName && toolNames.has(canonicalName)
        ? canonicalName
        : undefined;
    }

    async function migrateFavoriteTools(tools: Tools): Promise<void> {
      const toolNames = new Set(tools.map((tool) => tool.tool_name));
      const displayNames = new Set(tools.map((tool) => getToolName(tool)));
      // Galaxy suites used to have pages named after their ID, which their
      // display name no longer matches once merged into another tool.
      const unmatchedNames = favoriteTools.value.filter(
        (name) => !displayNames.has(name),
      );
      const keys = [
        ...new Set([...favoriteToolNames.value, ...unmatchedNames]),
      ];
      const resolved = await Promise.all(
        keys.map((key) => resolveToolName(key, toolNames)),
      );
      // Names resolving to no page are kept, in case their page comes back.
      const renamed = new Map(keys.map((key, i) => [key, resolved[i] ?? key]));

      // Read after the lookups, so that a favorite removed meanwhile stays
      // removed.
      const legacyNames = [...favoriteTools.value];
      const migrated = tools
        .filter(
          (tool) =>
            legacyNames.includes(getToolName(tool)) ||
            legacyNames.includes(tool.tool_name),
        )
        .map((tool) => tool.tool_name);
      const unmatched = legacyNames.filter((name) => !displayNames.has(name));

      favoriteToolNames.value = [
        ...new Set([
          ...migrated,
          ...[...favoriteToolNames.value, ...unmatched].map(
            (key) => renamed.get(key) ?? key,
          ),
        ]),
      ];
      favoriteTools.value = favoriteTools.value.filter(
        (name) => !legacyNames.includes(name),
      );
    }

    return {
      favoriteTools,
      favoriteToolNames,
      isFavoriteTool,
      toggleFavoriteTool,
      migrateFavoriteTools,
    };
  },
  {
    persist: {
      storage: localStorage,
    },
  },
);
