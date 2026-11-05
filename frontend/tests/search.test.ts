import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { getSearchRedirect, getTagSearchPath } from "../utils/search";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", component: {} },
    { path: "/search/:search", component: {} },
  ],
});

const queries = [
  "R&D",
  "a&b#c",
  "tag:'Sequence analysis'",
  'say "hi"',
  "c++",
  "100%",
  "50%25",
  "a=b",
  "über naïve 日本語",
  "with space",
];

describe("getSearchRedirect", () => {
  it.each(queries)("round-trips %j through the redirect URL", (query) => {
    const { fullPath } = router.resolve(getSearchRedirect(query));
    const parsed = new URL(fullPath, "http://localhost");
    expect(parsed.hash).toBe("");
    expect([...parsed.searchParams.keys()]).toEqual(["search"]);
    expect(parsed.searchParams.get("search")).toBe(query);
    expect(router.resolve(fullPath).query.search).toBe(query);
  });
});

const tags = [
  "Sequence analysis",
  "RNA-Seq & ChIP-seq",
  "C++ / C#",
  "100% pure?",
  "50%25",
  "über naïve 日本語",
  " padded ",
];

describe("getTagSearchPath", () => {
  it.each(tags)("links %j to the search route and back", (tag) => {
    const resolved = router.resolve(getTagSearchPath(tag));
    expect(resolved.name).toBeUndefined();
    expect(resolved.matched).toHaveLength(1);
    expect(resolved.params.search).toBe(`tag:'${tag.trim()}'`);
    expect(resolved.hash).toBe("");
    expect(resolved.query).toEqual({});
  });
});
