// The search index and its descriptions are loaded once per visit: going back
// to the home page reuses them instead of fetching and parsing them again.
// A failed load is forgotten, so that a retry fetches it anew.
let indexLoad: Promise<ToolIndexEntry[]> | undefined;
let describedLoad: Promise<ToolIndexEntry[]> | undefined;
let described: ToolIndexEntry[] | undefined;

function loadEntries(): Promise<ToolIndexEntry[]> {
  indexLoad ??= fetchSearchIndex().catch((error) => {
    indexLoad = undefined;
    throw error;
  });
  return indexLoad;
}

function loadDescribedEntries(): Promise<ToolIndexEntry[]> {
  describedLoad ??= Promise.all([loadEntries(), fetchSearchDescriptions()])
    .then(([entries, descriptions]) => {
      described = entries.map((entry) => ({
        ...entry,
        // Own keys only: a tool named "constructor" must not read Object's.
        description: Object.hasOwn(descriptions, entry.tool_name)
          ? descriptions[entry.tool_name]
          : NO_DESCRIPTION,
      }));
      return described;
    })
    .catch((error) => {
      describedLoad = undefined;
      throw error;
    });
  return describedLoad;
}

export function useToolIndex() {
  return {
    // The entries, with their descriptions once these have loaded.
    loadIndex: async () => described ?? (await loadEntries()),
    // The same entries with their descriptions.
    loadDescriptions: loadDescribedEntries,
  };
}
