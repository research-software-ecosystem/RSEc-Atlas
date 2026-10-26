import { defineStore } from "pinia";

export const useToolsStore = defineStore(
  "tools",
  () => {
    // Favorites are keyed by tool_name, unique to each page. They used to be
    // keyed by display name, which homonyms from different sources share.
    const favoriteTools = ref<string[]>([]);
    const favoritesByToolName = ref(false);

    function isLegacyFavorite(tool: Tool): boolean {
      return (
        !favoritesByToolName.value &&
        favoriteTools.value.includes(getToolName(tool))
      );
    }

    const isFavoriteTool = computed(() => {
      return (tool: Tool) => {
        return (
          favoriteTools.value.includes(tool.tool_name) || isLegacyFavorite(tool)
        );
      };
    });

    function toggleFavoriteTool(tool: Tool): void {
      if (isFavoriteTool.value(tool)) {
        const legacyName = isLegacyFavorite(tool) ? getToolName(tool) : null;
        favoriteTools.value = favoriteTools.value.filter(
          (name) => name !== tool.tool_name && name !== legacyName,
        );
      } else {
        favoriteTools.value.push(tool.tool_name);
      }
    }

    function migrateFavoriteTools(tools: Tools): void {
      if (favoritesByToolName.value) return;

      const favorites = new Set(favoriteTools.value);
      favoriteTools.value = tools
        .filter(
          (tool) =>
            favorites.has(tool.tool_name) || favorites.has(getToolName(tool)),
        )
        .map((tool) => tool.tool_name);
      favoritesByToolName.value = true;
    }

    return {
      favoriteTools,
      favoritesByToolName,
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
