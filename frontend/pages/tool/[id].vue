<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
const toast = useToast();

const { isFavoriteTool, toggleFavoriteTool } = useToolsStore();

const tool = ref(null);
const loading = ref(false);

const galaxyInstanceTabs = computed(() => {
  return Object.entries(getToolInGalaxyAvailability(tool.value))
    .map(([insKey, nOfTools]) =>
      nOfTools === getToolToolIds(tool.value).length
        ? {
            nOfTools,
            key: insKey,
            label: `Galaxy ${insKey.toUpperCase()}`,
          }
        : null,
    )
    .filter(Boolean);
});

const isToolFavorite = computed(() => {
  return isFavoriteTool(getToolName(tool.value));
});

async function loadData() {
  try {
    loading.value = true;
    const toolName = decodeURIComponent(route.params.id);

    tool.value = await $fetch(`/metadata/tools/${toolName}.json`);
  } catch (error) {
    toast.add({
      title: "Error Loading Tool",
      description: `Failed to load tool: ${error.message}`,
      variant: "danger",
    });
  } finally {
    loading.value = false;
  }
}

function toggleFavorite() {
  toggleFavoriteTool(getToolName(tool.value));
}

onMounted(async () => {
  await loadData();
});
</script>

<template>
  <div>
    <div class="w-full">
      <UBreadcrumb
        class="mb-2"
        :items="[
          { label: 'Home', icon: 'uil:home', to: '/' },
          {
            label: tool?.tool_name,
            icon: 'uil:wrench',
          },
        ]"
      />
    </div>

    <div
      v-if="!loading && tool?.tool_name"
      class="flex w-full flex-col gap-2 lg:flex-row lg:gap-4"
    >
      <Head>
        <Title>
          {{ getToolName(tool) }}
        </Title>

        <Meta name="description" :content="getToolDescription(tool)" />
      </Head>

      <div class="w-full lg:w-1/3">
        <UCard class="mb-3 break-all">
          <div class="flex items-start justify-between">
            <h2 class="mb-1 text-3xl font-bold lg:text-4xl">
              {{ getToolName(tool) }}
            </h2>

            <UTooltip
              :delay-duration="0"
              :text="
                isToolFavorite ? 'Remove from favorites' : 'Add to favorites'
              "
            >
              <UButton
                :variant="isToolFavorite ? 'solid' : 'outline'"
                :color="isToolFavorite ? 'warning' : 'secondary'"
                class="cursor-pointer"
                icon="uil:star"
                @click="toggleFavorite"
              />
            </UTooltip>
          </div>

          <div class="flex flex-wrap gap-2">
            <UBadge icon="uil:box" color="neutral" variant="subtle">
              {{ getToolVersion(tool) }}
            </UBadge>

            <UBadge icon="uil:balance-scale" color="secondary" variant="subtle">
              {{ getToolLicense(tool) }}
            </UBadge>

            <UTooltip :delay-duration="250" text="Last Updated">
              <UBadge icon="uil:calendar-alt" variant="subtle">
                {{ getToolLastUpdateDate(tool) }}
              </UBadge>
            </UTooltip>

            <UTooltip :delay-duration="250" text="View Tool Home Page">
              <NuxtLink
                target="_blank"
                :to="getToolHomePage(tool)"
                class="font-semibold"
              >
                <UBadge
                  variant="subtle"
                  color="secondary"
                  icon="uil:home"
                  trailing-icon="uil:external-link-alt"
                >
                  {{
                    getToolHomePage(tool).replace(/^(https?:\/\/)?(www\.)?/, "")
                  }}
                </UBadge>
              </NuxtLink>
            </UTooltip>

            <UTooltip :delay-duration="0" text="View Tool Documentation">
              <NuxtLink
                target="_blank"
                :to="getToolDocumentation(tool) ?? undefined"
                class="font-semibold"
              >
                <UBadge
                  variant="subtle"
                  color="primary"
                  icon="uil:book"
                  :trailing-icon="
                    getToolDocumentation(tool) ? 'uil:external-link-alt' : ''
                  "
                >
                  {{
                    getToolDocumentation(tool)
                      ? getToolDocumentation(tool).replace(
                          /^(https?:\/\/)?(www\.)?/,
                          "",
                        )
                      : "No documentation available"
                  }}
                </UBadge>
              </NuxtLink>
            </UTooltip>
          </div>

          <span class="text-md w-full break-normal lg:text-lg">
            {{ getToolDescription(tool) }}
          </span>
        </UCard>

        <UCard class="mb-3">
          <h3 class="mb-2 flex items-center text-lg font-semibold">
            <Icon name="uil:database" class="mr-2 text-lg" />
            EDAM Data
          </h3>

          <div class="mb-2">
            <span class="font-semibold text-gray-800 dark:text-gray-200">
              Operations:
            </span>

            <span
              class="text-gray-500 dark:text-gray-400"
              v-if="getToolEDAMOperations(tool).length === 0"
            >
              No operations info.
            </span>
            <ul class="list-disc pl-5">
              <li
                v-for="operation in getToolEDAMOperations(tool)"
                :key="operation"
                class="text-gray-600 dark:text-gray-300"
              >
                {{ operation }}
              </li>
            </ul>
          </div>

          <div class="flex flex-wrap gap-2">
            <span class="font-semibold text-gray-800 dark:text-gray-200">
              Topics:
            </span>

            <span
              class="text-gray-500 dark:text-gray-400"
              v-if="getToolEDAMTopics(tool).length === 0"
            >
              No topics available
            </span>

            <template v-else>
              <NuxtLink
                v-for="topic in getToolEDAMTopics(tool)"
                :key="topic"
                target="_blank"
                :to="`/search/tag:'${topic.trim()}'`"
              >
                <UBadge
                  class="text-gray-600 dark:text-gray-300"
                  variant="subtle"
                  color="primary"
                  :trailing-icon="`uil:external-link-alt`"
                  icon="uil:tag"
                >
                  {{ topic }}
                </UBadge>
              </NuxtLink>
            </template>
          </div>
        </UCard>

        <UCard class="mb-3">
          <h3 class="mb-2 flex items-center text-lg font-semibold">
            <Icon name="uil:info-circle" class="mr-2 text-lg" />
            Tool Information
          </h3>

          <div class="flex flex-col gap-2">
            <InlineInfo title="Added on" :info="getToolAdditionDate(tool)" />
            <InlineInfo
              title="Last Update"
              :info="getToolLastUpdateDate(tool)"
            />
            <InlineInfo
              title="First Commit"
              :info="getToolFirstCommitDate(tool)"
            />
            <InlineInfo title="Tags" v-if="getToolTags(tool).length > 0">
              <div class="flex flex-wrap gap-2">
                <NuxtLink
                  v-for="tag in getToolTags(tool)"
                  :key="tag"
                  target="_blank"
                  :to="`/search/tag:'${tag.trim()}'`"
                >
                  <UBadge
                    class="text-gray-600 dark:text-gray-300"
                    variant="subtle"
                    color="primary"
                    :trailing-icon="`uil:external-link-alt`"
                    icon="uil:tag-alt"
                  >
                    {{ tag }}
                  </UBadge>
                </NuxtLink>
              </div>
            </InlineInfo>
          </div>
        </UCard>

        <UCard
          class="mb-3"
          v-if="
            Object.values(getToolGalaxyUsageStats(tool)?.usage || {}).some(
              (val) => val > 0,
            ) ||
            Object.values(getToolGalaxyUsageStats(tool)?.users || {}).some(
              (val) => val > 0,
            )
          "
        >
          <h3 class="mb-2 flex items-center text-lg font-semibold">
            <Icon name="uil:chart" class="mr-2 text-lg" />
            Galaxy Usage
          </h3>

          <div class="flex flex-col gap-2">
            <InlineInfo
              title="Usage (5 Years)"
              :info="getToolGalaxyUsageStats(tool).usage.last5Years"
            />
            <InlineInfo
              title="Usage (All time)"
              :info="getToolGalaxyUsageStats(tool).usage.allTime"
            />
            <InlineInfo
              title="Users (5 Years)"
              :info="getToolGalaxyUsageStats(tool).users.last5Years"
            />
            <InlineInfo
              title="Users (All time)"
              :info="getToolGalaxyUsageStats(tool).users.allTime"
            />
          </div>
        </UCard>
      </div>

      <div class="w-full lg:w-2/3">
        <InfoCard title-icon="uil:rocket" v-if="galaxyInstanceTabs.length > 0">
          <template v-slot:title>
            <span>
              Run in
              <NuxtLink
                target="_blank"
                to="https://galaxyproject.org/"
                class="hover:text-blue-600 hover:underline dark:hover:text-blue-400"
              >
                Galaxy
                <Icon
                  class="ml-1 inline-block"
                  name="uil:external-link-alt"
                  size="md"
                />
              </NuxtLink>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                (An academic portal to run tools, workflows and manage your
                data)
              </span>
            </span>
          </template>

          <div class="flex w-full flex-col gap-2">
            <div class="text-gray-600 dark:text-gray-300">
              This tool is available on the following Galaxy instances.
            </div>

            <UTabs
              :items="galaxyInstanceTabs"
              class="w-full"
              :ui="{ label: 'cursor-pointer' }"
            >
              <template #content="{ item }">
                <div class="flex flex-wrap gap-2 px-1">
                  <UTooltip
                    v-for="toolId in getToolToolIds(tool)"
                    :key="toolId"
                    :delay-duration="500"
                    :text="`Run ${toolId} in ${item.label}`"
                  >
                    <NuxtLink
                      target="_blank"
                      :to="`https://usegalaxy.${item.key}/?tool_id=${toolId}`"
                      class="text-lg font-semibold"
                    >
                      <UBadge
                        variant="subtle"
                        color="primary"
                        trailing-icon="uil:external-link-alt"
                        size="lg"
                        class="lg:text-md text-sm"
                      >
                        <img
                          class="light:bg-gray-800 light:border light:rounded-sm"
                          src="/img/galaxy-icon.png"
                        />

                        Run <span class="font-mono">{{ toolId }}</span>
                      </UBadge>
                    </NuxtLink>
                  </UTooltip>
                </div>
              </template>
            </UTabs>
          </div>
        </InfoCard>

        <InfoCard title-icon="uil:box" v-if="getToolBicondaData(tool).name">
          <template v-slot:title>
            Install with Bioconda
            <NuxtLink
              target="_blank"
              :to="`https://bioconda.github.io/recipes/${getToolBicondaData(tool).name.toLowerCase()}/README.html`"
            >
              <img
                class="ml-2"
                src="https://img.shields.io/badge/install%20with-bioconda-brightgreen.svg?style=flat"
                alt="Install with Bioconda"
              />
            </NuxtLink>
          </template>

          <template v-slot:content>
            <div>
              <CodBlock
                :code="`conda install -c conda-forge -c bioconda ${getToolName(tool).toLowerCase()}`"
              />
            </div>
          </template>
        </InfoCard>

        <InfoCard
          title-icon="uil:box"
          v-if="getToolBiocontainersData(tool).name"
        >
          <template v-slot:title>
            Install with Biocontainers
            <NuxtLink
              target="_blank"
              :to="`https://quay.io/repository/biocontainers/${getToolBiocontainersData(tool).name.toLowerCase()}?tab=tags&tag=latest`"
            >
              <img
                class="ml-2"
                src="https://img.shields.io/badge/link%20to-biocontainers-brightgreen.svg?style=flat"
                alt="Link to Biocontainers"
              />
            </NuxtLink>
          </template>

          <template v-slot:content>
            <div>
              <CodBlock
                :code="`docker run -i -t --rm quay.io/biocontainers/${getToolName(tool).toLowerCase()}:${getToolVersion(tool).toLowerCase()} bash`"
              />
            </div>
          </template>
        </InfoCard>

        <InfoCard
          title="Install with Singularity"
          title-icon="uil:box"
          v-if="getToolBicondaData(tool).name"
        >
          <template v-slot:content>
            <div>
              <CodBlock
                :code="`singularity exec https://depot.galaxyproject.org/singularity/${getToolName(tool).toLowerCase()}:${getToolVersion(tool).toLowerCase()} bash`"
              />
            </div>
          </template>
        </InfoCard>

        <InfoCard
          v-if="getToolPublications(tool).length > 0"
          title="Publications"
          title-icon="uil:book-open"
        >
          <UTooltip
            v-for="publication in getToolPublications(tool)"
            :key="publication"
            :delay-duration="500"
            text="Click to view publication"
          >
            <NuxtLink target="_blank" :to="getLinkURL(publication)">
              <UBadge
                class="lg:text-md text-sm text-gray-600 dark:text-gray-300"
                variant="subtle"
                color="primary"
                :trailing-icon="`uil:external-link-alt`"
                icon="uil:book-alt"
              >
                {{ publication }}
              </UBadge>
            </NuxtLink>
          </UTooltip>
        </InfoCard>

        <InfoCard
          v-if="getToolTrainingMaterials(tool).length > 0"
          title="Galaxy Training Materials"
          title-icon="uil:graduation-cap"
        >
          <UTooltip
            v-for="tutorial in getToolTrainingMaterials(tool)"
            :key="tutorial"
            :delay-duration="500"
            text="Click to view tutorial"
          >
            <NuxtLink target="_blank" :to="getLinkURL(tutorial)">
              <UBadge
                class="lg:text-md text-sm text-gray-600 dark:text-gray-300"
                variant="subtle"
                color="primary"
                :trailing-icon="`uil:external-link-alt`"
                icon="uil:book-reader"
              >
                {{
                  tutorial?.startsWith("http")
                    ? tutorial
                        .split("/")
                        .find((_, idx, arr) => arr[idx - 1] === "tutorials")
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                    : tutorial
                }}
              </UBadge>
            </NuxtLink>
          </UTooltip>
        </InfoCard>

        <GalaxyWorkflows :tool="tool" />

        <UCard class="mb-3 break-words">
          <div class="flex flex-wrap gap-x-8 gap-y-4">
            <InlineInfo
              title="Galaxy ToolShed ID"
              :info="getToolToolshedData(tool).id"
            />
            <InlineInfo
              title="Galaxy ToolShed Categories"
              :info="getToolToolshedData(tool).categories[0]"
            >
              <div
                class="flex flex-wrap gap-2"
                v-if="getToolToolshedData(tool).categories.length > 0"
              >
                <UBadge
                  v-for="category in getToolToolshedData(tool).categories"
                  :key="category"
                  variant="subtle"
                  color="neutral"
                >
                  {{ category }}
                </UBadge>
              </div>
            </InlineInfo>

            <InlineInfo
              title="BioTools Name"
              :info="getToolBioToolsData(tool).name"
            />
            <InlineInfo title="BioTools IDs">
              <div
                class="flex flex-wrap gap-2"
                v-if="getToolBioToolsData(tool).ids?.length"
              >
                <template
                  v-if="typeof getToolBioToolsData(tool).ids === 'string'"
                >
                  <UBadge variant="subtle" color="neutral">
                    {{ getToolBioToolsData(tool).ids }}
                  </UBadge>
                </template>
                <template v-else-if="getToolBioToolsData(tool).ids.length > 0">
                  <UBadge
                    v-for="id in getToolBioToolsData(tool).ids"
                    :key="id"
                    variant="subtle"
                    color="neutral"
                  >
                    {{ id }}
                  </UBadge>
                </template>
              </div>
            </InlineInfo>

            <InlineInfo
              title="Conda Name"
              :info="getToolCondaData(tool).name"
            />
            <InlineInfo
              title="Conda Version"
              :info="getToolCondaData(tool).version"
            />
          </div>
        </UCard>
      </div>
    </div>
    <div
      v-else-if="loading"
      class="flex h-full w-full items-center justify-center"
    >
      <ToolPlaceHolder />
    </div>
    <div v-else class="flex h-full w-full items-center justify-center">
      <p class="text-gray-500">Tool not found or data is unavailable.</p>
    </div>
  </div>
</template>
