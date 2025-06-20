export function getToolLicense(tool: Tool): string {
  const { biotools, bioschemas, bioconda, biocontainers } =
    tool.fetched_metadata;

  const possibleLicenses = [
    biotools?.license,
    bioschemas?.license,
    bioconda?.license,
    biocontainers?.license,
  ].map((l) => l?.trim());

  for (const lic of possibleLicenses) {
    if (lic && lic.toLowerCase() !== "not available") {
      return lic;
    }
  }

  return "No License Info";
}

export function isToolFavorite(tool: Tool): boolean {
  const favoriteTools = JSON.parse(localStorage.getItem("favorites") ?? "[]");

  return favoriteTools.some((i: Tool) => i.tool_name === tool.tool_name);
}

export function toggleToolFavorite(tool: Tool) {
  let favoriteTools = JSON.parse(localStorage.getItem("favorites") ?? "[]");

  if (isToolFavorite(tool)) {
    favoriteTools = favoriteTools.filter(
      (i: any) => i.tool_name !== tool.tool_name,
    );
  } else {
    favoriteTools.push(tool);
  }

  localStorage.setItem("favorites", JSON.stringify(favoriteTools));
}

export function getToolName(tool: Tool) {
  const { bioschemas, bioconda, biocontainers } = tool.fetched_metadata;

  return (
    bioschemas?.name || bioconda?.name || biocontainers?.name || tool.tool_name
  );
}

export function getToolVersion(tool: Tool): string {
  const { bioschemas, bioconda, biotools } = tool.fetched_metadata;

  return (
    bioschemas?.version ||
    bioconda?.version ||
    biotools?.version?.[0] ||
    "No version data"
  );
}

export function getToolDescription(tool: Tool): string {
  const { biotools, bioconda, biocontainers, galaxy } = tool.fetched_metadata;

  return (
    biotools?.summary ||
    bioconda?.summary ||
    biocontainers?.summary ||
    galaxy?.summary ||
    "No Description"
  );
}

export function getToolTopics(tool: Tool): string[] {
  return tool.fetched_metadata.galaxy?.edam_topics || [];
}
