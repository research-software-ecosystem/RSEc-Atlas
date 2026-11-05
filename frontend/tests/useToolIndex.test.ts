import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NO_DESCRIPTION } from "../utils/search-index";

const entries: ToolIndexEntry[] = [
  {
    tool_name: "bioconda/samtools",
    name: "samtools",
    license: "MIT",
    version: "1.21",
  },
  {
    tool_name: "constructor",
    name: "constructor",
    license: "MIT",
    version: "1",
  },
];

const fetchSearchIndex = vi.fn();
const fetchSearchDescriptions = vi.fn();

// The composable keeps its cache at module scope: each test loads it anew.
async function loadComposable() {
  vi.resetModules();
  const { useToolIndex } = await import("../composables/useToolIndex");
  return useToolIndex();
}

beforeEach(() => {
  // Nuxt auto-imports these into the composable.
  vi.stubGlobal("fetchSearchIndex", fetchSearchIndex);
  vi.stubGlobal("fetchSearchDescriptions", fetchSearchDescriptions);
  vi.stubGlobal("NO_DESCRIPTION", NO_DESCRIPTION);
  fetchSearchIndex.mockResolvedValue(entries);
  fetchSearchDescriptions.mockResolvedValue({
    "bioconda/samtools": "Tools for SAM files.",
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

describe("useToolIndex", () => {
  it("fetches the index once across calls", async () => {
    const { loadIndex } = await loadComposable();

    const [first, second] = await Promise.all([loadIndex(), loadIndex()]);
    const third = await loadIndex();

    expect(fetchSearchIndex).toHaveBeenCalledTimes(1);
    expect(first).toBe(entries);
    expect(second).toBe(entries);
    expect(third).toBe(entries);
  });

  it("fetches the index again after a failed load", async () => {
    fetchSearchIndex.mockRejectedValueOnce(new Error("offline"));
    const { loadIndex } = await loadComposable();

    await expect(loadIndex()).rejects.toThrow("offline");
    await expect(loadIndex()).resolves.toBe(entries);
    expect(fetchSearchIndex).toHaveBeenCalledTimes(2);
  });

  it("fills in the descriptions, own keys only", async () => {
    const { loadDescriptions } = await loadComposable();

    const described = await loadDescriptions();

    expect(described.map((entry) => entry.description)).toEqual([
      "Tools for SAM files.",
      NO_DESCRIPTION,
    ]);
    expect(fetchSearchIndex).toHaveBeenCalledTimes(1);
  });

  it("returns the described entries once they have loaded", async () => {
    const { loadIndex, loadDescriptions } = await loadComposable();

    const described = await loadDescriptions();

    await expect(loadIndex()).resolves.toBe(described);
    await loadDescriptions();
    expect(fetchSearchDescriptions).toHaveBeenCalledTimes(1);
  });

  it("fetches the descriptions again after a failed load", async () => {
    fetchSearchDescriptions.mockRejectedValueOnce(new Error("offline"));
    const { loadDescriptions } = await loadComposable();

    await expect(loadDescriptions()).rejects.toThrow("offline");
    await expect(loadDescriptions()).resolves.toHaveLength(2);
    expect(fetchSearchDescriptions).toHaveBeenCalledTimes(2);
    expect(fetchSearchIndex).toHaveBeenCalledTimes(1);
  });
});
