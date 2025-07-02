<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

interface Props {
  tool: Tool;
}

const props = defineProps<Props>();

const perPage = ref("6");
const currentPage = ref(1);
const searchQuery = ref("");
const searchQueryDebounced = refDebounced(searchQuery, 500);

const workflows = computed(() => getToolWorkflows(props.tool));
const filteredWorkflows = computed(() => {
  const query = searchQueryDebounced.value.toLowerCase().trim();

  if (!query) {
    return workflows.value;
  }

  return workflows.value.filter((workflow) =>
    workflow.name.toLowerCase().includes(query),
  );
});
const paginatedWorkflows = computed(() => {
  const start = (currentPage.value - 1) * Number(perPage.value);
  const end = start + Number(perPage.value);
  return filteredWorkflows.value.slice(start, end);
});

watch(searchQueryDebounced, () => {
  currentPage.value = 1;
});
</script>

<template>
  <InfoCard
    title="Galaxy Workflows"
    title-icon="uil:sitemap"
    v-if="workflows.length > 0"
  >
    {{ workflows.length }} Galaxy workflows are available for this tool.

    <UInput
      icon="i-lucide-search"
      size="xl"
      class="mb-2 w-full"
      variant="outline"
      placeholder="Search Workflows by name"
      v-model="searchQuery"
    />

    <div v-if="paginatedWorkflows.length > 0">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <UCard
          v-for="wf in paginatedWorkflows"
          :key="wf.name + wf.latest_version + wf.create_time"
          variant="subtle"
          :ui="{
            body: 'p-2 sm:p-4 flex flex-col justify-between gap-1 h-full',
          }"
        >
          <NuxtLink
            target="_blank"
            :to="getLinkURL(wf?.link)"
            class="hover:text-secondary text-md flex flex-col justify-between gap-1 font-semibold sm:text-lg"
          >
            <UTooltip :delay-duration="250" text="View Workflow">
              <span class="break-all">
                <Icon name="uil:sitemap" />

                {{ wf.name }}

                <Icon name="uil:external-link-alt" />
              </span>
            </UTooltip>
          </NuxtLink>

          <div class="flex flex-wrap items-center gap-2">
            <UTooltip :delay-duration="250" text="Workflow Version">
              <UBadge icon="uil:box" color="neutral" variant="subtle">
                {{ wf?.latest_version }}
              </UBadge>
            </UTooltip>

            <UTooltip :delay-duration="250" text="Created on">
              <UBadge icon="uil:calendar-alt" variant="subtle">
                {{ wf.create_time || "N/A" }}
              </UBadge>
            </UTooltip>
          </div>
        </UCard>
      </div>

      <UPagination
        v-if="filteredWorkflows.length > Number(perPage)"
        class="mt-4 flex w-full justify-center"
        :ui="{ list: 'flex-wrap ' }"
        :total="filteredWorkflows.length"
        :items-per-page="Number(perPage)"
        v-model:page="currentPage"
        show-edges
      />
    </div>
    <p v-else class="text-lg text-gray-500">
      No workflows found matching your search criteria.
    </p>
  </InfoCard>
</template>
