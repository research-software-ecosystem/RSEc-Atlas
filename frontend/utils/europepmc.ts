const EUROPE_PMC_SEARCH_URL =
  "https://www.ebi.ac.uk/europepmc/webservices/rest/search";

// Europe PMC accepts long boolean queries, but keep the batches small enough
// to stay well inside the URL length limit of the REST endpoint.
const BATCH_SIZE = 25;

// One DOI can match several records (a preprint and the journal article), so
// ask for more results than DOIs to keep the surplus from falling off the page.
const PAGE_SIZE = 100;

interface EuropePMCResult {
  source?: string;
  doi?: string;
  title?: string;
  authorString?: string;
  journalTitle?: string;
  pubYear?: string;
  pmid?: string;
  pmcid?: string;
  citedByCount?: number;
}

interface EuropePMCResponse {
  resultList?: {
    result?: EuropePMCResult[];
  };
}

function batch<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }

  return batches;
}

function parseAuthors(authorString?: string): string[] | undefined {
  if (!authorString) return undefined;

  const authors = authorString
    .replace(/\.$/, "")
    .split(", ")
    .map((author) => author.trim())
    .filter(Boolean);

  return authors.length > 0 ? authors : undefined;
}

/**
 * Look up publication details for DOIs that carry no metadata of their own.
 *
 * The site is served statically, so the lookup runs in the browser and is
 * best-effort: any failure resolves to whatever could be fetched so far and
 * the caller keeps rendering the bare DOI.
 */
export async function fetchPublicationDetails(
  dois: string[],
): Promise<Record<string, Partial<PublicationRef>>> {
  const details: Record<string, Partial<PublicationRef>> = {};

  // Quotes would break out of the quoted DOI term in the query.
  const uniqueDOIs = Array.from(
    new Set(dois.map((doi) => doi.trim().replace(/"/g, "")).filter(Boolean)),
  );

  for (const batchedDOIs of batch(uniqueDOIs, BATCH_SIZE)) {
    try {
      const response = await $fetch<EuropePMCResponse>(EUROPE_PMC_SEARCH_URL, {
        query: {
          query: batchedDOIs.map((doi) => `DOI:"${doi}"`).join(" OR "),
          format: "json",
          resultType: "lite",
          pageSize: PAGE_SIZE,
        },
      });

      for (const result of response?.resultList?.result || []) {
        if (!result.doi) continue;

        const doi = result.doi.toLowerCase();

        // The same DOI can come back as both a preprint (PPR) and the indexed
        // article (MED); the article carries the citation count and the PubMed
        // id, so it must not be overwritten by the preprint.
        if (details[doi] && result.source !== "MED") continue;

        details[doi] = {
          title: result.title,
          authors: parseAuthors(result.authorString),
          journal: result.journalTitle,
          year: result.pubYear,
          pmid: result.pmid,
          pmcid: result.pmcid,
          citationCount: result.citedByCount,
        };
      }
    } catch (error) {
      console.warn(
        "Could not fetch publication details from Europe PMC",
        error,
      );
    }
  }

  return details;
}
