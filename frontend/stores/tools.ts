import { defineStore } from "pinia";

export const useToolsStore = defineStore(
  "tools",
  () => {
    // Favorites are keyed by tool_name, unique to each page. They used to be
    // kept in favoriteTools by display name, which homonyms from different
    // sources share; these move to favoriteToolNames once the tools load.
    const favoriteTools = ref<string[]>([]);
    const favoriteToolNames = ref<string[]>([]);

    const isFavoriteTool = computed(() => {
      return (tool: Tool) => {
        return (
          favoriteToolNames.value.includes(tool.tool_name) ||
          favoriteTools.value.includes(getToolName(tool))
        );
      };
    });

    function toggleFavoriteTool(tool: Tool): void {
      if (isFavoriteTool.value(tool)) {
        favoriteToolNames.value = favoriteToolNames.value.filter(
          (name) => name !== tool.tool_name,
        );
        favoriteTools.value = favoriteTools.value.filter(
          (name) => name !== getToolName(tool),
        );
      } else {
        favoriteToolNames.value.push(tool.tool_name);
      }
    }

    function migrateFavoriteTools(tools: Tools): void {
      if (favoriteTools.value.length === 0) return;

      const legacyNames = new Set(favoriteTools.value);
      const toolNames = new Set(favoriteToolNames.value);
      for (const tool of tools) {
        if (legacyNames.has(getToolName(tool))) toolNames.add(tool.tool_name);
      }
      favoriteToolNames.value = [...toolNames];
      favoriteTools.value = [];
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
