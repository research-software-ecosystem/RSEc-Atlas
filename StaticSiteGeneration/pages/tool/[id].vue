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

              <!-- <v-col cols="12" md="3" lg="3">
                <v-card class="data-card">
                  <v-card-title>Total Pulls</v-card-title>
                  <v-card-text>{{ getTotalPulls.toLocaleString() || "No total pulls info" }}</v-card-text>
                </v-card>
              </v-col> -->

              <v-col cols="12" md="3" lg="12">
                <v-card class="data-card">
                  <v-card-title>Identifiers</v-card-title>
                  <v-card-text>
                    <v-card-text v-if="formattedIdentifiers.length === 0">
                      No identifiers info
                    </v-card-text>
                    <v-btn v-for="(identifier, index) in formattedIdentifiers" :key="index"
                      style="margin-right: 10px; margin-bottom: 10px; background-color: #434343; color: wheat;"
                      @click="openLink(identifier)">
                      <template v-if="identifier.startsWith('bio.tools:')">
                        <img style="height: 15px; width: 15px; margin-right: 5px;"
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAASCAYAAABB7B6eAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAACC2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KD0UqkwAAAn9JREFUOBGlVEuLE0EQruqZiftwDz4QYT1IYM8eFkHFw/4HYX+GB3/B4l/YP+CP8OBNTwpCwFMQXAQPKtnsg5nJZpKdni6/6kzHvAYDFtRUT71f3UwAEbkLch9ogQxcBwRKMfAnM1/CBwgrbxkgPAYqlBOy1jfovlaPsEiWPROZmqmZKKzOYCJb/AbdYLso9/9B6GppBRqCrjSYYaquZq20EUKAzVpjo1FzWRDVrNay6C/HDxT92wXrAVCH3ASqq5VqEtv1WZ13Mdwf8LFyyKECNbgHHAObWhScf4Wnj9CbQpPzWYU3UFoX3qkhlG8AY2BTQt5/EA7qaEPQsgGLWied0A8VKrHAsCC1eJ6EFoUd1v6GoPOaRAtDPViUr/wPzkIFV9AaAZGtYB568VyJfijV+ZBzlVZJ3W7XHB2RESGe4opXIGzRTdjcAupOK09RA6kzr1NTrTj7V1ugM4VgPGWEw+e39CxO6JUw5XhhKihmaDacU2GiR0Ohcc4cZ+Kq3AjlEnEeRSazLs6/9b/kh4eTC+hngE3QQD7Yyclxsrf3cpxsPXn+cFdenF9aqlBXMXaDiEyfyfawBz2RqC/O9WF1ysacOpytlUSoqNrtfbS642+4D4CS9V3xb4u8P/ACI4O810efRu6KsC0QnjHJGaq4IOGUjWTo/YDZDB3xSIxcGyNlWcTucb4T3in/3IaueNrZyX0lGOrWndstOr+w21UlVFokILjJLFhPukbVY8OmwNQ3nZgNJNmKDccusSb4UIe+gtkI+9/bSLJDjqn763f5CQ5TLApmICkqwR0QnUPKZFIUnoozWcQuRbC0Km02knj0tPYx63furGs3x/iPnz83zJDVNtdP3QAAAABJRU5ErkJggg==">
                      </template>
                      <template v-else-if="identifier.startsWith('usegalaxy-eu:')">
                        <img style="height: 15px; width: 20px; margin-right: 5px;"
                          src="https://elixir-europe.org/sites/default/files/images/biotools-logo.png">
                      </template>
                      {{ identifier }}
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="3" lg="12">
                <v-card class="data-card">
                  <v-card-title>Publications</v-card-title>
                  <v-card-text>
                    <v-card-text v-if="formattedPublications.length == 0">{{ "No publications info" }}</v-card-text>
                    <v-btn v-for="(publication, index) in formattedPublications" :key="index"
                      style="margin-right: 10px; margin-bottom: 10px; background-color: #434343; color: wheat; justify-content: center; align-items: center"
                      @click="openLink(publication)">
                      <i class="fas fa-book" style="margin-right: 5px; color: white"></i>
                      {{ publication }}
                    </v-btn>
                  </v-card-text>
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
                    <v-card-text>{{ getGalaxyUsers5Years ?
                      getGalaxyUsers5Years.toLocaleString() :
                      "No usage info for 5 years"
                      }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>Users (All Time)</v-card-title>
                    <v-card-text>{{ getGalaxyUsersAllTime ?
                      getGalaxyUsersAllTime.toLocaleString() :
                      "No all-time user info" }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>Usage (5 Years)</v-card-title>
                    <v-card-text>{{ getGalaxyUsage5Years ?
                      getGalaxyUsage5Years.toLocaleString() :
                      "No usage info for 5 years"
                      }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="3">
                  <v-card class="data-card">
                    <v-card-title>Usage (All Time)</v-card-title>
                    <v-card-text>{{ getGalaxyUsageAllTime ?
                      getGalaxyUsageAllTime.toLocaleString() :
                      "No all-time usage info" }}</v-card-text>
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
                    <v-card-title>EDAM Operation</v-card-title>
                    <v-card-text>{{ getGalaxyEdamOperation || "No operation info" }}</v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="12">
                  <v-card class="data-card">
                    <v-card-title>EDAM Topic</v-card-title>
                    <v-card-text>
                      <v-card-text v-if="getGalaxyEdamTopics.length == 0">{{ "No topic info" }}</v-card-text>
                      <v-btn v-for="(topic, index) in getGalaxyEdamTopics" :key="index"
                        style="margin-right: 10px; margin-bottom: 10px; background-color: #434343; color: wheat; justify-content: center; align-items: center"
                        @click="openTopic(topic)">
                        <i class="fas fa-bookmark" style="margin-right: 5px; color: white"></i>
                        {{ topic }}
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="3" lg="12">
                  <v-card class="data-card">
                    <v-card-title>Galaxy IDs</v-card-title>
                    <v-card-text>{{ getGalaxyIds || "No galaxy IDs info" }}</v-card-text>
                  </v-card>
                </v-col>
              </template>
            </v-row>
          </v-card-text>

          <v-row style="background: linear-gradient(to right, #434343 0%, black 100%); color: white; padding: 20px;">
            <!-- Install with Conda Section -->
            <v-col cols="12" md="4" lg="4" style="text-align: center;">
              <h3 style="margin-bottom: 10px;">Install with Conda</h3>
              <v-btn style="margin: 5px; background-color: #1976D2; color: white;">Conda Button 1</v-btn>
              <v-btn style="margin: 5px; background-color: #1976D2; color: white;">Conda Button 2</v-btn>
              <p style="margin-top: 10px;">Command string 1 for Conda.</p>
              <p>Command string 2 for Conda.</p>
            </v-col>

            <!-- Install with Containers Section -->
            <v-col cols="12" md="4" lg="4" style="text-align: center;">
              <h3 style="margin-bottom: 10px;">Install with Containers</h3>
              <v-btn style="margin: 5px; background-color: #1976D2; color: white;">Container Button 1</v-btn>
              <v-btn style="margin: 5px; background-color: #1976D2; color: white;">Container Button 2</v-btn>
              <p style="margin-top: 10px;">Command string 1 for Containers.</p>
              <p>Command string 2 for Containers.</p>
            </v-col>

            <!-- Run in Galaxy Section -->
            <v-col cols="12" md="4" lg="4" style="text-align: center;">
              <h3 style="margin-bottom: 10px;">Run in Galaxy</h3>
              <v-btn style="margin: 5px; background-color: #1976D2; color: white;">Galaxy Button 1</v-btn>
              <v-btn style="margin: 5px; background-color: #1976D2; color: white;">Galaxy Button 2</v-btn>
              <p style="margin-top: 10px;">Command string 1 for Galaxy.</p>
              <p>Command string 2 for Galaxy.</p>
            </v-col>
          </v-row>
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

const getDoc = computed(() => {
  return getKey(["bioconda__documentation"]);
});

const getLicense = computed(() => {
  return getKey(['biotools__license', 'bioschemas__license', 'bioconda__license', 'biocontainers__license']);
});

const getVersion = computed(() => {
  return getKey(["bioschemas__version", "bioconda__version", "biocontainers__version"]);
});

// const getTotalPulls = computed(() => {
//   return getKey(["bioschemas__total_pulls", "bioconda__total_pulls", "biocontainers__total_pulls"]);
// });

const getIdentifiers = computed(() => {
  const identifiersList = new Set();
  if (hasBiocondaData && Array.isArray(tool.value.fetched_metadata.bioconda__identifiers)) {
    tool.value.fetched_metadata.bioconda__identifiers.forEach(id => !id.startsWith("doi:") && identifiersList.add(id));
  }
  if (hasBiocontainersData && Array.isArray(tool.value.fetched_metadata.biocontainers__identifiers)) {
    tool.value.fetched_metadata.biocontainers__identifiers.forEach(id => !id.startsWith("doi:") && identifiersList.add(id));
  }
  const uniqueIdentifiersList = Array.from(identifiersList).sort();
  return uniqueIdentifiersList;
});

const getPublications = computed(() => {
  const publicationsList = new Set();
  if (hasBiocondaData && Array.isArray(tool.value.fetched_metadata.bioconda__identifiers)) {
    tool.value.fetched_metadata.bioconda__identifiers.forEach(id => id.startsWith("doi:") && publicationsList.add(id));
  }
  if (hasBiocontainersData && Array.isArray(tool.value.fetched_metadata.biocontainers__identifiers)) {
    tool.value.fetched_metadata.biocontainers__identifiers.forEach(id => id.startsWith("doi:") && publicationsList.add(id));
  }
  const uniquePublicationsList = Array.from(publicationsList).sort();
  return uniquePublicationsList;
});

const formattedIdentifiers = computed(() => {
  const identifiers = getIdentifiers.value;
  return identifiers.map(identifier => {
    const trimmed = identifier.trim();

    if (trimmed.startsWith("biotools:")) {
      return `bio.tools:${trimmed.slice(9)}`;
    } else if (trimmed.startsWith("usegalaxy-eu:")) {
      return `usegalaxy-eu:${trimmed.slice(13)}`;
    }

    return trimmed;
  });
});

const formattedPublications = computed(() => {
  const publications = getPublications.value;
  return publications.map(publication => {
    const trimmed = publication.trim();
    return `doi:${trimmed.slice(4)}`;
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

const openTopic = (topic) => {
  const trimmedTopic = topic.trim();
  const currentOrigin = window.location.origin;
  window.open(`${currentOrigin}/StudyProject/search/${trimmedTopic}`, "_blank");
};


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

const getGalaxyEdamTopics = computed(() => {
  return tool.value.fetched_metadata.galaxy__edam_topic.split(",").map((item) => item.trim()) || null;
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
