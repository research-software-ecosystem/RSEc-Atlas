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

export function getToolName(tool: Tool) {
  const { bioschemas, bioconda, biocontainers } = tool?.fetched_metadata;

  return (
    bioschemas?.name ||
    bioconda?.name ||
    biocontainers?.name ||
    tool.tool_name ||
    "Unknown Tool"
  );
}

export function getToolVersion(tool: Tool): string {
  const { bioschemas, bioconda, biotools } = tool?.fetched_metadata;

  return bioschemas?.version ||
    bioconda?.version ||
    Array.isArray(biotools?.version)
    ? biotools?.version?.[0] || "No version data"
    : biotools?.version || "No version data";
}

function formateDate(dateStr: string = ""): string {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return "---";
  } else {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }
}

export function getToolAdditionDate(tool: Tool): string {
  const { biotools } = tool.fetched_metadata;
  const dateStr = biotools?.addition_date;

  return formateDate(dateStr);
}

export function getToolLastUpdateDate(tool: Tool): string {
  const { biotools } = tool.fetched_metadata;
  const dateStr = biotools?.last_update_date;

  return formateDate(dateStr);
}

export function getToolFirstCommitDate(tool: Tool): string {
  const { galaxy } = tool.fetched_metadata;
  const dateStr = galaxy?.first_commit;

  return formateDate(dateStr);
}

export function getToolDescription(tool: Tool): string {
  if (!tool || !tool.fetched_metadata) {
    return "No description";
  }

  const { biotools, bioconda, biocontainers, galaxy } = tool.fetched_metadata;

  return (
    biotools?.summary ||
    bioconda?.summary ||
    biocontainers?.summary ||
    galaxy?.summary ||
    "No description"
  );
}

export function getToolTopics(tool: Tool): string[] {
  const { galaxy } = tool.fetched_metadata;

  return galaxy?.edam_topics || [];
}

export function getToolHomePage(tool: Tool): string {
  const { biotools, bioconda, galaxy } = tool.fetched_metadata;

  return biotools?.home || bioconda?.home || galaxy?.source || "";
}

export function getToolDocumentation(tool: Tool): string | undefined {
  const { bioconda } = tool.fetched_metadata;

  return bioconda?.documentation || undefined;
}

export function getToolEDAMOperations(tool: Tool): string[] {
  const { galaxy } = tool.fetched_metadata;

  return galaxy?.edam_operations || [];
}

export function getToolEDAMTopics(tool: Tool): string[] {
  const { galaxy } = tool.fetched_metadata;

  return galaxy?.edam_topics || [];
}

export function getToolPublications(tool: Tool): string[] {
  const { bioconda, biocontainers } = tool.fetched_metadata;

  const allPublications = [
    ...(bioconda?.identifiers || []),
    ...(biocontainers?.identifiers || []),
  ];

  const publications = allPublications
    .map((id) =>
      id.trim() && id.startsWith("doi:") ? `doi:${id.slice(4)}` : undefined,
    )
    .filter((id): id is string => id !== undefined);

  return Array.from(new Set(publications)).sort();
}

export function getLinkURL(link: string): string {
  if (link.trim().startsWith("doi:")) {
    return `https://doi.org/${link.slice(4)}`;
  } else if (link.trim().startsWith("bio.tools:")) {
    return `https://bio.tools/${link.slice(10)}`;
  } else if (link.trim().startsWith("usegalaxy-eu:")) {
    return `https://usegalaxy.eu/?tool_id=${link.slice(13)}`;
  } else {
    return link.trim();
  }
}

export function getToolWorkflows(tool: Tool): WorkflowDetails[] {
  const { galaxy } = tool.fetched_metadata;

  return galaxy?.related_workflows || [];
}

export function getToolTrainingMaterials(tool: Tool): string[] {
  const { galaxy } = tool.fetched_metadata;

  return galaxy?.related_tutorials || [];
}

export function getToolGalaxyUsageStats(tool: Tool): {
  usage: {
    last5Years: number;
    allTime: number;
  };
  users: {
    last5Years: number;
    allTime: number;
  };
} {
  const { galaxy } = tool.fetched_metadata;

  return {
    usage: {
      last5Years: galaxy?.usage_5_years || 0,
      allTime: galaxy?.usage_all_time || 0,
    },
    users: {
      last5Years: galaxy?.users_5_years || 0,
      allTime: galaxy?.users_all_time || 0,
    },
  };
}

export function getToolToolshedData(tool: Tool): {
  id: string;
  categories: string[];
} {
  const { galaxy } = tool.fetched_metadata;

  return {
    categories: galaxy?.toolshed_categories || [],
    id: galaxy?.toolshed_id || "",
  };
}

export function getToolBioToolsData(tool: Tool): {
  name: string;
  ids: string[];
} {
  const { galaxy } = tool.fetched_metadata;

  return {
    name: galaxy?.bio_tools_name || "",
    ids: galaxy?.bio_tools_ids || [],
  };
}

export function getToolCondaData(tool: Tool): {
  name: string;
  version: string;
} {
  const { galaxy } = tool.fetched_metadata;

  return {
    name: galaxy?.conda_name || "",
    version: galaxy?.conda_version || "",
  };
}

export function getToolInGalaxyAvailability(tool: Tool): {
  [country: string]: number;
} {
  const { galaxy } = tool.fetched_metadata;

  return galaxy?.no_of_tools || {};
}

export function getToolToolIds(tool: Tool): string[] {
  const { galaxy } = tool.fetched_metadata;

  return galaxy?.tool_ids || [];
}

export function getToolBicondaData(tool: Tool): {
  [key: string]: string | string[];
} {
  const { bioconda } = tool.fetched_metadata;

  return {
    name: bioconda?.name || "",
    version: bioconda?.version || "",
    home: bioconda?.home || "",
    license: bioconda?.license || "",
    summary: bioconda?.summary || "",
    homepage: bioconda?.homepage || "",
    documentation: bioconda?.documentation || "",
    identifiers: bioconda?.identifiers || [],
  };
}

export function getToolBiocontainersData(tool: Tool): {
  [key: string]: string | string[];
} {
  const { biocontainers } = tool.fetched_metadata;

  return {
    name: biocontainers?.name || "",
    license: biocontainers?.license || "",
    summary: biocontainers?.summary || "",
    identifiers: biocontainers?.identifiers || [],
  };
}

export function getToolTags(tool: Tool): string[] {
  const { biotools } = tool.fetched_metadata;

  return biotools?.collections || [];
}
