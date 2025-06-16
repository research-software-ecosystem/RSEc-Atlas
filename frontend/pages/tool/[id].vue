<template>
  <v-container>
    <v-card class="fade-scale" v-if="tool">
      <!-- Title -->
      <v-card-title
        class="tool-title dynamic-gradient"
        style="position: relative"
      >
        <span class="fas fa-caret-right" style="margin-right: 4px" />
        {{ tool.tool_name.toUpperCase() }}
        <template v-if="hasBiocondaData">
          <a
            :href="
              'https://bioconda.github.io/recipes/' +
              pageMetadata?.bioconda?.name +
              '/README.html'
            "
            target="_blank"
            style="
              height: 30px;
              width: 130px;
              padding: 0;
              margin-left: 8px;
              display: inline-flex;
            "
          >
            <v-img
              src="https://img.shields.io/badge/install%20with-bioconda-brightgreen.svg?style=flat"
              alt="Install with Bioconda"
              max-width="130px"
              height="24px"
            />
          </a>
        </template>
        <template v-if="hasBiocontainersData">
          <a
            :href="
              'https://quay.io/repository/biocontainers/' +
              pageMetadata?.biocontainers?.name +
              '?tab=tags&tag=latest'
            "
            target="_blank"
            style="
              height: 30px;
              width: 130px;
              padding: 0;
              margin-left: 8px;
              display: inline-flex;
            "
          >
            <v-img
              src="https://img.shields.io/badge/link%20to-biocontainers-brightgreen.svg?style=flat"
              alt="Link to Biocontainers"
              max-width="130px"
              height="24px"
            />
          </a>
        </template>
        <template v-if="getFilteredIdentifiers('biotools').length > 0">
          <a
            v-for="(identifier, index) in getFilteredIdentifiers('biotools')"
            :key="index"
            @click="openLink(identifier)"
            style="
              height: 30px;
              width: 100px;
              padding: 0;
              margin-left: 8px;
              display: inline-flex;
              cursor: pointer;
            "
          >
            <v-img
              src="https://img.shields.io/badge/link%20to-bio.tools-brightgreen.svg?style=flat"
              alt="Link to bio.tools"
              max-width="130px"
              height="24px"
            />
          </a>
        </template>

        <!-- Favorite Star -->
        <span
          class="fas fa-star"
          :style="{
            position: 'absolute',
            right: '25px',
            top: '25px',
            color: isFavorite(tool) ? '#fff2e3' : '#fff2e370',
            cursor: 'pointer',
            fontSize: '25px',
          }"
          @click="toggleFavorite(tool)"
          title="Toggle Favorite"
        >
        </span>
      </v-card-title>
      <v-card-subtitle class="tool-description">
        {{
          !getSummary.endsWith(".")
            ? getSummary.trim() + "."
            : getSummary.trim()
        }}
      </v-card-subtitle>

      <v-card-text style="padding: 0px 25px; padding-bottom: 15px">
        <!-- Main Tool Info Section -->
        <v-row>
          <v-col cols="12" md="3" lg="3">
            <v-card class="data-card">
              <v-card-title>Home</v-card-title>
              <v-card-text>
                <a
                  v-if="getHome"
                  :href="getHome"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    text-decoration: none;
                    max-width: 100%;
                    background-color: #434343;
                    color: wheat;
                    padding: 8px 12px;
                    border-radius: 4px;
                    display: inline-flex;
                    align-items: center;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  <span
                    class="fa-solid fa-house"
                    style="
                      margin-right: 8px;
                      color: white;
                      height: 16px;
                      width: 14px;
                    "
                  />
                  <span
                    style="
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                  >
                    {{
                      getHome
                        .replace(/^(https?:\/\/)?(www\.)?/, "")
                        .toUpperCase()
                    }}
                  </span>
                  <span
                    class="fa-solid fa-arrow-up-right-from-square"
                    style="
                      margin-left: 6px;
                      color: white;
                      height: 16px;
                      width: 14px;
                    "
                  />
                </a>
                <span v-else>No home URL</span>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3" lg="3">
            <v-card class="data-card">
              <v-card-title>Documentation</v-card-title>
              <v-card-text>
                <a
                  v-if="getDoc"
                  :href="getDoc"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    text-decoration: none;
                    max-width: 100%;
                    background-color: #434343;
                    color: wheat;
                    padding: 8px 12px;
                    border-radius: 4px;
                    display: inline-flex;
                    align-items: center;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  <span
                    class="fa-solid fa-book"
                    style="
                      margin-right: 8px;
                      color: white;
                      height: 16px;
                      width: 14px;
                    "
                  />
                  <span
                    style="
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                  >
                    {{
                      getDoc
                        .replace(/^(https?:\/\/)?(www\.)?/, "")
                        .toUpperCase()
                    }}
                  </span>
                  <span
                    class="fa-solid fa-arrow-up-right-from-square"
                    style="
                      margin-left: 6px;
                      color: white;
                      height: 16px;
                      width: 14px;
                    "
                  />
                </a>
                <span v-else>No documentation</span>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3" lg="3">
            <v-card class="data-card">
              <v-card-title>License</v-card-title>
              <v-card-text>{{ getLicense }}</v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3" lg="3">
            <v-card class="data-card">
              <v-card-title>Version</v-card-title>
              <v-card-text>
                {{ Array.isArray(getVersion) ? getVersion[0] : getVersion }}
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3" lg="12">
            <v-card class="data-card">
              <v-card-title>Publications</v-card-title>
              <v-card-text>
                <v-card-text
                  v-if="getFilteredIdentifiers('publications').length === 0"
                >
                  {{ "No publications info" }}
                </v-card-text>
                <v-btn
                  v-for="(publication, index) in getFilteredIdentifiers(
                    'publications',
                  )"
                  :key="index"
                  style="
                    margin-right: 10px;
                    margin-bottom: 10px;
                    background-color: #434343;
                    color: wheat;
                    padding: 8px 12px;
                    justify-content: center;
                    align-items: center;
                  "
                  @click="openLink(publication)"
                >
                  <i
                    class="fas fa-quote-left"
                    style="margin-right: 5px; color: white"
                  />
                  {{ publication }}
                  <span
                    class="fa-solid fa-arrow-up-right-from-square"
                    style="
                      margin-left: 6px;
                      color: white;
                      height: 16px;
                      width: 14px;
                    "
                  />
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3" lg="3">
            <v-card class="data-card">
              <v-card-title>Added Date</v-card-title>
              <v-card-text>
                {{
                  getFormattedDate(pageMetadata?.biotools?.addition_date) ||
                  "No addition date info"
                }}
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3" lg="3">
            <v-card class="data-card">
              <v-card-title>Last Update</v-card-title>
              <v-card-text>{{
                getFormattedDate(pageMetadata?.biotools?.last_update_date) ||
                "No last update date info"
              }}</v-card-text>
            </v-card>
          </v-col>

          <!-- Galaxy Data Section, if exists -->
          <template v-if="hasGalaxyData">
            <v-col cols="12" md="3" lg="3">
              <v-card class="data-card">
                <v-card-title>First Commit</v-card-title>
                <v-card-text>
                  {{
                    getFormattedDate(galaxyData?.first_commit) ||
                    "No first commit info"
                  }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="3">
              <v-card class="data-card">
                <v-card-title>Conda Name</v-card-title>
                <v-card-text>
                  {{ galaxyData?.conda_name || "No conda name info" }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="3">
              <v-card class="data-card">
                <v-card-title>Conda Version</v-card-title>
                <v-card-text>
                  {{
                    galaxyData?.conda_version
                      ? "v" + galaxyData?.conda_version
                      : "No conda version info"
                  }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="3">
              <v-card class="data-card">
                <v-card-title>Toolshed Categories</v-card-title>
                <v-card-text>
                  <ul
                    style="padding-left: 18px; margin: 0"
                    v-if="galaxyData?.toolshed_categories?.length"
                  >
                    <li
                      v-for="(cat, idx) in galaxyData?.toolshed_categories"
                      :key="idx"
                    >
                      {{ cat }}
                    </li>
                  </ul>
                  <v-card-text v-else>
                    No toolshed categories info
                  </v-card-text>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="3">
              <v-card class="data-card">
                <v-card-title>Toolshed ID</v-card-title>
                <v-card-text>
                  {{ galaxyData?.toolshed_id || "No toolshed ID info" }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="3">
              <v-card class="data-card">
                <v-card-title>Users (5 Years)</v-card-title>
                <v-card-text>
                  {{
                    galaxyData?.users_5_years
                      ? galaxyData?.users_5_years.toLocaleString()
                      : "No usage info for 5 years"
                  }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="3">
              <v-card class="data-card">
                <v-card-title>Users (All Time)</v-card-title>
                <v-card-text>
                  {{
                    galaxyData?.users_all_time
                      ? galaxyData?.users_all_time.toLocaleString()
                      : "No all-time user info"
                  }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="3">
              <v-card class="data-card">
                <v-card-title>Usage (5 Years)</v-card-title>
                <v-card-text>
                  {{
                    galaxyData?.usage_5_years
                      ? galaxyData?.usage_5_years.toLocaleString()
                      : "No usage info for 5 years"
                  }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="3">
              <v-card class="data-card">
                <v-card-title>Usage (All Time)</v-card-title>
                <v-card-text>
                  {{
                    galaxyData?.usage_all_time
                      ? galaxyData?.usage_all_time.toLocaleString()
                      : "No all-time usage info"
                  }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="3">
              <v-card class="data-card">
                <v-card-title>BioTools IDs</v-card-title>
                <v-card-text>
                  {{ galaxyData?.bio_tools_ids || "No bio tools IDs" }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="3">
              <v-card class="data-card">
                <v-card-title>BioTools Name</v-card-title>
                <v-card-text>
                  {{ galaxyData?.bio_tools_name || "No bio tools name" }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="12">
              <v-card class="data-card">
                <v-card-title>EDAM Operations</v-card-title>
                <v-card-text>
                  <ul
                    v-if="galaxyData?.edam_operations?.length"
                    style="padding-left: 18px; margin: 0"
                  >
                    <li
                      v-for="(op, idx) in galaxyData?.edam_operations"
                      :key="idx"
                    >
                      {{ op }}
                    </li>
                  </ul>
                  <v-card-text v-else> No operations info </v-card-text>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="12">
              <v-card class="data-card">
                <v-card-title>EDAM Topics</v-card-title>
                <v-card-text>
                  <v-card-text v-if="!galaxyData?.edam_topics?.length">
                    {{ "No topics info" }}
                  </v-card-text>
                  <v-btn
                    v-for="(topic, index) in galaxyData?.edam_topics"
                    :key="index"
                    style="
                      margin-right: 10px;
                      margin-bottom: 10px;
                      background-color: #434343;
                      color: wheat;
                      justify-content: center;
                      align-items: center;
                    "
                    @click="openTopic(topic)"
                  >
                    <i
                      class="fas fa-bookmark"
                      style="margin-right: 5px; color: white"
                    />
                    {{ topic }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="12">
              <v-card class="data-card">
                <v-card-title>Related Training Materials</v-card-title>
                <v-card-text>
                  <v-card-text v-if="!galaxyData?.related_tutorials?.length">
                    {{ "No training materials" }}
                  </v-card-text>

                  <v-btn
                    v-else
                    v-for="(topic, index) in galaxyData?.related_tutorials"
                    :key="index"
                    style="
                      margin-right: 10px;
                      margin-bottom: 10px;
                      background-color: #434343;
                      color: wheat;
                    "
                    @click="openTopic(topic)"
                  >
                    <i
                      class="fas fa-book"
                      style="margin-right: 5px; color: white"
                    />
                    {{
                      topic.startsWith("http")
                        ? topic
                            .split("/")
                            .find((_, idx, arr) => arr[idx - 1] === "tutorials")
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())
                        : topic
                    }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" lg="12">
              <v-card class="data-card">
                <v-card-title>Related Workflows</v-card-title>
                <v-card-text>
                  <v-card-text v-if="!galaxyData?.related_workflows?.length">
                    {{ "No related workflows" }}
                  </v-card-text>
                  <v-expansion-panels v-else variant="accordion">
                    <v-expansion-panel>
                      <v-expansion-panel-title
                        style="background-color: #434343; color: wheat"
                      >
                        <i
                          class="fas fa-sitemap"
                          style="margin-right: 5px; color: white"
                        />
                        {{ galaxyData?.related_workflows.length }}
                        workflows available. Click to view them.
                        <i
                          class="fas fa-chevron-down"
                          style="margin-left: 5px; color: white"
                        />
                      </v-expansion-panel-title>
                      <v-expansion-panel-text style="background-color: #333333">
                        <v-btn
                          v-for="(
                            topic, index
                          ) in galaxyData?.related_workflows"
                          :key="index"
                          style="
                            margin-right: 10px;
                            margin-bottom: 10px;
                            background-color: #434343;
                            color: wheat;
                          "
                          :href="topic"
                        >
                          <i
                            class="fas fa-book"
                            style="margin-right: 5px; color: white"
                          />
                          Workflow {{ index + 1 }} on
                          {{
                            topic
                              .split("/")
                              .slice(2, 3)
                              .join("")
                              .replace(/-/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())
                          }}
                        </v-btn>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-card-text>
              </v-card>
            </v-col>
          </template>
        </v-row>
      </v-card-text>

      <v-row
        class="dynamic-gradient"
        style="
          background: linear-gradient(
            132deg,
            rgba(23, 23, 23, 1) 0%,
            rgba(116, 116, 116, 1) 27%,
            rgba(23, 23, 23, 1) 100%
          );
          color: white;
          padding: 40px;
          padding-top: 6px;
          min-height: 90px;
          gap: 18px;
          display: flex;
          flex-direction: column;
        "
      >
        <v-row v-if="galaxyData">
          <!-- Run with Galaxy Section -->
          <v-col
            style="
              background-color: #33333360;
              border-radius: 4px;
              padding: 0px;
              flex: 1;
            "
          >
            <div
              style="
                background-color: #ffffff40;
                padding: 15px;
                border-radius: 4px;
                border-bottom-left-radius: 0px;
                border-bottom-right-radius: 0px;
                font-size: 18px;
                font-weight: bold;
                display: flex;
                align-items: center;
              "
            >
              <div style="display: inline-block; width: 141px">
                Run in Galaxy
              </div>
              <div
                style="display: inline-block; color: #ffffff70; margin: 0 10px"
              >
                |
              </div>
              <div
                style="
                  display: inline-flex;
                  font-size: 17px;
                  font-weight: normal;
                "
              >
                An academic portal to run tools, workflows and manage your data.
              </div>
            </div>

            <div style="padding: 15px; padding-bottom: 5px">
              <template
                v-for="[instanceKey, numberOfTools] in Object.entries(
                  availableOnGalaxyInstances,
                )"
              >
                <a
                  v-if="numberOfTools > 0"
                  :href="`https://usegalaxy.${instanceKey}/?tool_id=${galaxyData?.tool_ids?.[0]}`"
                  target="_blank"
                  :title="`Run ${tool.tool_name} in Galaxy ${instanceKey.toUpperCase()}`"
                  rel="noopener noreferrer"
                  class="link-to-external"
                >
                  <img
                    style="height: 16px; width: 16px; margin-right: 5px"
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAASCAYAAABB7B6eAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAACC2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KD0UqkwAAAn9JREFUOBGlVEuLE0EQruqZiftwDz4QYT1IYM8eFkHFw/4HYX+GB3/B4l/YP+CP8OBNTwpCwFMQXAQPKtnsg5nJZpKdni6/6kzHvAYDFtRUT71f3UwAEbkLch9ogQxcBwRKMfAnM1/CBwgrbxkgPAYqlBOy1jfovlaPsEiWPROZmqmZKKzOYCJb/AbdYLso9/9B6GppBRqCrjSYYaquZq20EUKAzVpjo1FzWRDVrNay6C/HDxT92wXrAVCH3ASqq5VqEtv1WZ13Mdwf8LFyyKECNbgHHAObWhScf4Wnj9CbQpPzWYU3UFoX3qkhlG8AY2BTQt5/EA7qaEPQsgGLWied0A8VKrHAsCC1eJ6EFoUd1v6GoPOaRAtDPViUr/wPzkIFV9AaAZGtYB568VyJfijV+ZBzlVZJ3W7XHB2RESGe4opXIGzRTdjcAupOK09RA6kzr1NTrTj7V1ugM4VgPGWEw+e39CxO6JUw5XhhKihmaDacU2GiR0Ohcc4cZ+Kq3AjlEnEeRSazLs6/9b/kh4eTC+hngE3QQD7Yyclxsrf3cpxsPXn+cFdenF9aqlBXMXaDiEyfyfawBz2RqC/O9WF1ysacOpytlUSoqNrtfbS642+4D4CS9V3xb4u8P/ACI4O810efRu6KsC0QnjHJGaq4IOGUjWTo/YDZDB3xSIxcGyNlWcTucb4T3in/3IaueNrZyX0lGOrWndstOr+w21UlVFokILjJLFhPukbVY8OmwNQ3nZgNJNmKDccusSb4UIe+gtkI+9/bSLJDjqn763f5CQ5TLApmICkqwR0QnUPKZFIUnoozWcQuRbC0Km02knj0tPYx63furGs3x/iPnz83zJDVNtdP3QAAAABJRU5ErkJggg=="
                  />
                  Galaxy {{ instanceKey.toUpperCase() }}
                  <span class="fa-solid fa-arrow-up-right-from-square ml-2" />
                </a>
              </template>
            </div>
          </v-col>
        </v-row>

        <v-row
          v-if="hasBiocondaData || hasBiocontainersData || hasGalaxyData"
          style="gap: 18px"
        >
          <!-- Install with Bioconda Section -->
          <v-col
            v-if="hasBiocondaData"
            cols="12"
            md="4"
            lg=""
            style="
              background-color: #33333360;
              border-radius: 4px;
              padding: 0px;
              flex: 1;
            "
          >
            <div
              style="
                background-color: #ffffff40;
                padding: 15px;
                border-radius: 4px;
                border-bottom-left-radius: 0px;
                border-bottom-right-radius: 0px;
                font-size: 18px;
                font-weight: bold;
                display: flex;
                align-items: center;
              "
            >
              <div style="display: inline-block">Install with Bioconda</div>
              <div
                style="display: inline-block; color: #ffffff70; margin: 0 10px"
              >
                |
              </div>
              <div style="display: inline-flex; align-items: center">
                <a
                  :href="
                    'https://bioconda.github.io/recipes/' +
                    pageMetadata?.bioconda?.name +
                    '/README.html'
                  "
                  target="_blank"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 160px;
                  "
                >
                  <v-img
                    src="https://img.shields.io/badge/install%20with-bioconda-brightgreen.svg?style=flat"
                    alt="Install with Bioconda"
                    style="max-height: 24px; width: auto"
                  />
                </a>
              </div>
            </div>
            <div style="padding: 15px">
              <div
                style="
                  display: flex;
                  align-items: center;
                  position: relative;
                  width: 100%;
                "
              >
                <code
                  style="
                    flex-grow: 1;
                    background-color: #272822;
                    color: #f8f8f2;
                    border: 1px solid grey;
                    padding: 10px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 16px;
                    overflow-x: auto;
                    padding-right: 55px;
                    min-height: 120px;
                  "
                >
                  <span style="color: lightgreen">[bash command]</span>
                  <br />
                  > conda install -c conda-forge -c bioconda
                  {{ tool.tool_name.toLowerCase() }}
                </code>
                <div
                  title="Copy Command"
                  @click="copyCommandToClipboard('conda')"
                  class="copy-command"
                >
                  <i class="fas fa-copy" />
                </div>
              </div>
            </div>
          </v-col>

          <!-- Install with Biocontainers Section -->
          <v-col
            v-if="hasBiocontainersData"
            cols="12"
            md="4"
            lg=""
            style="
              background-color: #33333360;
              border-radius: 4px;
              padding: 0px;
              flex: 1;
            "
          >
            <div
              style="
                background-color: #ffffff40;
                padding: 15px;
                border-radius: 4px;
                border-bottom-left-radius: 0px;
                border-bottom-right-radius: 0px;
                font-size: 18px;
                font-weight: bold;
                display: flex;
                align-items: center;
              "
            >
              <div style="display: inline-block">
                Install with Biocontainers
              </div>
              <div
                style="display: inline-block; color: #ffffff70; margin: 0 10px"
              >
                |
              </div>
              <div style="display: inline-flex; align-items: center">
                <a
                  :href="
                    'https://quay.io/repository/biocontainers/' +
                    pageMetadata?.biocontainers?.name +
                    '?tab=tags&tag=latest'
                  "
                  target="_blank"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 160px;
                  "
                >
                  <v-img
                    src="https://img.shields.io/badge/link%20to-biocontainers-brightgreen.svg?style=flat"
                    alt="Link to Biocontainers"
                    style="max-height: 24px; width: auto"
                  />
                </a>
              </div>
            </div>
            <div style="padding: 15px">
              <div
                style="
                  display: flex;
                  align-items: center;
                  position: relative;
                  width: 100%;
                "
              >
                <code
                  style="
                    flex-grow: 1;
                    background-color: #272822;
                    color: #f8f8f2;
                    border: 1px solid grey;
                    padding: 10px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 16px;
                    overflow-x: auto;
                    padding-right: 55px;
                    min-height: 120px;
                  "
                >
                  <span style="color: lightgreen">[bash command]</span>
                  <br />
                  > docker run -i -t --rm quay.io/biocontainers/{{
                    tool.tool_name.toLowerCase()
                  }}
                  :&lt;version&gt; bash
                </code>
                <div
                  title="Copy Command"
                  @click="copyCommandToClipboard('biocontainers')"
                  class="copy-command"
                >
                  <i class="fas fa-copy" />
                </div>
              </div>
            </div>
          </v-col>

          <!-- Install with Singularity Section -->
          <v-col
            v-if="hasBiocondaData"
            cols="12"
            md="4"
            lg=""
            style="
              background-color: #33333360;
              border-radius: 4px;
              padding: 0px;
              flex: 1;
            "
          >
            <div
              style="
                background-color: #ffffff40;
                padding: 15px;
                border-radius: 4px;
                border-bottom-left-radius: 0px;
                border-bottom-right-radius: 0px;
                font-size: 18px;
                font-weight: bold;
                display: flex;
                align-items: center;
              "
            >
              <div style="display: inline-block">Install with Singularity</div>
            </div>
            <div style="padding: 15px">
              <div
                style="
                  display: flex;
                  align-items: center;
                  position: relative;
                  width: 100%;
                "
              >
                <code
                  style="
                    flex-grow: 1;
                    background-color: #272822;
                    color: #f8f8f2;
                    border: 1px solid grey;
                    padding: 10px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 16px;
                    overflow-x: auto;
                    padding-right: 55px;
                    min-height: 120px;
                  "
                >
                  <span style="color: lightgreen">[bash command]</span>
                  <br />
                  <span>
                    > singularity exec
                    https://depot.galaxyproject.org/singularity/
                  </span>
                  <span>
                    {{ tool.tool_name.toLowerCase() }}:&lt;version&gt; bash
                  </span>
                </code>
                <div
                  title="Copy Command"
                  @click="copyCommandToClipboard('singularity')"
                  class="copy-command"
                >
                  <i class="fas fa-copy" />
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-row>
    </v-card>

    <div style="margin-top: 20px" v-else-if="!tool && !loading">
      No tool found.
      <span style="font-weight: 600; margin-left: 6px; font-size: 20px">
        ¯\_(ツ)_/¯
      </span>
    </div>

    <div v-else>Fetching tools data...</div>

    <!-- Back to Listings -->
    <v-btn to="/" class="back-to-listings">
      <span class="fas fa-caret-left" style="margin-right: 8px" />
      <span> Back to Listings</span>
    </v-btn>
  </v-container>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useToolsStore } from "@/stores/tools";

const route = useRoute();
const favoriteItems = ref(JSON.parse(localStorage.getItem("favorites")) || []);
const toolsStore = useToolsStore();
const tool = ref(null);
const loading = ref(false);

onMounted(async () => {
  const handleScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = Math.min(scrollTop / maxScroll, 1) * 100;
    const middleStop1 = 80 - scrollPercentage * 0.2;
    const middleStop2 = 45 - scrollPercentage * 0.2;
    const gradientElements =
      document.getElementsByClassName("dynamic-gradient");
    if (gradientElements[0]) {
      gradientElements[0].style.background = `linear-gradient(132deg, rgba(23,23,23,1) 0%, rgba(116,116,116,1) ${middleStop1}%, rgba(23,23,23,1) 100%)`;
    }
    if (gradientElements[1]) {
      gradientElements[1].style.background = `linear-gradient(132deg, rgba(23,23,23,1) 0%, rgba(116,116,116,1) ${middleStop2}%, rgba(23,23,23,1) 100%)`;
    }
  };

  document.addEventListener("scroll", handleScroll);

  try {
    loading.value = true;
    const toolName = decodeURIComponent(route.params.id);
    tool.value = await toolsStore.fetchToolMetadata(toolName);
  } catch (error) {
    console.error("Error fetching tool metadata:", error);
    tool.value = null;
  } finally {
    loading.value = false;
  }

  onBeforeUnmount(() => {
    document.removeEventListener("scroll", handleScroll);
  });
});

const pageMetadata = computed(() => {
  return tool.value?.page_metadata || {};
});

const galaxyData = computed(() => {
  return pageMetadata.value?.galaxy || {};
});

const toolContents = computed(() => {
  return tool.value?.contents || [];
});

const availableOnGalaxyInstances = computed(() => {
  return galaxyData.value?.no_of_tools || {};
});

const hasBiocondaData = computed(() => {
  return toolContents.value?.includes("bioconda");
});

const hasBiocontainersData = computed(() => {
  return toolContents.value?.includes("biocontainers");
});

const hasGalaxyData = computed(() => {
  return toolContents.value?.includes("galaxy");
});

const getSummary = computed(() => {
  return (
    pageMetadata.value?.biotools?.summary ||
    pageMetadata.value?.bioconda?.summary ||
    galaxyData.value?.summary ||
    "No summary info available"
  );
});

const getHome = computed(() => {
  return (
    pageMetadata.value?.biotools?.home ||
    pageMetadata.value?.bioconda?.home ||
    galaxyData.value?.source ||
    ""
  );
});

const getDoc = computed(() => {
  return pageMetadata.value?.bioconda?.documentation || "";
});

const getLicense = computed(() => {
  return (
    pageMetadata.value?.biotools?.license ||
    pageMetadata.value?.bioschemas?.license ||
    pageMetadata.value?.bioconda?.license ||
    pageMetadata.value?.biocontainers?.license ||
    "No license info available"
  );
});

const getVersion = computed(() => {
  return (
    pageMetadata.value?.bioschemas?.version ||
    pageMetadata.value?.bioconda?.version ||
    pageMetadata.value?.biotools?.version ||
    "No version info available"
  );
});

const getFilteredIdentifiers = computed(() => {
  return (type) => {
    const prefixMap = {
      publications: (id) => id.startsWith("doi:") && `doi:${id.slice(4)}`,
      biotools: (id) =>
        id.startsWith("biotools:") && `bio.tools:${id.slice(9)}`,
      galaxy: (id) =>
        id.startsWith("usegalaxy-eu:") && `usegalaxy-eu:${id.slice(13)}`,
    };

    if (!prefixMap[type]) {
      console.warn(`Unknown type: ${type}`);
      return [];
    }

    const filterFn = prefixMap[type];
    const allIdentifiers = [
      ...(hasBiocondaData
        ? pageMetadata.value?.bioconda?.identifiers || []
        : []),
      ...(hasBiocontainersData
        ? pageMetadata.value?.biocontainers?.identifiers || []
        : []),
    ];

    const filteredList = allIdentifiers
      .map((id) => id.trim())
      .map(filterFn)
      .filter(Boolean);

    return Array.from(new Set(filteredList)).sort();
  };
});

function openLink(identifier) {
  const trimmedIdentifier = identifier.trim();
  if (trimmedIdentifier.startsWith("doi:")) {
    window.open(`https://doi.org/${trimmedIdentifier.slice(4)}`, "_blank");
  } else if (trimmedIdentifier.startsWith("bio.tools:")) {
    window.open(`https://bio.tools/${trimmedIdentifier.slice(10)}`, "_blank");
  } else if (trimmedIdentifier.startsWith("usegalaxy-eu:")) {
    window.open(
      `https://usegalaxy.eu/?tool_id=${trimmedIdentifier.slice(13)}`,
      "_blank",
    );
  }
}

function openTopic(topic) {
  const trimmedTopic = "tag:" + topic.trim().toLowerCase();
  const currentOrigin =
    window.location.origin +
    window.location.pathname.replace(/\/tool\/[^/]+$/, "");
  window.open(`${currentOrigin}/search/${trimmedTopic}`, "_blank");
}

function copyCommandToClipboard(type) {
  let command = "";
  let package_name = tool.value.tool_name.toLowerCase();
  switch (type) {
    case "conda":
      command = "conda install -c conda-forge -c bioconda " + package_name;
      break;
    case "biocontainers":
      command =
        "docker run -i -t --rm quay.io/biocontainers/" +
        package_name +
        ":<version> bash";
      break;
    case "singularity":
      command =
        "singularity exec https://depot.galaxyproject.org/singularity/" +
        package_name +
        ":<version> bash";
      break;
  }
  navigator.clipboard.writeText(command);
}

function toggleFavorite(t) {
  if (isFavorite(t)) {
    favoriteItems.value = favoriteItems.value.filter(
      (i) => i.search_index !== t.search_index,
    );
  } else {
    favoriteItems.value.push(t);
  }
  localStorage.setItem("favorites", JSON.stringify(favoriteItems.value));
}

function isFavorite(t) {
  return favoriteItems.value.some((i) => i.search_index === t.search_index);
}

function getFormattedDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<style scoped>
.v-row {
  margin-top: 10px;
}

.v-card-subtitle {
  padding-top: 25px;
}

.v-col-md-3 {
  padding: 10px;
}

.tool-title {
  background: linear-gradient(132deg, #171717 0%, #747474 80%, #171717 100%);
  padding: 10px;
  color: white;
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
  color: white;
  background-color: #464646;
  display: inline-block;
  margin-top: 20px;
  padding: 10px 12px;
  text-decoration: none;
  box-shadow: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
}

.data-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #413c3c;
  background-color: #fff2e3;
  border-radius: 4px;
  border: none;
}

.copy-command {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ffffff30;
  color: white;
  height: 35px;
  width: 35px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.copy-command:hover {
  background-color: #ffffff50;
}

.copy-command:active {
  background-color: #ffffff70;
}

.fade-scale {
  opacity: 0;
  transform: scale(0.99);
  animation: fadeScale 0.3s ease-in-out forwards;
}

.link-to-external {
  margin-right: 8px;
  margin-bottom: 8px;
  background-color: #333333;
  color: #f8f8f2;
  border: 1px solid grey;
  padding: 8px 12px;
  justify-content: center;
  align-items: center;
  box-shadow: none;
  display: inline-flex;
  text-decoration: none;
  cursor: pointer;
}

@keyframes fadeScale {
  from {
    opacity: 0;
    transform: scale(0.99);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
