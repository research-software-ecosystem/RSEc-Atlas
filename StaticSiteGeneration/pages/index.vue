<template>
  <v-container>
    <!-- Search, Sort, and Filter UI -->
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field v-model="searchQuery" label="Search Tools..." @input="resetPage" />
      </v-col>
      <v-col cols="12" md="4">
        <v-select v-model="sortKey" :items="sortOptions" label="Sort By" @input="resetPage" />
      </v-col>
      <v-col cols="12" md="4">
        <v-select v-model="licenseFilter" :items="licenseOptions" label="Filter by License" @input="resetPage" />
      </v-col>
    </v-row>

    <div v-if="pending">Fetching the bio tools data, please wait.</div>
    <div v-if="error">Error fetching items: {{ error.message }}</div>

    <!-- Tool List -->
    <v-row v-if="filteredItems.length">
      <v-col cols="12" md="4" v-for="tool in paginatedItems" :key="tool.search_index">
        <v-card>
          <v-card-title>
            <router-link :to="`/tool/${tool.search_index}`">{{ getToolName(tool) }}</router-link>
          </v-card-title>
          <v-card-subtitle>{{ getToolDescription(tool) }}</v-card-subtitle>
          <v-card-text>
            <strong>License:</strong> {{ getToolLicense(tool) }}<br />
            <strong>Version:</strong> {{ getToolVersion(tool) }}<br />
            <strong>Total Pulls:</strong> {{ getToolTotalPulls(tool) }}<br />
            <strong>Last Updated:</strong>
            {{ tool.combined_meta.biotools__last_update_date ? formatDate(tool.combined_meta.biotools__last_update_date)
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
    if (tool.combined_meta.biocontainers__license) {
      licenses.add(tool.combined_meta.biocontainers__license);
    }
  });
  licenseOptions.value = ['All', ...Array.from(licenses)];
});

watch([searchQuery, sortKey, licenseFilter], () => {
  currentPage.value = 1;
});

const filteredItems = computed(() => {
  let filtered = Array.isArray(tools.value) ? tools.value : [];

  filtered = filtered.filter(item => Object.keys(item.combined_meta).length > 0);

  if (licenseFilter.value && licenseFilter.value !== 'All') {
    filtered = filtered.filter(item => item.combined_meta.biocontainers__license === licenseFilter.value);
  }

  if (searchQuery.value) {
    filtered = filtered.filter(item =>
      item.tool_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (sortKey.value === 'Name') {
    filtered.sort((a, b) => a.tool_name.localeCompare(b.tool_name));
  } else if (sortKey.value === 'Total Pulls') {
    filtered.sort((a, b) => {
      const pullsA = a.combined_meta.biocontainers__total_pulls || 0;
      const pullsB = b.combined_meta.biocontainers__total_pulls || 0;
      return pullsB - pullsA;
    });
  } else if (sortKey.value === 'Creation Date') {
    filtered.sort((a, b) => new Date(a.combined_meta.biotools__addition_date) - new Date(b.combined_meta.biotools__addition_date));
  } else if (sortKey.value === 'Last Updated') {
    filtered.sort((a, b) => new Date(a.combined_meta.biotools__last_update_date) - new Date(b.combined_meta.biotools__last_update_date));
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
  return tool.combined_meta.bioschemas__name || tool.combined_meta.biocontainers__name || tool.combined_meta.bioconda__name || tool.tool_name || "No Name";
};

const getToolDescription = (tool) => {
  return tool.combined_meta.biocontainers__summary || tool.combined_meta.bioconda__summary || tool.combined_meta.biotools__summary || "No Description";
};

const getToolLicense = (tool) => {
  return tool.combined_meta.biocontainers__license || tool.combined_meta.bioconda__license || tool.combined_meta.bioschemas__license || "No License Info";
};

const getToolVersion = (tool) => {
  return tool.combined_meta.bioconda__version || tool.combined_meta.biocontainers__version || tool.combined_meta.bioschemas__version || "No Version Info";
};

const getToolTotalPulls = (tool) => {
  return tool.combined_meta.biocontainers__total_pulls || tool.combined_meta.bioconda__total_pulls || tool.combined_meta.bioschemas__total_pulls || "No Total Pulls";
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
  background-color: #2e2e2e;
  color: white;
}

.v-card {
  background-color: #424242;
  color: white;
}

.v-pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>
