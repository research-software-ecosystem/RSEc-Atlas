export function searchTools(
  tools: Tools,
  query: string,
  allTopics: string[],
): {
  tools: Tools;
  filteredTopics: string[];
} {
  const uniqueResults = new Set();

  let filteredTopics: string[] = [];
  let prioritizedResults: { item: Tool; matchScore: number }[] = [];

  if (query) {
    const searchParts = query
      .split(",")
      .map((part) => part && part.trim().toLowerCase());

    let tagQueries = searchParts
      .filter((part) => part.startsWith("tag:"))
      .map((part) => part && part.replace(/^tag:/, "").trim().toLowerCase());

    const isStarTag = tagQueries.filter((item) => item === "*");

    const nonTagQueries = searchParts
      .filter((part) => !part.startsWith("tag:"))
      .map((part) => part.trim().toLowerCase());

    tagQueries = tagQueries.filter((item) => item !== "*");

    if (isStarTag.length > 0) {
      filteredTopics = allTopics;
    } else if (tagQueries.length > 0) {
      filteredTopics = allTopics
        .filter((item) => {
          return tagQueries.some((part) => item.toLowerCase().includes(part));
        })
        .slice(0, 13);
      tools = tools
        .filter((item) => {
          const itemTags = getToolTopics(item).map((tag) =>
            tag.trim().toLowerCase(),
          );
          return tagQueries.every((query) =>
            itemTags.includes(query.trim().toLowerCase()),
          );
        })
        .slice(0, 13);
    } else {
      filteredTopics = allTopics.filter((item) => {
        return nonTagQueries.some((part) => item.toLowerCase().includes(part));
      });
    }

    if (nonTagQueries.length > 0) {
      tools = tools.filter((item) => {
        const nameMatch = getToolName(item).toLowerCase();
        const descriptionMatch = getToolDescription(item).toLowerCase();
        const tagsMatch = getToolTopics(item).map((tag) => tag.toLowerCase());

        return nonTagQueries.every(
          (part) =>
            nameMatch.includes(part) ||
            descriptionMatch.includes(part) ||
            tagsMatch.some((tag) => tag.includes(part)),
        );
      });
    }

    tools.forEach((item) => {
      const nameMatch = getToolName(item).toLowerCase();
      const descriptionMatch = getToolDescription(item).toLowerCase();
      const tagsMatch = getToolTopics(item).map((tag) => tag.toLowerCase());
      let matchScore = 0;

      tagQueries.forEach((part) => {
        if (tagsMatch.some((tag) => tag.includes(part))) {
          matchScore += 100;
        }
      });

      nonTagQueries.forEach((part) => {
        if (nameMatch === part) {
          matchScore += 100;
        } else if (nameMatch.startsWith(part)) {
          matchScore += 70;
        } else if (nameMatch.includes(part)) {
          matchScore += 50;
        } else if (tagsMatch.some((tag) => tag.includes(part))) {
          matchScore += 20;
        } else if (descriptionMatch.includes(part)) {
          matchScore += 10;
        }
      });

      if (matchScore > 0) {
        prioritizedResults.push({ item, matchScore });
      }
    });

    prioritizedResults.sort((a, b) => b.matchScore - a.matchScore);
    prioritizedResults.forEach((result) => uniqueResults.add(result.item));
  } else {
    tools.forEach((item) => uniqueResults.add(item));
  }

  return { tools: Array.from(uniqueResults) as Tools, filteredTopics };
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

    if (favoritesFilter === "Favorites" && !isToolFavorite(tool)) {
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
