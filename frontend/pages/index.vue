<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

const route = useRoute();
const router = useRouter();

const toast = useToast();

const tools = ref<Tools>([]);
const loading = ref(false);
const error = ref("");

const filteredTopics = ref<string[]>([]);
const topics = ref<string[]>([]);

const filteredTools = ref<Tools>([]);
const searchQuery = ref("");
const searchQueryDebounced = refDebounced(searchQuery, 500);
const sortKey = ref("Name");
const currentPage = ref(1);
const perPage = ref("6");
const licenseFilter = ref("All");
const licenseOptions = ref(["All"]);
const favoritesFilter = ref("All");
const dataFilter = ref("All");

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * Number(perPage.value);
  const end = start + Number(perPage.value);
  return filteredTools.value.slice(start, end);
});

async function filterTools() {
  try {
    loading.value = true;
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
    loading.value = false;
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
  loading.value = true;

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
    loading.value = false;
  }
}

const { domains } = useDomains();

const handleSearchFromHero = (query: string) => {
  searchQuery.value = query;
  router.push("/tools");
};

const handleCategoryClick = (category: string) => {
  searchQuery.value = category;
  router.push("/tools");
};

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
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <HeroSection :tool-count="tools.length" :collection-count="558">
      <template v-slot:search>
        <SearchBar @search="handleSearchFromHero" />
      </template>

      <template v-slot:actions>
        <ActionButton
          label="Browse"
          description="Tools"
          icon="i-lucide-layers"
          to="/tools"
        />
        <ActionButton
          label="Explore"
          description="Communities and Collections"
          icon="i-lucide-globe"
          to="/explore"
        />
        <ActionButton
          label="Register"
          description="A Tool"
          icon="i-lucide-plus-circle"
          to="#register"
        />
      </template>
    </HeroSection>

    <DomainGrid :domains="domains" @category-click="handleCategoryClick" />

    <div
      v-if="!loading && filteredTools.length > 0"
      class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div class="mb-8 text-center">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
          Featured Tools
        </h3>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Explore some of the most popular research software tools
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ItemCard
          v-for="tool in paginatedItems.slice(0, 6)"
          :key="tool.tool_name"
          :tool="tool"
        />
      </div>

      <div class="mt-8 text-center">
        <UButton
          label="View All Tools"
          size="lg"
          icon="i-lucide-arrow-right"
          trailing
          to="/tools"
        />
      </div>
    </div>

    <div v-if="loading" class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ItemCardPlaceHolder v-for="i in 6" :key="i" />
      </div>
    </div>

    <div v-if="error" class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <UCard class="text-center">
        <div class="py-12">
          <UIcon
            name="i-lucide-alert-circle"
            class="mx-auto h-12 w-12 text-red-500"
          />
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            Failed to Load Tools
          </h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ error }}
          </p>
          <UButton label="Retry" class="mt-4" @click="getTools" />
        </div>
      </UCard>
    </div>
  </div>
</template>
