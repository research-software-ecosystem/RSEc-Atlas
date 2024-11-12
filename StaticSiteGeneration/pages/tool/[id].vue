<template>
  <v-container>
    <v-card v-if="tool">
      <!-- Title with grey background -->
      <v-card-title class="tool-title">{{ tool.tool_path }}</v-card-title>
      <v-card-subtitle>{{ tool.combined_meta.biocontainers__summary || "No Description Provided" }}</v-card-subtitle>
      <v-card-text>
        <p><strong>Home:</strong> <a :href="tool.combined_meta.bioconda__home">{{ tool.combined_meta.bioconda__home
            }}</a></p>
        <p><strong>License:</strong> {{ tool.combined_meta.biocontainers__license }}</p>
        <p><strong>Version:</strong> {{ tool.combined_meta.bioconda__version }}</p>
        <p><strong>Total Pulls:</strong> {{ tool.combined_meta.biocontainers__total_pulls }}</p>
        <p><strong>Identifiers:</strong> {{ tool.combined_meta.bioconda__identifiers.join(', ') }}</p>
        <p><strong>Owner:</strong> {{ tool.combined_meta.biotools__owner }}</p>
        <p><strong>Operating Systems:</strong> {{ tool.combined_meta.biotools__operating_systems.join(', ') }}</p>
        <p><strong>Additional Platforms:</strong> {{ tool.combined_meta.bioconda__additional_platforms.join(', ') }}</p>
        <p><strong>Added Date:</strong> {{ formatDate(tool.combined_meta.biotools__addition_date) }}</p>
        <p><strong>Last Update:</strong> {{ formatDate(tool.combined_meta.biotools__last_update_date) }}</p>
      </v-card-text>
    </v-card>
    <div v-else>Loading item details...</div>

    <!-- Back to Listings button outside the card -->
    <v-btn to="/" class="back-to-listings">
      Back to Listings
    </v-btn>
  </v-container>
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
</style>
