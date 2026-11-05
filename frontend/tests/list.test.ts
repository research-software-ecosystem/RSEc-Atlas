import { beforeAll, describe, expect, it, vi } from "vitest";
import { parseQuery, removeTagQuery, searchTools } from "../utils/list";
import * as toolGetters from "../utils/tools";

// Nuxt auto-imports these getters into list.ts at build time.
beforeAll(() => {
  for (const name of [
    "getToolName",
    "getToolSlug",
    "getToolDescription",
    "getToolTopics",
    "getToolTags",
  ] as const) {
    vi.stubGlobal(name, toolGetters[name]);
  }
});

function makeTool(
  tool_name: string,
  fetched_metadata: Partial<Tool["fetched_metadata"]> = {},
): Tool {
  return { tool_name, fetched_metadata } as Tool;
}

function searchNames(tools: Tools, query: string): string[] {
  return searchTools(tools, query, []).tools.map((tool) => tool.tool_name);
}

describe("parseQuery", () => {
  it("reads a one-word tag", () => {
    expect(parseQuery("tag:genomics")).toEqual({
      tagQueries: ["genomics"],
      nonTagQueries: [],
      isStarTag: false,
    });
  });

  it("reads a single-quoted multi-word tag", () => {
    expect(parseQuery("tag:'sequence analysis'")).toEqual({
      tagQueries: ["sequence analysis"],
      nonTagQueries: [],
      isStarTag: false,
    });
  });

  it("reads a double-quoted multi-word tag", () => {
    expect(parseQuery('tag:"sequence analysis"')).toEqual({
      tagQueries: ["sequence analysis"],
      nonTagQueries: [],
      isStarTag: false,
    });
  });

  it("keeps commas inside a quoted tag", () => {
    expect(
      parseQuery("tag:'data architecture, analysis and design'").tagQueries,
    ).toEqual(["data architecture, analysis and design"]);
  });

  it("trims spaces inside the quotes", () => {
    expect(parseQuery("tag:' sequence analysis '").tagQueries).toEqual([
      "sequence analysis",
    ]);
  });

  it("treats tag:* as the star tag", () => {
    expect(parseQuery("tag:*")).toEqual({
      tagQueries: ["*"],
      nonTagQueries: [],
      isStarTag: true,
    });
  });

  it("splits a tag from free text", () => {
    expect(parseQuery("tag:genomics blast")).toEqual({
      tagQueries: ["genomics"],
      nonTagQueries: ["blast"],
      isStarTag: false,
    });
  });

  it("keeps free text around a removed multi-word tag", () => {
    expect(parseQuery("blast tag:'sequence analysis' fast")).toEqual({
      tagQueries: ["sequence analysis"],
      nonTagQueries: ["blast", "fast"],
      isStarTag: false,
    });
  });

  it("reads two tags", () => {
    expect(
      parseQuery("tag:'sequence analysis' tag:genomics").tagQueries,
    ).toEqual(["sequence analysis", "genomics"]);
  });

  it("reads an upper-case TAG: prefix", () => {
    expect(parseQuery("TAG:'Sequence analysis' blast")).toEqual({
      tagQueries: ["Sequence analysis"],
      nonTagQueries: ["blast"],
      isStarTag: false,
    });
  });

  it("reads a tag that is still being typed", () => {
    expect(parseQuery("tag:'sequ").tagQueries).toEqual(["sequ"]);
    expect(parseQuery("tag:").tagQueries).toEqual([""]);
  });
});

describe("removeTagQuery", () => {
  it("removes a multi-word tag and keeps the rest", () => {
    expect(
      removeTagQuery(
        "blast tag:'Sequence analysis' tag:genomics",
        "Sequence analysis",
      ),
    ).toBe("blast tag:genomics");
  });

  it("ignores case and quote style", () => {
    expect(
      removeTagQuery('tag:"sequence ANALYSIS" blast', "Sequence analysis"),
    ).toBe("blast");
  });

  it("removes a tag with an upper-case TAG: prefix", () => {
    expect(
      removeTagQuery("TAG:'Sequence analysis' blast", "sequence analysis"),
    ).toBe("blast");
  });

  it("leaves a tag that only starts with the same words", () => {
    expect(
      removeTagQuery("tag:'sequence analysis tools'", "Sequence analysis"),
    ).toBe("tag:'sequence analysis tools'");
  });
});

describe("searchTools", () => {
  const t2tReport = makeTool("biotools/t2t_report", {
    biotools: {
      id: "t2t_report",
      name: "Summarize taxonomy",
      summary: "Reports taxa.",
    },
  });
  const taxonomy = makeTool("bioconda/taxonomy", {
    bioconda: { name: "taxonomy", summary: "Taxonomy helpers." },
  });
  const t2tFasta = makeTool("bioconda/t2t_fasta", {
    bioconda: { name: "t2t_report_fasta", summary: "Unrelated." },
  });

  it("finds a tool by its ID when its name differs", () => {
    expect(searchNames([taxonomy, t2tReport], "t2t_report")).toEqual([
      "biotools/t2t_report",
    ]);
  });

  it("finds a tool by part of its ID", () => {
    expect(searchNames([taxonomy, t2tReport], "t2t")).toEqual([
      "biotools/t2t_report",
    ]);
  });

  it("still finds a tool by its name", () => {
    expect(searchNames([taxonomy, t2tReport], "summarize")).toEqual([
      "biotools/t2t_report",
    ]);
  });

  it("finds a tool by its ID next to the star tag", () => {
    expect(searchNames([t2tReport], "tag:* t2t_report")).toEqual([
      "biotools/t2t_report",
    ]);
  });

  it("ranks an exact ID above a partial name match", () => {
    const hdn = makeTool("biotools/hdn", {
      biotools: { id: "hdn", name: "Health Data Nexus" },
    });
    const hdnapipe = makeTool("biotools/hdnapipe", {
      biotools: { id: "hdnapipe", name: "hDNApipe" },
    });
    const pathdnn = makeTool("biotools/pathdnn", {
      biotools: { id: "pathdnn", name: "pathDNN" },
    });

    expect(searchNames([hdnapipe, pathdnn, hdn], "hdn")).toEqual([
      "biotools/hdn",
      "biotools/hdnapipe",
      "biotools/pathdnn",
    ]);
  });

  it("ranks an exact name above an exact ID", () => {
    const namedT2tReport = makeTool("bioconda/t2t", {
      bioconda: { name: "t2t_report" },
    });

    expect(searchNames([t2tReport, namedT2tReport], "t2t_report")).toEqual([
      "bioconda/t2t",
      "biotools/t2t_report",
    ]);
  });

  it("ranks a partial name match above a partial ID match", () => {
    expect(searchNames([t2tReport, t2tFasta], "t2t")).toEqual([
      "bioconda/t2t_fasta",
      "biotools/t2t_report",
    ]);
  });
});
