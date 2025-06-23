import { defineStore } from "pinia";

export const useToolsStore = defineStore(
  "tools",
  () => {
    const favoriteTools = ref<string[]>([]);

    const isFavoriteTool = computed(() => {
      return (toolName: string) => {
        return favoriteTools.value.includes(toolName);
      };
    });

    function toggleFavoriteTool(toolName: string): void {
      const index = favoriteTools.value.indexOf(toolName);

      if (index === -1) {
        favoriteTools.value.push(toolName);
      } else {
        favoriteTools.value.splice(index, 1);
      }
    }

    return {
      favoriteTools,
      isFavoriteTool,
      toggleFavoriteTool,
    };
  },
  {
    persist: {
      storage: localStorage,
    },
  },
);
