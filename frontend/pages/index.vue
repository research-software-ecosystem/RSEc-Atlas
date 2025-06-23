<script setup lang="ts">
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
const loading = ref(false);
const error = ref("");

const filteredTopics = ref<string[]>([]);
const topics = ref<string[]>([]);

const searchQuery = ref("");
const sortKey = ref("Name");
const currentPage = ref(1);
const perPage = ref(perPageOptions[0]);
const licenseFilter = ref("All");
const licenseOptions = ref(["All"]);
const favoritesFilter = ref("All");
const dataFilter = ref("All");

const filteredTools = computed(() => {
  const query = searchQuery.value?.toLowerCase().trim() || "";

  const hasMetadata = tools.value.some((tool) => tool.fetched_metadata);
  if (!hasMetadata) {
    return [];
  }

  let filtered: Tools;

  const searchResult = searchTools(tools.value, query, topics.value);

  filteredTopics.value = searchResult.filteredTopics;
  filtered = searchResult.tools;

  filtered = applyFilters(
    tools.value,
    licenseFilter.value,
    dataFilter.value,
    favoritesFilter.value,
  );

  filtered = sortByKey(filtered, sortKey.value);

  return filtered;
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredTools.value.slice(start, end);
});

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
  loading.value = true;

  try {
    tools.value = await $fetch("/metadata/combined_metadata.json");

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
    loading.value = false;
  }
}

watch([searchQuery, sortKey, licenseFilter, dataFilter], () => {
  currentPage.value = 1;
});

onMounted(() => {
  getTools();
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
          icon="i-lucide-search"
          size="xl"
          class="w-full"
          variant="outline"
          placeholder="Search Tools and Topics"
          v-model="searchQuery"
        />
      </UFormField>

      <div class="flex flex-wrap items-center gap-4">
        <USelectMenu
          v-model="licenseFilter"
          size="lg"
          class="min-w-40"
          icon="uil:balance-scale"
          :items="licenseOptions"
        />

        <USelectMenu
          v-model="sortKey"
          size="lg"
          class="min-w-40"
          icon="uil:sort-amount-down"
          :items="sortOptions"
        />

        <USelectMenu
          v-model="dataFilter"
          size="lg"
          class="min-w-40"
          icon="uil:database"
          :items="dataOptions"
        />

        <USelectMenu
          v-model="perPage"
          size="lg"
          class="min-w-40"
          icon="uil:apps"
          :items="perPageOptions.map((i) => i)"
        />

        <USelectMenu
          v-model="favoritesFilter"
          size="lg"
          class="min-w-40"
          icon="uil:star"
          :items="favoritesOptions"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <template v-if="loading">
        <ItemCardPlaceHolder v-for="i in Number(perPage)" :key="i" />
      </template>
      <template v-else-if="!loading && filteredTools.length > 0">
        <ItemCard
          v-for="tool in paginatedItems"
          :tool="tool"
          :key="tool.tool_name"
        />
      </template>
    </div>

    <UPagination
      v-if="filteredTools.length > Number(perPage)"
      class="mt-4 flex justify-center"
      :ui="{ list: 'flex-wrap ' }"
      :total="filteredTools.length"
      :items-per-page="Number(perPage)"
      v-model:page="currentPage"
      show-edges
    />
  </div>
</template>
