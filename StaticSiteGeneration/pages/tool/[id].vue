<template>
  <Suspense>
    <template #default>
      <v-container>
        <v-card v-if="tool">
          <!-- Title with grey background -->
          <v-card-title class="tool-title">
            {{ tool.tool_name.toUpperCase() }}
            <template v-if="hasBiocondaData">
              <a :href="'https://bioconda.github.io/recipes/' + tool.fetched_metadata.bioconda__name + '/README.html'"
                target="_blank"
                style="height: 30px; width: 130px; min-height: 36px; padding: 0; line-height: 36px; margin-left: 5px; display: inline-flex;">
                <v-img src="https://img.shields.io/badge/install%20with-bioconda-brightgreen.svg?style=flat"
                  alt="Install with Bioconda" max-width="130px" height="24px" />
              </a>
            </template>
            <template v-if="hasBiocontainersData">
              <a :href="'https://quay.io/repository/biocontainers/' + tool.fetched_metadata.biocontainers__name + '?tab=tags&tag=latest'"
                target="_blank"
                style="height: 30px; width: 130px; min-height: 36px; padding: 0; line-height: 36px; margin-left: 5px; display: inline-flex;">
                <v-img src="https://img.shields.io/badge/link%20to-biocontainers-brightgreen.svg?style=flat"
                  alt="Link to Biocontainers" max-width="130px" height="24px" />
              </a>
            </template>
          </v-card-title>
          <v-card-subtitle class="tool-description">
            {{ getSummary ? !getSummary.endsWith(".") ? getSummary.trim() + "." : getSummary.trim() : "No description"
            }}
          </v-card-subtitle>

          <v-card-text>
            <!-- Main Tool Info Section -->
            <v-row>
              <v-col cols="12" md="3" lg="3">
                <v-card class="data-card">
                  <v-card-title>Home</v-card-title>
                  <v-card-text>
                    <a :href="getHome" style="  color: #1976D2; text-decoration: none;">{{ getHome || "No home URL"
                      }}</a>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3" lg="3">
                <v-card class="data-card">
                  <v-card-title>URL</v-card-title>
                  <v-card-text>
                    <a :href="getURL" style="  color: #1976D2; text-decoration: none;">{{ getURL || "No URL" }}</a>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3" lg="3">
                <v-card class="data-card">
                  <v-card-title>Documentation</v-card-title>
                  <v-card-text>
                    <a :href="getDoc" style="  color: #1976D2; text-decoration: none;">{{ getDoc || "No documentation"
                      }}</a>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3" lg="3">
                <v-card class="data-card">
                  <v-card-title>License</v-card-title>
                  <v-card-text>{{ getLicense || "No license info" }}</v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3" lg="3">
                <v-card class="data-card">
                  <v-card-title>Version</v-card-title>
                  <v-card-text>{{ getVersion ? "v" + getVersion : "No version info" }}</v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3" lg="3">
                <v-card class="data-card">
                  <v-card-title>Total Pulls</v-card-title>
                  <v-card-text>{{ getTotalPulls.toLocaleString() || "No total pulls info" }}</v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3" lg="3">
                <v-card class="data-card">
                  <v-card-title>Owner</v-card-title>
                  <v-card-text>{{ getOwner || "No owner info" }}</v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3" lg="3">
                <v-card class="data-card">
                  <v-card-title>Operating Systems</v-card-title>
                  <v-card-text>{{ getOperatingSystems || "No operating systems info" }}</v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3" lg="12">
                <v-card class="data-card">
                  <v-card-title>Identifiers</v-card-title>
                  <v-card-text>
                    <v-card-text v-if="formattedIdentifiers.length == 0">{{ "No identifiers info" }}</v-card-text>
                    <v-btn v-for="(identifier, index) in formattedIdentifiers" :key="index"
                      style="margin-right: 10px; margin-bottom: 10px;" @click="openLink(identifier)">
                      {{ identifier }}
                    </v-btn>

                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3" lg="3">
                <v-card class="data-card">
                  <v-card-title>Additional Platforms</v-card-title>
                  <v-card-text>{{ getAdditionalPlatforms || "No additional platforms info" }}</v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3" lg="3">
                <v-card class="data-card">
                  <v-card-title>Added Date</v-card-title>
                  <v-card-text>{{ getFormattedDate(tool.fetched_metadata.biotools__addition_date)
                    || "No addition date info"
                    }}</v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3" lg="3">
                <v-card class="data-card">
                  <v-card-title>Last Update</v-card-title>
                  <v-card-text>{{ getFormattedDate(tool.fetched_metadata.biotools__last_update_date)
                    || "No last updatedate info"
                    }}</v-card-text>
                </v-card>
              </v-col>

              <!-- Galaxy Data Section, if exists -->
              <template v-if="hasGalaxyData">
                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>First Commit</v-card-title>
                    <v-card-text>{{ getFormattedDate(getGalaxyFirstCommit) || "No first commit info" }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>Status</v-card-title>
                    <v-card-text>{{ getGalaxyStatus || "No status info" }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>Conda Name</v-card-title>
                    <v-card-text>{{ getGalaxyCondaName || "No conda name info" }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>Conda Version</v-card-title>
                    <v-card-text>{{ getGalaxyCondaVersion ? "v" + getGalaxyCondaVersion : "No conda version info"
                      }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>Galaxy IDs</v-card-title>
                    <v-card-text>{{ getGalaxyIds || "No galaxy IDs info" }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>Toolshed Categories</v-card-title>
                    <v-card-text>{{ getGalaxyToolshedCategories || "No toolshed categories info" }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>Toolshed ID</v-card-title>
                    <v-card-text>{{ getGalaxyToolshedId || "No toolshed ID info" }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>Users (5 Years)</v-card-title>
                    <v-card-text>{{ getGalaxyUsers5Years.toLocaleString() || "No usage info for 5 years"
                      }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>Users (All Time)</v-card-title>
                    <v-card-text>{{ getGalaxyUsersAllTime.toLocaleString() || "No all-time user info" }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>Usage (5 Years)</v-card-title>
                    <v-card-text>{{ getGalaxyUsage5Years.toLocaleString() || "No usage info for 5 years"
                      }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>Usage (All Time)</v-card-title>
                    <v-card-text>{{ getGalaxyUsageAllTime.toLocaleString() || "No all-time usage info" }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>BioTools IDs</v-card-title>
                    <v-card-text>{{ getGalaxyBioToolsIds || "No bio tools IDs" }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>BioTools Name</v-card-title>
                    <v-card-text>{{ getGalaxyBioToolsName || "No bio tools name" }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>EDAM Topic</v-card-title>
                    <v-card-text>{{ getGalaxyEdamTopic || "No topic info" }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>EDAM Operation</v-card-title>
                    <v-card-text>{{ getGalaxyEdamOperation || "No operation info" }}</v-card-text>
                  </v-card>
                </v-col>
              </template>
            </v-row>
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
    const toolName = decodeURIComponent(route.params.id);
    return tools.value.find(t => t.tool_name === toolName);
  }
  return null;
});

const getKey = (keys) => {
  for (const key of keys) {
    if (tool.value.fetched_metadata[key]) {
      return tool.value.fetched_metadata[key];
    }
  }
  return null;
};

const hasBiocondaData = computed(() => {
  return tool.value
    ? Object.keys(tool.value.fetched_metadata).some(key => key.startsWith('bioconda__'))
    : false;
});

const hasBiocontainersData = computed(() => {
  return tool.value
    ? Object.keys(tool.value.fetched_metadata).some(key => key.startsWith('biocontainers__'))
    : false;
});

const hasGalaxyData = computed(() => {
  return tool.value
    ? Object.keys(tool.value.fetched_metadata).some(key => key.startsWith('galaxy__'))
    : false;
});

const getSummary = computed(() => {
  return getKey(['biotools__summary', 'bioconda__summary', 'biocontainers__summary', 'galaxy__summary',]);
});

const getHome = computed(() => {
  return getKey(['biotools__home', 'bioconda__home', 'biocontainers__home', 'galaxy__source']);
});

const getURL = computed(() => {
  return getKey(["bioschemas__home"]);
});

const getDoc = computed(() => {
  return getKey(["bioconda__documentation"]);
});

const getLicense = computed(() => {
  return getKey(['biotools__license', 'bioschemas__license', 'bioconda__license', 'biocontainers__license']);
});

const getVersion = computed(() => {
  return getKey(["bioschemas__version", "bioconda__version", "biocontainers__version"]);
});

const getTotalPulls = computed(() => {
  return getKey(["bioschemas__total_pulls", "bioconda__total_pulls", "biocontainers__total_pulls"]);
});

const getIdentifiers = computed(() => {
  if (hasBiocondaData)
    return Array.isArray(tool.value.fetched_metadata.bioconda__identifiers)
      ? tool.value.fetched_metadata.bioconda__identifiers
      : [];
  else
    return Array.isArray(tool.value.fetched_metadata.biocontainers__identifiers)
      ? tool.value.fetched_metadata.biocontainers__identifiers
      : [];
});

const formattedIdentifiers = computed(() => {
  const identifiers = getIdentifiers.value;
  return identifiers.map(identifier => {
    const trimmed = identifier.trim();

    if (trimmed.startsWith("doi:")) {
      return `doi:${trimmed.slice(4)}`;
    } else if (trimmed.startsWith("biotools:")) {
      return `bio.tools:${trimmed.slice(9)}`;
    } else if (trimmed.startsWith("usegalaxy-eu:")) {
      return `usegalaxy-eu:${trimmed.slice(13)}`;
    }

    return trimmed;
  });
});

const openLink = (identifier) => {
  const trimmedIdentifier = identifier.trim();

  if (trimmedIdentifier.startsWith("doi:")) {
    window.open(`https://doi.org/${trimmedIdentifier.slice(4)}`, "_blank");
  } else if (trimmedIdentifier.startsWith("bio.tools:")) {
    window.open(`https://bio.tools/${trimmedIdentifier.slice(10)}`, "_blank");
  } else if (trimmedIdentifier.startsWith("usegalaxy-eu:")) {
    window.open(`https://usegalaxy.eu/?tool_id=${trimmedIdentifier.slice(13)}`, "_blank");
  }
};

const getOwner = computed(() => {
  return tool.value.fetched_metadata.biotools__owner || null;
});

const getOperatingSystems = computed(() => {
  return tool.value.fetched_metadata.biotools__operating_systems?.join(', ') || tool.value.fetched_metadata.bioschemas__operating_systems?.join(', ') || null;
});

const getAdditionalPlatforms = computed(() => {
  return tool.value.fetched_metadata.bioconda__additional_platforms?.join(', ') || null;
});

const getGalaxyFirstCommit = computed(() => {
  return tool.value.fetched_metadata.galaxy__first_commit || null;
});

const getGalaxyStatus = computed(() => {
  return tool.value.fetched_metadata.galaxy__status || null;
});

const getGalaxyCondaName = computed(() => {
  return tool.value.fetched_metadata.galaxy__conda_name || null;
});

const getGalaxyCondaVersion = computed(() => {
  return tool.value.fetched_metadata.galaxy__conda_version || null;
});

const getGalaxyEdamOperation = computed(() => {
  return tool.value.fetched_metadata.galaxy__edam_operation || null;
});

const getGalaxyEdamTopic = computed(() => {
  return tool.value.fetched_metadata.galaxy__edam_topic || null;
});

const getGalaxyIds = computed(() => {
  return tool.value.fetched_metadata.galaxy__galaxy_ids || null;
});

const getGalaxyToolshedCategories = computed(() => {
  return tool.value.fetched_metadata.galaxy__toolshed_categories || null;
});

const getGalaxyToolshedId = computed(() => {
  return tool.value.fetched_metadata.galaxy__toolshed_id || null;
});

const getGalaxyUsers5Years = computed(() => {
  return tool.value.fetched_metadata.galaxy__users_5_years || null;
});

const getGalaxyUsersAllTime = computed(() => {
  return tool.value.fetched_metadata.galaxy__users_all_time || null;
});

const getGalaxyUsage5Years = computed(() => {
  return tool.value.fetched_metadata.galaxy__usage_5_years || null;
});

const getGalaxyUsageAllTime = computed(() => {
  return tool.value.fetched_metadata.galaxy__usage_all_time || null;
});

const getGalaxyBioToolsIds = computed(() => {
  return tool.value.fetched_metadata.galaxy__bio_tools_ids || null;
});

const getGalaxyBioToolsName = computed(() => {
  return tool.value.fetched_metadata.galaxy__bio_tools_name || null;
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
.v-card-subtitle {
  padding-top: 25px;
}

.tool-title {
  background: linear-gradient(to right, #434343 0%, black 100%);
  padding: 10px;
  color: #f5f5f5;
  padding: 20px 30px;
  font-size: 22px !important;
}

.tool-description {
  white-space: normal;
  word-wrap: break-word;
  overflow: visible;
  max-width: 100%;
  font-size: 18px !important;
}

.back-to-listings {
  color: #333333;
  background-color: #d6d6d6;
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  text-decoration: none;
  box-shadow: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
}

.data-card {
  color: #333333;
  background-color: #fff5e4;
  border-radius: 4px;
  border: none;
}

.v-row {
  margin-top: 10px;
}
</style>
