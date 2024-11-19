<template>
  <Suspense>
    <template #default>
      <v-container>
        <v-card v-if="tool">
          <!-- Title with grey background -->
          <v-card-title class="tool-title">{{ tool.tool_name }}</v-card-title>
          <v-card-subtitle class="tool-description">
            {{ getSummary || "No description" }}
          </v-card-subtitle>
          <v-card-text>
            <p><strong>Home:&nbsp;</strong>
              <a :href="getHome">
                {{ getHome || "No home URL" }}
              </a>
            </p>
            <p><strong>URL:&nbsp;</strong>
              <a :href="getURL">
                {{ getURL || "No URL" }}
              </a>
            </p>
            <p><strong>License:</strong>
              {{ getLicense || "No license info" }}
            </p>
            <p><strong>Version:</strong>
              {{ getVersion || "No version info" }}
            </p>
            <p><strong>Total Pulls:</strong>
              {{ getTotalPulls || "No total pulls info" }}
            </p>
            <p><strong>Identifiers:</strong>
              {{ getIdentifiers || "No identifiers info" }}
            </p>
            <p><strong>Owner:</strong>
              {{ getOwner || "No owner info" }}
            </p>
            <p><strong>Operating Systems:</strong>
              {{ getOperatingSystems || "No operating systems info" }}
            </p>
            <p><strong>Additional Platforms:</strong>
              {{ getAdditionalPlatforms || "No additional platforms info" }}
            </p>
            <p><strong>Added Date:</strong>
              {{ getFormattedDate(tool.combined_meta.biotools__addition_date) || "No addition date info" }}
            </p>
            <p><strong>Last Update:</strong>
              {{ getFormattedDate(tool.combined_meta.biotools__last_update_date) || "No last update date info" }}
            </p>
          </v-card-text>
        </v-card>
        <div v-else>Fetching tools data...</div>

        <!-- Back to Listings button outside the card -->
        <v-btn to="/" class="back-to-listings">
          Back to Listings
        </v-btn>
      </v-container>
    </template>
    <template #fallback>
      <p>Loading...</p>
    </template>
    <template #error="error">
      <v-alert type="error">
        <strong>Error:</strong> {{ error.message }}
      </v-alert>
    </template>
  </Suspense>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useFetch } from '#app';

const route = useRoute();
const { data: tools, pending, error } = await useFetch('/combined_metadata.json');

const tool = computed(() => {
  if (tools.value) {
    const id = Number(route.params.id);
    return tools.value.find(t => t.search_index === id);
  }
  return null;
});

const getKey = (keys) => {
  for (const key of keys) {
    if (tool.value.combined_meta[key]) {
      return tool.value.combined_meta[key];
    }
  }
  return null;
};

const getSummary = computed(() => {
  return getKey(['biocontainers__summary', 'bioconda__summary', 'biotools__summary']);
});

const getHome = computed(() => {
  return getKey(['biocontainers__home', 'bioconda__home', 'biotools__home']);
});

const getURL = computed(() => {
  return tool.value.combined_meta.bioschemas__home;
});

const getLicense = computed(() => {
  return getKey(['biocontainers__license', 'bioconda__license', 'biotools__license']);
});

const getVersion = computed(() => {
  return tool.value.combined_meta.bioconda__version || null;
});

const getTotalPulls = computed(() => {
  return tool.value.combined_meta.biocontainers__total_pulls || null;
});

const getIdentifiers = computed(() => {
  return Array.isArray(tool.value.combined_meta.bioconda__identifiers)
    ? tool.value.combined_meta.bioconda__identifiers.join(', ')
    : null;
});

const getOwner = computed(() => {
  return tool.value.combined_meta.biotools__owner || null;
});

const getOperatingSystems = computed(() => {
  return tool.value.combined_meta.biotools__operating_systems?.join(', ') || null;
});

const getAdditionalPlatforms = computed(() => {
  return tool.value.combined_meta.bioconda__additional_platforms?.join(', ') || null;
});

const getFormattedDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
</script>

<style scoped>
.v-container {
  background-color: #2e2e2e;
  color: white;
}

.v-card-subtitle {
  padding-top: 20px;
}

.v-card {
  background-color: #424242;
  color: white;
}

.tool-title {
  background-color: #757575;
  padding: 10px;
  color: white;
  font-size: 22px !important;
}

.back-to-listings {
  background-color: #757575;
  color: white;
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
}

.back-to-listings:hover {
  background-color: #616161;
}

.v-alert {
  margin-top: 20px;
}

.tool-description {
  white-space: normal;
  word-wrap: break-word;
  overflow: visible;
  max-width: 100%;
  font-size: 18px !important;
}
</style>
