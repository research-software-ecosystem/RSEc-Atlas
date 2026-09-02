export async function fetchAllToolsMetadata(): Promise<Tool[]> {
  try {
    const response = await $fetch("/metadata/combined_metadata.json");
    return response as Tool[];
  } catch (error) {
    throw new Error(`Failed to fetch all tools metadata: ${error}`, {
      cause: error,
    });
  }
}

export async function fetchToolMetadata(toolName: string): Promise<Tool> {
  try {
    const response = await $fetch(`/metadata/tools/${toolName}.json`);
    return response as Tool;
  } catch (error) {
    throw new Error(`Failed to fetch tool metadata: ${toolName}: ${error}`, {
      cause: error,
    });
  }
}

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
  const { bioschemas, bioconda, biocontainers } = tool?.fetched_metadata || {};

  return (
    bioschemas?.name ||
    bioconda?.name ||
    biocontainers?.name ||
    tool.tool_name ||
    "Unknown Tool"
  );
}

function normalizeVersion(
  value?: string | string[] | number | number[],
): string[] {
  if (value === undefined || value === null) return [];
  const entries = Array.isArray(value) ? value : [value];

  return entries
    .map((entry) => String(entry).trim().replace(/^v/i, ""))
    .filter((entry): entry is string => Boolean(entry));
}

function parseVersion(version: string): { core: number[]; prerelease: string } {
  const [corePart, ...rest] = version.split("-");
  const core = corePart.split(".").map((n) => parseInt(n, 10) || 0);
  return { core, prerelease: rest.join("-") };
}

function compareVersions(a: string, b: string): number {
  const parsedA = parseVersion(a);
  const parsedB = parseVersion(b);

  // Compare core version segments
  const maxLen = Math.max(parsedA.core.length, parsedB.core.length);
  for (let i = 0; i < maxLen; i++) {
    const segA = parsedA.core[i] ?? 0;
    const segB = parsedB.core[i] ?? 0;
    if (segA !== segB) return segA - segB;
  }

  // If core versions are equal, handle pre-release:
  // - No pre-release > has pre-release (1.0.0 > 1.0.0-alpha)
  // - Compare pre-release strings lexicographically
  if (!parsedA.prerelease && parsedB.prerelease) return 1;
  if (parsedA.prerelease && !parsedB.prerelease) return -1;
  return parsedA.prerelease.localeCompare(parsedB.prerelease, "en", {
    numeric: true,
  });
}

function pickLatestVersion(versions: string[]): string {
  if (versions.length === 0) return "";

  return versions.reduce((latest, current) => {
    return compareVersions(current, latest) > 0 ? current : latest;
  });
}

export function getToolVersion(tool: Tool): string {
  const fm = tool?.fetched_metadata;
  if (!fm) return "No version data";

  const versions = [
    ...normalizeVersion(fm.bioschemas?.version),
    ...normalizeVersion(fm.bioconda?.version),
    ...normalizeVersion(fm.biotools?.version),
    ...normalizeVersion(fm.galaxy?.conda_version),
  ];

  return pickLatestVersion(versions) || "No version data";
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

export function normalizeDOI(doi: string): string {
  const trimmed = doi.trim();
  let decoded = trimmed;

  try {
    // Some records arrive percent-encoded (10.1038%2Fs41551-021-00770-5).
    decoded = decodeURIComponent(trimmed);
  } catch {
    // A malformed escape is not worth losing the reference over.
  }

  return decoded
    .replace(/^doi:/i, "")
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .trim();
}

function publicationKey(doi?: string, pmid?: string): string | undefined {
  if (doi) return `doi:${doi.toLowerCase()}`;
  if (pmid) return `pmid:${pmid}`;
  return undefined;
}

function primaryFirst(publication: PublicationRef): number {
  return publication.type?.some((type) => /primary/i.test(type)) ? 0 : 1;
}

export function getToolPublications(tool: Tool): PublicationRef[] {
  const { biotools, bioconda, biocontainers } = tool.fetched_metadata;

  const publications = new Map<string, PublicationRef>();

  for (const publication of biotools?.publication || []) {
    const doi = publication.doi ? normalizeDOI(publication.doi) : undefined;
    const key = publicationKey(doi, publication.pmid);

    if (!key || publications.has(key)) continue;

    const { metadata } = publication;

    publications.set(key, {
      key,
      doi,
      pmid: publication.pmid,
      pmcid: publication.pmcid,
      type: publication.type || undefined,
      title: metadata?.title,
      authors: metadata?.authors?.map((author) => author.name),
      journal: metadata?.journal,
      year: metadata?.date?.slice(0, 4),
      citationCount: metadata?.citationCount,
    });
  }

  const identifiers = [
    ...(bioconda?.identifiers || []),
    ...(biocontainers?.identifiers || []),
  ];

  for (const identifier of identifiers) {
    if (!identifier.trim().toLowerCase().startsWith("doi:")) continue;

    const doi = normalizeDOI(identifier);
    const key = publicationKey(doi);

    if (!doi || !key || publications.has(key)) continue;

    publications.set(key, { key, doi });
  }

  return Array.from(publications.values()).sort(
    (a, b) =>
      primaryFirst(a) - primaryFirst(b) ||
      (b.citationCount || 0) - (a.citationCount || 0) ||
      a.key.localeCompare(b.key),
  );
}

export function getPublicationURL(publication: PublicationRef): string {
  if (publication.doi) {
    return `https://doi.org/${publication.doi}`;
  } else if (publication.pmid) {
    return `https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}`;
  } else {
    return `https://europepmc.org/article/PMC/${publication.pmcid}`;
  }
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
