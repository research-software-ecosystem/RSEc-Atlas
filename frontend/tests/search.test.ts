import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { getSearchRedirect } from "../utils/search";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/", component: {} }],
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
