function parseQuery(query: string) {
  const tagRegex = /tag:(?:["']?(.*?)["']?)(?=\s|$)/g;
  const tagQueries: string[] = [];
  let match;

  while ((match = tagRegex.exec(query)) !== null) {
    tagQueries.push(match[1]);
  }

  const nonTagQueryString = query.replace(tagRegex, "").trim();
  const nonTagQueries = nonTagQueryString
    .split(/[\s,]+/)
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0);

  const isStarTag = tagQueries.includes("*");

  return { tagQueries, nonTagQueries, isStarTag };
}

function filterToolsByTags(
  tools: Tools,
  tagQueries: string[],
  allTopics: string[],
) {
  const filteredTopics = allTopics.filter((topic) =>
    tagQueries.some((query) => topic.toLowerCase().includes(query)),
  );
  const filteredTools = tools.filter((tool) => {
    const itemTags = getToolTopics(tool).map((tag) => tag.toLowerCase());
    return tagQueries.every((query) => itemTags.includes(query));
  });
  return { filteredTools, filteredTopics };
}

function filterToolsByTagsAndTopics(
  tools: Tools,
  tagQueries: string[],
  allTopics: string[],
) {
  const filteredTopics = allTopics.filter((topic) =>
    tagQueries.some((query) => topic.toLowerCase().includes(query)),
  );
  const filteredTools = tools.filter((tool) => {
    const itemTags = [
      ...getToolTopics(tool).map((tag) => tag.toLowerCase()),
      ...getToolTags(tool).map((tag) => tag.toLowerCase()),
    ];

    return tagQueries.every((query) => itemTags.includes(query));
  });

  return { filteredTools, filteredTopics };
}

function calculateMatchScore(
  tool: Tool,
  tagQueries: string[],
  nonTagQueries: string[],
) {
  const nameMatch = getToolName(tool).toLowerCase();
  const descriptionMatch = getToolDescription(tool).toLowerCase();
  const tagsMatch = [
    ...getToolTopics(tool).map((tag) => tag.toLowerCase()),
    ...getToolTags(tool).map((tag) => tag.toLowerCase()),
  ];
  let matchScore = 0;

  tagQueries.forEach((query) => {
    if (tagsMatch.some((tag) => tag.includes(query))) matchScore += 100;
  });

  nonTagQueries.forEach((query) => {
    if (nameMatch === query) matchScore += 100;
    else if (nameMatch.startsWith(query)) matchScore += 70;
    else if (nameMatch.includes(query)) matchScore += 50;
    else if (tagsMatch.some((tag) => tag.includes(query))) matchScore += 20;
    else if (descriptionMatch.includes(query)) matchScore += 10;
  });

  return matchScore;
}

export function searchTools(
  tools: Tools,
  query: string,
  allTopics: string[],
): { tools: Tools; filteredTopics: string[] } {
  if (!query) return { tools, filteredTopics: [] };

  const { tagQueries, nonTagQueries, isStarTag } = parseQuery(query);
  let filteredTopics: string[] = [];
  let prioritizedResults: { item: Tool; matchScore: number }[] = [];

  if (nonTagQueries.length) {
    tools = tools.filter((tool) =>
      nonTagQueries.some(
        (query) =>
          getToolName(tool).toLowerCase() === query ||
          getToolName(tool).toLowerCase().includes(query) ||
          getToolDescription(tool).toLowerCase().includes(query),
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
        getToolTopics(tool).some((tag) => tag.toLowerCase().includes(query)) ||
        getToolTags(tool).some((tag) => tag.toLowerCase().includes(query)),
    );

    const matchesNonTags = nonTagQueries.some((query) => {
      const nameMatch = getToolName(tool).toLowerCase();
      const descriptionMatch = getToolDescription(tool).toLowerCase();
      return nameMatch.includes(query) || descriptionMatch.includes(query);
    });

    if (matchScore > 0 && (matchesTags || matchesNonTags)) {
      prioritizedResults.push({ item: tool, matchScore });
    }
  });

  prioritizedResults.sort((a, b) => b.matchScore - a.matchScore);
  const uniqueResults = new Map(
    prioritizedResults.map((result) => [result.item, result.matchScore]),
  );

  return { tools: Array.from(uniqueResults.keys()) as Tools, filteredTopics };
}

export function applyFilters(
  tools: Tools,
  licenseFilter: string,
  dataFilter: string,
  favoritesFilter: string,
): Tools {
  return tools.filter((tool) => {
    if (licenseFilter && licenseFilter !== "All") {
      const toolLicense = getToolLicense(tool);
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

    const { isFavoriteTool } = useToolsStore();

    if (favoritesFilter === "Favorites" && !isFavoriteTool(getToolName(tool))) {
      return false;
    }

    return true;
  });
}

export function sortByKey(tools: Tools, sortKey: string): Tools {
  if (sortKey === "Name") {
    tools.sort((a, b) => getToolName(a).localeCompare(getToolName(b)));
  } else if (sortKey === "Creation Date") {
    tools.sort(
      (a, b) =>
        new Date(a.fetched_metadata.biotools?.addition_date || 0).getTime() -
        new Date(b.fetched_metadata.biotools?.addition_date || 0).getTime(),
    );
  } else if (sortKey === "Last Updated") {
    tools.sort(
      (a, b) =>
        new Date(a.fetched_metadata.biotools?.last_update_date || 0).getTime() -
        new Date(b.fetched_metadata.biotools?.last_update_date || 0).getTime(),
    );
  }

  return tools;
}
