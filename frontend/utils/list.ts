// A quoted value may hold spaces; an unquoted one (or an unclosed quote) ends at whitespace.
const TAG_REGEX = /tag:(?:"([^"]*)"|'([^']*)'|["']?(\S*))/gi;

function tagValue(double?: string, single?: string, bare?: string): string {
  return (double ?? single ?? bare ?? "").trim();
}

export function parseQuery(query: string) {
  const tagQueries = [...query.matchAll(TAG_REGEX)].map((match) =>
    tagValue(match[1], match[2], match[3]),
  );

  const nonTagQueryString = query.replace(TAG_REGEX, "").trim();
  const nonTagQueries = nonTagQueryString
    .split(/[\s,]+/)
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0);

  const isStarTag = tagQueries.includes("*");

  return { tagQueries, nonTagQueries, isStarTag };
}

export function removeTagQuery(query: string, tag: string): string {
  const target = tag.trim().toLowerCase();

  return query
    .replace(
      TAG_REGEX,
      (token: string, double?: string, single?: string, bare?: string) =>
        tagValue(double, single, bare).toLowerCase() === target ? "" : token,
    )
    .replace(/\s+/g, " ")
    .trim();
}

function topicsOf(tool: ToolIndexEntry): string[] {
  return tool.topics ?? [];
}

function tagsOf(tool: ToolIndexEntry): string[] {
  return tool.tags ?? [];
}

// Until the descriptions have loaded, tools match on the rest only.
function descriptionOf(tool: ToolIndexEntry): string {
  return tool.description ?? "";
}

function filterToolsByTagsAndTopics(
  tools: ToolIndexEntry[],
  tagQueries: string[],
  allTopics: string[],
) {
  const filteredTopics = allTopics.filter((topic) =>
    tagQueries.some((query) => topic.toLowerCase().includes(query)),
  );
  const filteredTools = tools.filter((tool) => {
    const itemTags = [
      ...topicsOf(tool).map((tag) => tag.toLowerCase()),
      ...tagsOf(tool).map((tag) => tag.toLowerCase()),
    ];

    return tagQueries.every((query) => itemTags.includes(query));
  });

  return { filteredTools, filteredTopics };
}

function calculateMatchScore(
  tool: ToolIndexEntry,
  tagQueries: string[],
  nonTagQueries: string[],
) {
  const nameMatch = tool.name.toLowerCase();
  const slugMatch = getToolSlug(tool).toLowerCase();
  const descriptionMatch = descriptionOf(tool).toLowerCase();
  const tagsMatch = [
    ...topicsOf(tool).map((tag) => tag.toLowerCase()),
    ...tagsOf(tool).map((tag) => tag.toLowerCase()),
  ];
  let matchScore = 0;

  tagQueries.forEach((query) => {
    if (tagsMatch.some((tag) => tag.includes(query))) matchScore += 100;
  });

  nonTagQueries.forEach((query) => {
    if (nameMatch === query) matchScore += 100;
    // An exact ID beats partial names; a tool named after the query still wins.
    else if (slugMatch === query) matchScore += 90;
    else if (nameMatch.startsWith(query)) matchScore += 70;
    else if (nameMatch.includes(query)) matchScore += 50;
    else if (slugMatch.startsWith(query)) matchScore += 40;
    else if (slugMatch.includes(query)) matchScore += 30;
    else if (tagsMatch.some((tag) => tag.includes(query))) matchScore += 20;
    else if (descriptionMatch.includes(query)) matchScore += 10;
  });

  return matchScore;
}

export function searchTools(
  tools: ToolIndexEntry[],
  query: string,
  allTopics: string[],
): { tools: ToolIndexEntry[]; filteredTopics: string[] } {
  if (!query) return { tools, filteredTopics: [] };

  const { tagQueries, nonTagQueries, isStarTag } = parseQuery(query);
  let filteredTopics: string[];
  const prioritizedResults: { item: ToolIndexEntry; matchScore: number }[] = [];

  if (nonTagQueries.length) {
    tools = tools.filter((tool) =>
      nonTagQueries.some(
        (query) =>
          tool.name.toLowerCase() === query ||
          tool.name.toLowerCase().includes(query) ||
          getToolSlug(tool).toLowerCase().includes(query) ||
          descriptionOf(tool).toLowerCase().includes(query),
      ),
    );
  }

  if (isStarTag) {
    filteredTopics = allTopics;
  } else if (tagQueries.length > 0) {
    const { filteredTools, filteredTopics: topics } =
      filterToolsByTagsAndTopics(tools, tagQueries, allTopics);
    tools = filteredTools;
    filteredTopics = topics;
  } else {
    filteredTopics = allTopics.filter((topic) =>
      nonTagQueries.some((query) => topic.toLowerCase().includes(query)),
    );
  }

  tools.forEach((tool) => {
    const matchScore = calculateMatchScore(tool, tagQueries, nonTagQueries);

    const matchesTags = tagQueries.every(
      (query) =>
        topicsOf(tool).some((tag) => tag.toLowerCase().includes(query)) ||
        tagsOf(tool).some((tag) => tag.toLowerCase().includes(query)),
    );

    const matchesNonTags = nonTagQueries.some((query) => {
      const nameMatch = tool.name.toLowerCase();
      const slugMatch = getToolSlug(tool).toLowerCase();
      const descriptionMatch = descriptionOf(tool).toLowerCase();
      return (
        nameMatch.includes(query) ||
        slugMatch.includes(query) ||
        descriptionMatch.includes(query)
      );
    });

    if (matchScore > 0 && (matchesTags || matchesNonTags)) {
      prioritizedResults.push({ item: tool, matchScore });
    }
  });

  prioritizedResults.sort((a, b) => b.matchScore - a.matchScore);
  const uniqueResults = new Map(
    prioritizedResults.map((result) => [result.item, result.matchScore]),
  );

  return { tools: Array.from(uniqueResults.keys()), filteredTopics };
}

export function applyFilters(
  tools: ToolIndexEntry[],
  licenseFilter: string,
  dataFilter: string,
  favoritesFilter: string,
  // The base rule reads a parameter of a function type as an unused variable.
  // eslint-disable-next-line no-unused-vars
  isFavorite: (tool: ToolIndexEntry) => boolean,
): ToolIndexEntry[] {
  return tools.filter((tool) => {
    if (licenseFilter && licenseFilter !== "All") {
      const toolLicense = tool.license;
      if (toolLicense !== licenseFilter) return false;
    }

    if (dataFilter !== "All") {
      const contents = tool.contents;

      if (!contents) return false;
      else if (
        dataFilter === "Has Bioconda Package" &&
        !contents.includes("bioconda")
      ) {
        return false;
      } else if (
        dataFilter === "Has Containers" &&
        !contents.includes("biocontainers")
      ) {
        return false;
      } else if (
        dataFilter === "Compatible with Galaxy" &&
        !contents.includes("galaxy")
      ) {
        return false;
      }
    }

    if (favoritesFilter === "Favorites" && !isFavorite(tool)) {
      return false;
    }

    return true;
  });
}

export function sortByKey(
  tools: ToolIndexEntry[],
  sortKey: string,
): ToolIndexEntry[] {
  if (sortKey === "Name") {
    tools.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortKey === "Creation Date") {
    tools.sort((a, b) => (a.added ?? 0) - (b.added ?? 0));
  } else if (sortKey === "Last Updated") {
    tools.sort((a, b) => (a.updated ?? 0) - (b.updated ?? 0));
  }

  return tools;
}
