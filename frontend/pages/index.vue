<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

const route = useRoute();
const router = useRouter();

const perPageOptions = ["6", "12", "24", "36", "48"];
const favoritesOptions = ["All", "Favorites"];
const sortOptions = ["Name", "Creation Date", "Last Updated"];
const dataOptions = [
  "All",
  "Has Bioconda Package",
  "Has Containers",
  "Compatible with Galaxy",
];

const toast = useToast();

const tools = ref<Tools>([]);
const loadingTools = ref(true);
const filtering = ref(false);
const error = ref("");

const filteredTopics = ref<string[]>([]);
const topics = ref<string[]>([]);

const filteredTools = ref<Tools>([]);
const searchQuery = ref("");
const searchQueryDebounced = refDebounced(searchQuery, 500);
const sortKey = ref("Name");
const currentPage = ref(1);
const perPage = ref(perPageOptions[0]);
const licenseFilter = ref("All");
const licenseOptions = ref(["All"]);
const favoritesFilter = ref("All");
const dataFilter = ref("All");

const isLoading = computed(() => loadingTools.value || filtering.value);

const showClearButton = computed(() => {
  return (
    searchQueryDebounced.value.trim() !== "" ||
    sortKey.value !== "Name" ||
    licenseFilter.value !== "All" ||
    dataFilter.value !== "All" ||
    favoritesFilter.value !== "All"
  );
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * Number(perPage.value);
  const end = start + Number(perPage.value);
  return filteredTools.value.slice(start, end);
});

async function filterTools() {
  if (loadingTools.value) return;

  try {
    filtering.value = true;
    const query = searchQueryDebounced.value?.toLowerCase().trim() || "";

    const hasMetadata = tools.value.some((tool) => tool.fetched_metadata);
    if (!hasMetadata) {
      filteredTools.value = [];
    }

    let filtered: Tools;

    await new Promise((resolve) => {
      setTimeout(() => {
        filtered = applyFilters(
          tools.value,
          licenseFilter.value,
          dataFilter.value,
          favoritesFilter.value,
        );

        filtered = sortByKey(filtered, sortKey.value);

        const searchResult = searchTools(filtered, query, topics.value);

        filteredTopics.value = searchResult.filteredTopics;
        filtered = searchResult.tools;

        filteredTools.value = filtered;
        resolve(null);
      }, 0);
    });
  } catch (err) {
    toast.add({
      title: "Error Filtering Tools",
      description: `Error: ${String(err)}`,
      color: "error",
    });

    filteredTools.value = [];
  } finally {
    filtering.value = false;
  }
}

function listLicenses() {
  const allLicenses = tools.value.flatMap((tool) => {
    const { bioschemas, bioconda, biotools } = tool.fetched_metadata;
    return [bioschemas?.license, bioconda?.license, biotools?.license].filter(
      (lic) => lic && lic.trim() && lic.toLowerCase() !== "not available",
    );
  });

  licenseOptions.value = [
    "All",
    ...new Set(
      allLicenses.filter((lic): lic is string => typeof lic === "string"),
    ),
  ];
}

function listTopics() {
  const allTopics = tools.value.flatMap((tool) => {
    const { galaxy } = tool.fetched_metadata;
    return galaxy?.edam_topics || [];
  });

  topics.value = Array.from(new Set(allTopics));
}

async function getTools() {
  loadingTools.value = true;
  error.value = "";

  try {
    tools.value = await fetchAllToolsMetadata();

    listLicenses();
    listTopics();
  } catch (err) {
    error.value = String(err);
    toast.add({
      title: "Failed to Fetch Metadata",
      description: `Error: ${error.value}`,
      color: "error",
    });
  } finally {
    loadingTools.value = false;
  }
}

function onTopicClick(topic: string) {
  const topicTag = `tag:'${topic.trim()}'`;
  const currentQuery = searchQuery.value.trim();

  const queryParts = currentQuery.split(/\s+/);
  const normalizedQueryParts = queryParts.map((part) => part.toLowerCase());
  const topicIndex = normalizedQueryParts.indexOf(topicTag.toLowerCase());

  if (topicIndex !== -1) {
    queryParts.splice(topicIndex, 1); // Remove the topic tag if it exists
  } else {
    queryParts.push(topicTag); // Add the topic tag if it doesn't exist
  }

  searchQuery.value = queryParts.join(" ").trim();
}

async function onRetry() {
  await getTools();
  await filterTools();
}

function onClearFilters() {
  searchQuery.value = "";
  sortKey.value = "Name";
  licenseFilter.value = "All";
  dataFilter.value = "All";
  favoritesFilter.value = "All";
  currentPage.value = 1;
}

