import { defineStore } from "pinia";

export const useToolsStore = defineStore("tools", {
  state: () => ({
    metadata: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchMetadata() {
      this.loading = true;
      this.error = null;
      try {
        this.metadata = await $fetch("/metadata/combined_metadata.json");
      } catch (err) {
        this.error = err;
        console.error("Error fetching metadata:", err);
      } finally {
        this.loading = false;
      }
    },
    async fetchToolMetadata(toolName) {
      this.loading = true;
      this.error = null;
      try {
        const toolMetadata = await $fetch(`/metadata/tools/${toolName}.json`);
        return toolMetadata;
      } catch (err) {
        this.error = err;
        console.error(`Error fetching metadata for tool ${toolName}:`, err);
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
