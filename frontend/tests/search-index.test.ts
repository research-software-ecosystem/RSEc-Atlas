import { describe, expect, it } from "vitest";
import {
  buildSearchFiles,
  NO_DESCRIPTION,
  toIndexEntry,
} from "../utils/search-index";
import {
  getToolDescription,
  getToolLicense,
  getToolName,
  getToolTags,
  getToolTopics,
  getToolVersion,
} from "../utils/tools";

function makeTool(
  tool_name: string,
  fetched_metadata: Partial<Tool["fetched_metadata"]> = {},
  contents?: string[],
): Tool {
  return { tool_name, fetched_metadata, contents } as Tool;
}

const samtools = makeTool(
  "bioconda/samtools",
  {
    biotools: {
      id: "samtools",
      name: "SAMtools",
      summary: "Tools for SAM files.",
      license: "MIT",
      version: "1.19",
      addition_date: "2017-01-17T14:56:17Z",
      last_update_date: "2024-06-01T10:00:00Z",
      topic: [{ term: "Sequence analysis" }, { term: " Mapping " }],
      collections: ["htslib"],
    },
    bioconda: { name: "samtools", version: "1.21" },
  },
  ["biotools", "bioconda", "galaxy"],
);

const tagIdent = makeTool("biotools/tagident", {
  biotools: { id: "tagident", name: "TagIdent" },
});

describe("toIndexEntry", () => {
  it("returns what the getters return for the full record", () => {
    expect(toIndexEntry(samtools)).toEqual({
      tool_name: "bioconda/samtools",
      name: getToolName(samtools),
      description: getToolDescription(samtools),
      license: getToolLicense(samtools),
      version: getToolVersion(samtools),
      added: Date.parse("2017-01-17T14:56:17Z") / 1000,
      updated: Date.parse("2024-06-01T10:00:00Z") / 1000,
      topics: getToolTopics(samtools),
      tags: getToolTags(samtools),
      contents: ["biotools", "bioconda", "galaxy"],
    });
  });

  it("names a bio.tools-only tool after its bio.tools name", () => {
    expect(toIndexEntry(tagIdent).name).toBe("TagIdent");
  });

  it("leaves out empty topics, tags and invalid dates", () => {
    const entry = toIndexEntry(
      makeTool("galaxy/some_suite", {
        biotools: { id: "some_suite", addition_date: "not a date" },
      }),
    );

    expect(entry.topics).toBeUndefined();
    expect(entry.tags).toBeUndefined();
    expect(entry.added).toBeUndefined();
    expect(entry.updated).toBeUndefined();
    expect(entry.description).toBe(NO_DESCRIPTION);
  });
});

describe("buildSearchFiles", () => {
  it("ships the descriptions apart from the index", () => {
    const { index, descriptions } = buildSearchFiles([samtools, tagIdent]);

    expect(index.map((entry) => entry.tool_name)).toEqual([
      "bioconda/samtools",
      "biotools/tagident",
    ]);
    expect(index.every((entry) => !("description" in entry))).toBe(true);
    expect({ ...descriptions }).toEqual({
      "bioconda/samtools": "Tools for SAM files.",
    });
  });

  it("keeps the rest of each entry as toIndexEntry builds it", () => {
    const entry = toIndexEntry(samtools);
    delete entry.description;

    expect(buildSearchFiles([samtools]).index[0]).toEqual(entry);
  });

  // The page's $fetch drops a "__proto__" key on parse (destr), so such a tool
  // would read the default description there; this covers the emitted file only.
  it("keeps tool names that are Object keys as own keys in the emitted file", () => {
    const { descriptions } = buildSearchFiles([
      makeTool("__proto__", { biotools: { id: "a", summary: "Proto." } }),
      makeTool("constructor", { biotools: { id: "b", summary: "Built." } }),
    ]);
    const parsed = JSON.parse(JSON.stringify(descriptions));

    expect(Object.hasOwn(parsed, "__proto__")).toBe(true);
    expect(parsed["__proto__"]).toBe("Proto.");
    expect(parsed.constructor).toBe("Built.");
  });
});