watch(
  [searchQueryDebounced, sortKey, licenseFilter, dataFilter, favoritesFilter],
  () => {
    router.replace({
      query: {
        search: searchQueryDebounced.value,
        sort: sortKey.value,
        license: licenseFilter.value,
        data: dataFilter.value,
        favorites: favoritesFilter.value,
        page: String(currentPage.value),
      },
    });

    currentPage.value = 1;

    filterTools();
  },
);

onMounted(async () => {
  const queryParams = route.query;

  searchQuery.value = queryParams.search?.toString() || "";
  sortKey.value = queryParams.sort?.toString() || "Name";
  licenseFilter.value = queryParams.license?.toString() || "All";
  dataFilter.value = queryParams.data?.toString() || "All";
  favoritesFilter.value = queryParams.favorites?.toString() || "All";
  currentPage.value = parseInt(queryParams.page as string, 10) || 1;

  await getTools();
  await filterTools();
});
</script>

<template>
  <div>
    <div class="mb-4">
      <UFormField
        help="Enter a comma-separated search query. Use 'tag:' prefix to search by topics."
        required
        class="mb-2 w-full"
      >
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          :loading="loadingTools"
          size="xl"
          class="w-full"
          variant="outline"
          placeholder="Search Tools and Topics"
        />
      </UFormField>

      <div
        v-if="filteredTopics.length > 0"
        class="mb-4 flex flex-wrap items-center gap-2"
      >
        <UTooltip
          v-for="topic in filteredTopics"
          :key="topic"
          :delay-duration="250"
          text="Click to search by topic"
        >
          <UBadge
            class="cursor-pointer text-gray-600 dark:text-gray-300"
            variant="subtle"
            color="primary"
            icon="uil:tag"
            @click="onTopicClick(topic)"
          >
            {{ topic }}
          </UBadge>
        </UTooltip>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <div class="flex flex-wrap items-center gap-4">
          <USelectMenu
            v-model="licenseFilter"
            size="lg"
            class="min-w-40"
            icon="uil:balance-scale"
            :highlight="licenseFilter !== 'All'"
            :items="licenseOptions"
          />

          <USelectMenu
            v-model="sortKey"
            size="lg"
            class="min-w-40"
            icon="uil:sort-amount-down"
            :highlight="sortKey !== 'Name'"
            :items="sortOptions"
          />

          <USelectMenu
            v-model="dataFilter"
            size="lg"
            class="min-w-40"
            icon="uil:database"
            :highlight="dataFilter !== 'All'"
            :items="dataOptions"
          />

          <USelectMenu
            v-model="favoritesFilter"
            size="lg"
            class="min-w-40"
            icon="uil:star"
            :highlight="favoritesFilter !== 'All'"
            :items="favoritesOptions"
          />

          <UButton
            v-if="showClearButton"
            size="lg"
            variant="ghost"
            icon="uil:times"
            title="Clear Filters"
            @click="onClearFilters"
          >
            Clear Filters
          </UButton>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <USelectMenu
            v-model="perPage"
            size="lg"
            class="min-w-40 self-end"
            icon="uil:apps"
            :items="perPageOptions.map((i) => i)"
          />
        </div>
      </div>
    </div>

    <UAlert
      v-if="loadingTools"
      class="mb-4"
      color="neutral"
      variant="subtle"
      icon="uil:spinner-alt"
      :ui="{ icon: 'animate-spin' }"
      title="Loading the tool catalogue…"
      description="The metadata index is a few megabytes, so on a slow connection this can take a while. Your search and filters are applied as soon as it has loaded."
    />

    <UAlert
      v-else-if="error"
      class="mb-4"
      color="error"
      variant="subtle"
      icon="uil:exclamation-triangle"
      title="Failed to load the tool catalogue"
      :description="error"
      :actions="[
        {
          label: 'Retry',
          icon: 'uil:refresh',
          color: 'error',
          variant: 'outline',
          onClick: onRetry,
        },
      ]"
    />

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <template v-if="isLoading">
        <ItemCardPlaceHolder v-for="i in Number(perPage)" :key="i" />
      </template>
      <template v-else-if="paginatedItems.length > 0">
        <ItemCard
          v-for="tool in paginatedItems"
          :key="tool.tool_name"
          :tool="tool"
        />
      </template>
      <template v-else-if="!error">
        <div class="col-span-full text-center">
          <p class="text-lg text-gray-500">
            No tools found matching your criteria.
          </p>
        </div>
      </template>
    </div>

    <UPagination
      v-if="filteredTools.length > Number(perPage)"
      v-model:page="currentPage"
      class="mt-4 flex justify-center"
      :ui="{ list: 'flex-wrap ' }"
      :total="filteredTools.length"
      :items-per-page="Number(perPage)"
      show-edges
    />
  </div>
</template>
