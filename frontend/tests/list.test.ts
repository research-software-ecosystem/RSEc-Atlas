import { describe, expect, it } from "vitest";
import { parseQuery, removeTagQuery } from "../utils/list";

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
