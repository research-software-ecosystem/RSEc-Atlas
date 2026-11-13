import { describe, expect, it } from "vitest";
import { getToolName, getToolVersion } from "../utils/tools";

function makeTool(
  tool_name: string,
  fetched_metadata: Partial<Tool["fetched_metadata"]> = {},
): Tool {
  return { tool_name, fetched_metadata } as Tool;
}

describe("getToolName", () => {
  it("uses the bio.tools name of a bio.tools-only tool", () => {
    expect(
      getToolName(
        makeTool("biotools/tagident", {
          biotools: { id: "tagident", name: "TagIdent" },
        }),
      ),
    ).toBe("TagIdent");
  });

  it("keeps the bioconda name when bio.tools also has one", () => {
    expect(
      getToolName(
        makeTool("bioconda/samtools", {
          biotools: { id: "samtools", name: "SAMtools" },
          bioconda: { name: "samtools" },
        }),
      ),
    ).toBe("samtools");
  });

  it("keeps the bioschemas name when bio.tools also has one", () => {
    expect(
      getToolName(
        makeTool("biotools/tool", {
          bioschemas: { name: "Schema Name" },
          biotools: { id: "tool", name: "bio.tools Name" },
        }),
      ),
    ).toBe("Schema Name");
  });

  it("keeps the Debian package name when bio.tools also has one", () => {
    expect(
      getToolName(
        makeTool("debian/tool", {
          biotools: { id: "tool", name: "bio.tools Name" },
          debian: { name: "debian-tool" },
        }),
      ),
    ).toBe("debian-tool");
  });

  it("falls back to the last part of tool_name", () => {
    expect(getToolName(makeTool("galaxy/some_suite", {}))).toBe("some_suite");
  });

  it("falls back to tool_name when the bio.tools name is blank", () => {
    expect(
      getToolName(
        makeTool("biotools/t2t_report", {
          biotools: { id: "t2t_report", name: "  " },
        }),
      ),
    ).toBe("t2t_report");
  });

  it("returns Unknown Tool when nothing names the tool", () => {
    expect(getToolName({} as Tool)).toBe("Unknown Tool");
  });
});

describe("getToolVersion", () => {
  const macroVersion = "@TOOL_VERSION@+galaxy@VERSION_SUFFIX@";

  it("uses the Galaxy conda version of a Galaxy-only tool", () => {
    expect(
      getToolVersion(
        makeTool("galaxy/anndata2ri", {
          galaxy: { version: macroVersion, conda_version: "2.0.1" },
        }),
      ),
    ).toBe("2.0.1");
  });

  it("picks the highest version when Bioconda also has one", () => {
    expect(
      getToolVersion(
        makeTool("bioconda/tool", {
          bioconda: { version: "1.0" },
          galaxy: { version: macroVersion, conda_version: "2.0.1" },
        }),
      ),
    ).toBe("2.0.1");
  });

  it("returns No version data without a Galaxy conda version", () => {
    expect(
      getToolVersion(
        makeTool("galaxy/ete", { galaxy: { version: macroVersion } }),
      ),
    ).toBe("No version data");
  });
});
