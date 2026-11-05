// Router location for the home page search; the router encodes the query value.
export function getSearchRedirect(search: string) {
  return { path: "/", query: { search } };
}

// Link to /search/[search] for a tag or topic; the segment is encoded so `#`, `?`, `%` and `/` survive.
export function getTagSearchPath(tag: string) {
  return `/search/${encodeURIComponent(`tag:'${tag.trim()}'`)}`;
}
