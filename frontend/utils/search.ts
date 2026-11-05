// Router location for the home page search; the router encodes the query value.
export function getSearchRedirect(search: string) {
  return { path: "/", query: { search } };
}
