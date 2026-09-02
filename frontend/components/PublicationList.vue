<script setup lang="ts">
interface Props {
  tool: Tool;
}

const props = defineProps<Props>();

const details = ref<Record<string, Partial<PublicationRef>>>({});
const loadingDetails = ref(false);

const references = computed(() => getToolPublications(props.tool));

const publications = computed<PublicationRef[]>(() =>
  references.value.map((publication) => {
    const fetched = publication.doi
      ? details.value[publication.doi.toLowerCase()]
      : undefined;

    if (!fetched) return publication;

    return {
      ...publication,
      title: publication.title ?? fetched.title,
      authors: publication.authors ?? fetched.authors,
      journal: publication.journal ?? fetched.journal,
      year: publication.year ?? fetched.year,
      pmid: publication.pmid ?? fetched.pmid,
      pmcid: publication.pmcid ?? fetched.pmcid,
      citationCount: publication.citationCount ?? fetched.citationCount,
    };
  }),
);

function formatAuthors(publication: PublicationRef): string {
  const authors = publication.authors || [];

  if (authors.length === 0) return "";
  if (authors.length <= 3) return authors.join(", ");

  return `${authors.slice(0, 3).join(", ")} et al.`;
}

// The parts are built as complete strings rather than as separate elements
// because Vue drops the whitespace between elements that sit on their own line.
function citationCredit(publication: PublicationRef): string {
  const credit = [
    formatAuthors(publication),
    publication.year && `(${publication.year})`,
  ]
    .filter(Boolean)
    .join(" ");

  return credit ? `${credit}. ` : "";
}

function citationTitle(publication: PublicationRef): string {
  return `${publication.title?.replace(/\.\s*$/, "")}.`;
}

function citationJournal(publication: PublicationRef): string {
  return publication.journal ? ` ${publication.journal}.` : "";
}

function getEuropePMCURL(publication: PublicationRef): string | undefined {
  if (publication.pmcid) {
    return `https://europepmc.org/article/PMC/${publication.pmcid}`;
  } else if (publication.pmid) {
    return `https://europepmc.org/article/MED/${publication.pmid}`;
  } else {
    return undefined;
  }
}

// Navigating to another tool while a lookup is in flight must not merge the
// details of the tool we just left.
let currentLookup = 0;

async function loadDetails() {
  const lookup = ++currentLookup;

  const missing = references.value
    .filter((publication) => !publication.title && publication.doi)
    .map((publication) => publication.doi as string);

  loadingDetails.value = missing.length > 0;

  if (missing.length === 0) return;

  try {
    const fetched = await fetchPublicationDetails(missing);

    if (lookup !== currentLookup) return;

    details.value = { ...details.value, ...fetched };
  } finally {
    if (lookup === currentLookup) {
      loadingDetails.value = false;
    }
  }
}

watch(
  () => props.tool,
  () => {
    details.value = {};
    loadDetails();
  },
  { immediate: true },
);
</script>

<template>
  <InfoCard
    v-if="publications.length > 0"
    title="Publications"
    title-icon="uil:book-open"
  >
    <template v-slot:content>
      <ol class="flex flex-col gap-4">
        <li
          v-for="publication in publications"
          :key="publication.key"
          class="flex flex-col gap-1"
        >
          <p
            v-if="publication.title"
            class="text-sm text-gray-600 lg:text-base dark:text-gray-300"
          >
            <span>{{ citationCredit(publication) }}</span>
            <span class="font-medium text-gray-900 dark:text-gray-100">{{
              citationTitle(publication)
            }}</span>
            <span class="italic">{{ citationJournal(publication) }}</span>
          </p>

          <USkeleton v-else-if="loadingDetails" class="h-5 w-3/4" />

          <p
            v-else
            class="text-sm text-gray-600 lg:text-base dark:text-gray-300"
          >
            {{
              publication.doi
                ? `doi:${publication.doi}`
                : `pmid:${publication.pmid}`
            }}
          </p>

          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              v-for="type in publication.type"
              :key="type"
              class="text-xs"
              variant="subtle"
              color="neutral"
            >
              {{ type }}
            </UBadge>

            <UBadge
              v-if="publication.citationCount"
              class="text-xs"
              variant="subtle"
              color="neutral"
              icon="uil:chart-line"
            >
              Cited by {{ publication.citationCount }}
            </UBadge>

            <UTooltip
              v-if="publication.doi"
              :delay-duration="500"
              text="Click to view publication"
            >
              <NuxtLink target="_blank" :to="getPublicationURL(publication)">
                <UBadge
                  class="text-xs text-gray-600 dark:text-gray-300"
                  variant="subtle"
                  color="primary"
                  icon="uil:book-alt"
                  trailing-icon="uil:external-link-alt"
                >
                  DOI
                </UBadge>
              </NuxtLink>
            </UTooltip>

            <UTooltip
              v-if="publication.pmid"
              :delay-duration="500"
              text="Click to view on PubMed"
            >
              <NuxtLink
                target="_blank"
                :to="`https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}`"
              >
                <UBadge
                  class="text-xs text-gray-600 dark:text-gray-300"
                  variant="subtle"
                  color="primary"
                  icon="uil:file-alt"
                  trailing-icon="uil:external-link-alt"
                >
                  PubMed
                </UBadge>
              </NuxtLink>
            </UTooltip>

            <UTooltip
              v-if="getEuropePMCURL(publication)"
              :delay-duration="500"
              text="Click to view on Europe PMC"
            >
              <NuxtLink target="_blank" :to="getEuropePMCURL(publication)">
                <UBadge
                  class="text-xs text-gray-600 dark:text-gray-300"
                  variant="subtle"
                  color="primary"
                  icon="uil:database"
                  trailing-icon="uil:external-link-alt"
                >
                  Europe PMC
                </UBadge>
              </NuxtLink>
            </UTooltip>
          </div>
        </li>
      </ol>
    </template>
  </InfoCard>
</template>
