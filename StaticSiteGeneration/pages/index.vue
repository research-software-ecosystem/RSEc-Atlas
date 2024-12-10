<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <v-container>
    <!-- Search, Sort, and Filter UI -->
    <!-- Search UI with Icon -->
    <v-row>
      <v-col cols="12" md="4">
        <div class="icon-wrapper">
          <div class="icon fas fa-search"></div>
          <v-text-field ref="searchInput" label="Search Tools..." @input="executeSearch" class="input-with-icon" />
        </div>
      </v-col>
      <!-- Sort By with Icon -->
      <v-col cols="12" md="4">
        <div class="icon-wrapper">
          <div class="icon fas fa-sort"></div>
          <v-select v-model="sortKey" :items="sortOptions" label="Sort By" @input="resetPage" class="input-with-icon" />
        </div>
      </v-col>
      <!-- Filter by License with Icon -->
      <v-col cols="12" md="4">
        <div class="icon-wrapper">
          <div class="icon fas fa-filter"></div>
          <v-select v-model="licenseFilter" :items="licenseOptions" label="Filter by License" @input="resetPage"
            class="input-with-icon" />
        </div>
      </v-col>
    </v-row>

    <div v-if="pending">Fetching the bio tools data, please wait.</div>
    <div v-if="error">Error fetching items: {{ error.message }}</div>

    <!-- Tool List -->
    <v-row v-if="filteredItems.length">
      <v-col cols="12" md="4" v-for="tool in paginatedItems" :key="tool.search_index">
        <v-card>
          <v-card-title>
            <router-link :to="`/tool/${encodeURIComponent(tool.tool_name)}`">{{ getToolName(tool) }}</router-link>
          </v-card-title>
          <v-card-subtitle>{{ getToolDescription(tool) ?
            !getToolDescription(tool).endsWith(".") ?
              getToolDescription(tool).trim() + "."
              : getToolDescription(tool).trim()
            : "No description" }}</v-card-subtitle>
          <v-card-text>
            <strong>License:</strong> {{ getToolLicense(tool) }}<br />
            <strong>Version:</strong> {{ getToolVersion(tool) !== "No Version Info" ?
              "v" + getToolVersion(tool)
              : "No Version Info" }}<br />
            <strong>Total Pulls:</strong> {{ getToolTotalPulls(tool).toLocaleString() }}<br />
            <strong>Last Updated:</strong>
            {{ tool.fetched_metadata.biotools__last_update_date ?
              formatDate(tool.fetched_metadata.biotools__last_update_date)
              : "No Last Update Info" }}
          </v-card-text>
          <v-card-actions>
            <v-btn @click="toggleFavorite(tool)">
              {{ isFavorite(tool) ? 'Unfavorite' : 'Favorite' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <div v-else>No tools found.</div>

    <!-- Pagination Controls -->
    <v-pagination v-model="currentPage" :length="totalPages" :total-visible="pageNumbers.length"
      :page-nums="pageNumbers" />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useFetch } from '#app';
import { debounce } from 'lodash';

const searchInput = ref(null);
const searchQuery = ref('');
const sortKey = ref('Total Pulls');
const licenseFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 6;
const favoriteItems = ref(JSON.parse(localStorage.getItem('favorites')) || []);
const sortOptions = ['Total Pulls', 'Name', 'Creation Date', 'Last Updated'];
const licenseOptions = ref(['All']);
const { data: tools, pending, error } = await useFetch('/combined_metadata.json');

onMounted(() => {
  const licenses = new Set();
  tools.value.forEach(tool => {
    let licenseName = tool.fetched_metadata.biotools__license
      || tool.fetched_metadata.bioschemas__license
      || tool.fetched_metadata.bioconda__license
      || tool.fetched_metadata.biocontainers__license;
    if (licenseName && licenseName.toLowerCase() !== "not available") {
      licenses.add(licenseName);
    }
  });
  licenseOptions.value = ['All', ...Array.from(licenses)];
});

watch([searchQuery, sortKey, licenseFilter], () => {
  currentPage.value = 1;
});

const filteredItems = computed(() => {
  const query = searchQuery.value ? searchQuery.value.toLowerCase().trim() : '';
  const uniqueResults = new Set();

  let filtered = Array.isArray(tools.value) ? tools.value : [];

  filtered = filtered.filter(item => {
    const hasMetadata = Object.keys(item.fetched_metadata).length > 0;
    if (!hasMetadata) return false;

    if (licenseFilter.value && licenseFilter.value !== 'All') {
      const toolLicense = getToolLicense(item);
      if (toolLicense !== licenseFilter.value) return false;
    }

    return true;
  });

  if (query) {
    filtered.forEach(item => {
      const nameMatch = getToolName(item).toLowerCase().includes(query);
      const descriptionMatch = getToolDescription(item).toLowerCase().includes(query);

      if (nameMatch || descriptionMatch) {
        uniqueResults.add(item);
      }
    });
  } else {
    filtered.forEach(item => uniqueResults.add(item));
  }

  filtered = Array.from(uniqueResults);

  if (sortKey.value === 'Name') {
    filtered.sort((a, b) => getToolName(a).localeCompare(getToolName(b)));
  } else if (sortKey.value === 'Total Pulls') {
    filtered.sort((a, b) => {
      let pullsA = Number(getToolTotalPulls(a)) || 0;
      let pullsB = Number(getToolTotalPulls(b)) || 0;
      return pullsB - pullsA;
    });
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
  }, 1200);

  debounceSearch();
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

const getToolName = (tool) => {
  return tool.fetched_metadata.bioschemas__name
    || tool.fetched_metadata.biocontainers__name
    || tool.fetched_metadata.bioconda__name
    || tool.tool_name;
};

const getToolDescription = (tool) => {
  return tool.fetched_metadata.biotools__summary
    || tool.fetched_metadata.bioconda__summary
    || tool.fetched_metadata.biocontainers__summary
    || tool.fetched_metadata.galaxy__summary
    || "No Description Available";
};

const getToolLicense = (tool) => {
  let licenseName =
    tool.fetched_metadata.biotools__license
    || tool.fetched_metadata.bioschemas__license
    || tool.fetched_metadata.bioconda__license
    || tool.fetched_metadata.biocontainers__license;

  if (licenseName && licenseName.toLowerCase() !== "not available") {
    return licenseName;
  }

  return "No License Info";
};

const getToolVersion = (tool) => {
  return tool.fetched_metadata.bioschemas__version
    || tool.fetched_metadata.bioconda__version
    || tool.fetched_metadata.biocontainers__version
    || "No Version Info";
};

const getToolTotalPulls = (tool) => {
  return tool.fetched_metadata.bioschemas__total_pulls
    || tool.fetched_metadata.bioconda__total_pulls
    || tool.fetched_metadata.biocontainers__total_pulls
    || "No Total Pulls";
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
</style>
