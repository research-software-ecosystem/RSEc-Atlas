<template>
  <!-- Loading overlay -->
  <div v-if="loading || fakeLoading" class="loading-overlay">
    <div v-if="!fakeLoading" class="spinner"></div>
    <p v-if="!fakeLoading" style="font-weight: bold; font-size: 16px;">Loading bio tools and containers...</p>
  </div>

  <v-container>
    <!-- Search, Sort, and Filter UI -->
    <v-row>
      <!-- Search UI -->
      <v-col cols="12" md="4">
        <div class="icon-wrapper">
          <div class="icon fas fa-search"></div>
          <v-text-field id="searchInput" ref="searchInput" label="Search Tools and Topics" @input="executeSearch"
            class="input-with-icon" hint="Enter a comma-separated search query. Use 'tag:' prefix to search by topics."
            persistent-hint />
        </div>
      </v-col>

      <!-- Sort By -->
      <v-col cols="12" md="2">
        <div class="icon-wrapper">
          <div class="icon fas fa-sort"></div>
          <v-select v-model="sortKey" :items="sortOptions" label="Sort By" @input="resetPage" class="input-with-icon" />
        </div>
      </v-col>

      <!-- Filter by Data Availability -->
      <v-col cols="12" md="2">
        <div class="icon-wrapper">
          <div class="icon fas fa-database"></div>
          <v-select v-model="dataFilter" :items="dataOptions" label="Filter by Data Availability" @input="resetPage"
            class="input-with-icon" />
        </div>
      </v-col>

      <!-- Filter by License -->
      <v-col cols="12" md="2">
        <div class="icon-wrapper">
          <div class="icon fas fa-stamp"></div>
          <v-select v-model="licenseFilter" :items="licenseOptions" label="Filter by License" @input="resetPage"
            class="input-with-icon" />
        </div>
      </v-col>

      <!-- Filter by Favorites -->
      <v-col cols="12" md="2">
        <div class="icon-wrapper">
          <div class="icon fas fa-heart"></div>
          <v-select v-model="favoritesFilter" :items="favoritesOptions" label="Filter by Favorites" @input="resetPage"
            class="input-with-icon" />
        </div>
      </v-col>
    </v-row>

    <!-- EDAM Topics -->
    <v-row v-if="filteredTopics.length && searchQuery">
      <v-col cols="12" style="padding-top: 0">
        <v-card
          style="padding:20px; padding-bottom: 10px; background-color: #ededed; border-top-left-radius: 0px; border-top-right-radius: 0px; border-top: 1px solid #a6a6a6; box-shadow: none;">
          <v-card-text style="padding: 0px;">
            <v-btn v-for="(topic, index) in filteredTopics" :key="index"
              style="margin-right: 10px; margin-bottom: 10px; background-color: #434343; color: white; justify-content: center; align-items: center; font-size: 12px"
              @click="openTopic(topic)">
              <i class="fas fa-tag" style="margin-right: 5px; color: white"></i>
              {{ topic }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tool List -->
    <v-row v-if="filteredItems.length">
      <v-col cols="12" md="4" v-for="tool in paginatedItems" :key="tool.search_index">
        <v-card>
          <v-card-title>
            <router-link :to="`/tool/${encodeURIComponent(tool.tool_name)}`" @click="makeLoading">{{ getToolName(tool)
              }}</router-link>
          </v-card-title>
          <v-card-subtitle>{{ getToolDescription(tool) ? getToolDescription(tool).trim() : "No description"
            }}</v-card-subtitle>
          <v-card-text>
            <strong>License:</strong> {{ getToolLicense(tool) }}<br />
            <strong>Version:</strong> {{ getToolVersion(tool) !== "No Version Info"
              ? "v" + getToolVersion(tool)
              : "No Version Info" }} <br />
            <strong>Last Updated:</strong> {{ tool.fetched_metadata.biotools__last_update_date ?
              formatDate(tool.fetched_metadata.biotools__last_update_date) : "No Last Update Info" }}
          </v-card-text>
          <v-card-actions>
            <v-btn @click="toggleFavorite(tool)">
              {{ isFavorite(tool) ? 'Unfavorite' : 'Favorite' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div style="margin-top: 20px" v-else v-if="!loading && !fakeLoading">
      No tools found.
      <span style="font-weight: 600; margin-left: 6px; font-size: 20px;">¯\_(ツ)_/¯</span>
    </div>

    <!-- Pagination Controls -->
    <v-pagination v-model="currentPage" :length="totalPages" :total-visible="pageNumbers.length"
      :page-nums="pageNumbers" />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFetch } from '#app';
import { debounce } from 'lodash';

const tools = ref([]);
const searchInput = ref(null);
const searchQuery = ref('');
const sortKey = ref('Name');
const currentPage = ref(1);
const itemsPerPage = 6;
const favoriteItems = ref(JSON.parse(localStorage.getItem('favorites')) || []);
const sortOptions = ['Name', 'Creation Date', 'Last Updated'];
const licenseFilter = ref('All');
const licenseOptions = ref(['All']);
const favoritesFilter = ref('All');
const favoritesOptions = ['All', 'Favorites'];
const dataFilter = ref('All');
const loading = ref(false);
const fakeLoading = ref(false);
const dataOptions = ['All', 'Has Bioconda Package', 'Has Containers', 'Compatible with Galaxy'];
const allTopics = ref([]);
const filteredTopics = ref([]);
const route = useRoute();
const router = useRouter();

onMounted(() => {
  fetchData();
});

watch([searchQuery, sortKey, licenseFilter, dataFilter], () => {
  makeLoading();
  currentPage.value = 1;
});

const filteredItems = computed(() => {
  const query = searchQuery.value ? searchQuery.value.toLowerCase().trim() : '';
  const uniqueResults = new Set();

  let filtered = Array.isArray(tools.value) ? tools.value : [];

  // Apply filters
  filtered = filtered.filter(item => {
    const hasMetadata = Object.keys(item.fetched_metadata).length > 0;
    if (!hasMetadata) return false;

    // License Filter
    if (licenseFilter.value && licenseFilter.value !== 'All') {
      const toolLicense = getToolLicense(item);
      if (toolLicense !== licenseFilter.value) return false;
    }

    // Data Filter
    if (dataFilter.value !== 'All') {
      const contents = item.contents;
      if (dataFilter.value === 'Has Bioconda Package' && !contents.includes('bioconda')) {
        return false;
      }
      if (dataFilter.value === 'Has Containers' && !contents.includes('biocontainers')) {
        return false;
      }
      if (dataFilter.value === 'Compatible with Galaxy' && !contents.includes('galaxy')) {
        return false;
      }
    }

    // Favorites Filter
    if (favoritesFilter.value === 'Favorites' && !isFavorite(item)) {
      return false;
    }

    return true;
  });

  // Searching logic
  let prioritizedResults = [];
  if (query) {
    const searchParts = query.split(',').map(part => part && part.trim().toLowerCase());
    let tagQueries = searchParts.filter(part => part.startsWith('tag:')).map(part => part && part.replace(/^tag:/, '').trim().toLowerCase());
    const isStarTag = tagQueries.filter((item) => item === "*");
    const nonTagQueries = searchParts.filter(part => !part.startsWith('tag:')).map(part => part.trim().toLowerCase());

    tagQueries = tagQueries.filter((item) => item !== "*");

    if (isStarTag.length > 0) {
      filteredTopics.value = allTopics.value;
    }
    else if (tagQueries.length > 0) {
      filteredTopics.value = allTopics.value.filter(item => {
        return tagQueries.some(part => item.toLowerCase().includes(part));
      }).slice(0, 13);
      filtered = filtered.filter(item => {
        const itemTags = getToolTopics(item).map(tag => tag.trim().toLowerCase());
        return tagQueries.every(query => itemTags.includes(query.trim().toLowerCase()));
      }).slice(0, 13);
    } else {
      filteredTopics.value = allTopics.value.filter(item => {
        return nonTagQueries.some(part => item.toLowerCase().includes(part));
      });
    }

    if (nonTagQueries.length > 0) {
      filtered = filtered.filter(item => {
        const nameMatch = getToolName(item).toLowerCase();
        const descriptionMatch = getToolDescription(item).toLowerCase();
        const tagsMatch = getToolTopics(item).map(tag => tag.toLowerCase());

        return nonTagQueries.every(part =>
          nameMatch.includes(part) ||
          descriptionMatch.includes(part) ||
          tagsMatch.some(tag => tag.includes(part))
        );
      });
    }

    filtered.forEach(item => {
      const nameMatch = getToolName(item).toLowerCase();
      const descriptionMatch = getToolDescription(item).toLowerCase();
      const tagsMatch = getToolTopics(item).map(tag => tag.toLowerCase());
      let matchScore = 0;

      tagQueries.forEach(part => {
        if (tagsMatch.some(tag => tag.includes(part))) {
          matchScore += 100;
        }
      });

      nonTagQueries.forEach(part => {
        if (nameMatch === part) {
          matchScore += 100;
        } else if (nameMatch.startsWith(part)) {
          matchScore += 70;
        } else if (nameMatch.includes(part)) {
          matchScore += 50;
        } else if (tagsMatch.some(tag => tag.includes(part))) {
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
    prioritizedResults.forEach(result => uniqueResults.add(result.item))
  } else {
    filtered.forEach(item => uniqueResults.add(item));
  }

  filtered = Array.from(uniqueResults);

  // Sorting logic
  if (sortKey.value === 'Name') {
    if (query) {
      filtered = prioritizedResults.map(result => result.item);
    } else {
      filtered.sort((a, b) => getToolName(a).localeCompare(getToolName(b)));
    }
  } else if (sortKey.value === 'Creation Date') {
    filtered.sort((a, b) => new Date(a.fetched_metadata.biotools__addition_date) - new Date(b.fetched_metadata.biotools__addition_date));
  } else if (sortKey.value === 'Last Updated') {
    filtered.sort((a, b) => new Date(a.fetched_metadata.biotools__last_update_date) - new Date(b.fetched_metadata.biotools__last_update_date));
  }

  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage));

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredItems.value.slice(start, start + itemsPerPage);
});

const resetPage = () => {
  currentPage.value = 1;
};

const executeSearch = () => {
  const debounceSearch = debounce(() => {
    resetPage();
    searchQuery.value = searchInput.value?.value || '';
  }, 900);

  debounceSearch();
};

const makeLoading = () => {
  fakeLoading.value = true;
  setTimeout(() => {
    fakeLoading.value = false;
  }, 600);
};

const toggleFavorite = (tool) => {
  if (isFavorite(tool)) {
    favoriteItems.value = favoriteItems.value.filter(i => i.search_index !== tool.search_index);
  } else {
    favoriteItems.value.push(tool);
  }
  localStorage.setItem('favorites', JSON.stringify(favoriteItems.value));
};

const isFavorite = (tool) => {
  return favoriteItems.value.some(i => i.search_index === tool.search_index);
};

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages = [];

  pages.push(1);

  for (let i = Math.max(current - 2, 2); i < Math.min(current + 3, total); i++) {
    pages.push(i);
  }

  if (total > 1 && !pages.includes(total)) {
    pages.push(total);
  }

  return pages;
});

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await useFetch('/combined_metadata.json');
    const licenses = new Set();
    const topics = new Set();
    const queryParam = route.query.search;
    tools.value = data.value;
    tools.value.forEach(tool => {
      const licenseName = tool.fetched_metadata.biotools__license
        || tool.fetched_metadata.bioschemas__license
        || tool.fetched_metadata.bioconda__license
      if (licenseName && licenseName.toLowerCase() !== "not available") {
        licenses.add(licenseName);
      }
      const toolTopics = tool.fetched_metadata.galaxy__edam_topics ? tool.fetched_metadata.galaxy__edam_topics.split(",").map((item) => item.trim()) : [];
      if (toolTopics.length)
        toolTopics.forEach((topic) => topics.add(topic));
    });
    licenseOptions.value = ['All', ...Array.from(licenses)];
    allTopics.value = Array.from(topics).sort((a, b) => a.localeCompare(b));
    if (queryParam) {
      const queryString = queryParam
        .split(",")
        .map((part) => part.trim())
        .join(", ");

      searchQuery.value = queryString;

      const searchInputElement = document.getElementById("searchInput");
      const inputEvent = new Event('input', { bubbles: true });
      searchInputElement.value = queryString;
      searchInputElement.dispatchEvent(inputEvent);
    }
  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    loading.value = false;
  }
};

const getToolName = (tool) => {
  return tool.fetched_metadata.bioschemas__name
    || tool.fetched_metadata.bioconda__name
    || tool.tool_name;
};

const getToolDescription = (tool) => {
  return tool.fetched_metadata.biotools__summary
    || tool.fetched_metadata.bioconda__summary
    || tool.fetched_metadata.galaxy__summary
    || "No Description Available";
};

const getToolTopics = (tool) => {
  return tool.fetched_metadata.galaxy__edam_topics ? tool.fetched_metadata.galaxy__edam_topics.split(',')
    : [];
};

const getToolLicense = (tool) => {
  let licenseName =
    tool.fetched_metadata.biotools__license
    || tool.fetched_metadata.bioschemas__license
    || tool.fetched_metadata.bioconda__license

  if (licenseName && licenseName.toLowerCase() !== "not available") {
    return licenseName;
  }

  return "No License Info";
};

const getToolVersion = (tool) => {
  return tool.fetched_metadata.bioschemas__version
    || tool.fetched_metadata.bioconda__version
    || "No Version Info";
};

const openTopic = (topic) => {
  const trimmedTopic = "tag:" + topic.trim().toLowerCase();
  searchQuery.value = trimmedTopic;

  const searchInputElement = document.getElementById("searchInput");
  const inputEvent = new Event('input', { bubbles: true });
  searchInputElement.value = trimmedTopic;
  searchInputElement.dispatchEvent(inputEvent);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
.v-container {
  background-color: #f5f5f5;
  color: #333333;
}

.v-card {
  background-color: #ffffff;
  color: #333333;
}

.v-card-title a {
  color: #1976D2;
  text-decoration: none;
}

.v-card-title a:hover {
  text-decoration: underline;
}

.v-pagination {
  margin-top: 20px;
  justify-content: center;
}

.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.icon {
  background-color: #333333;
  color: #f5f5f5;
  border-radius: 10%;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  position: absolute;
  top: 12px;
  right: 12px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 8px solid rgba(0, 0, 0, 0.1);
  border-top: 8px solid #1976D2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  margin-top: 10px;
  margin-left: 10px;
  font-size: 15px;
  color: #555;
}
</style>
