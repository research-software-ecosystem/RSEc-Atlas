<script setup lang="ts">
interface Props {
  tool: Tool;
}

const props = defineProps<Props>();
</script>

<template>
  <InfoCard
    title="Galaxy Workflows"
    title-icon="uil:sitemap"
    v-if="getToolWorkflows(props.tool).length > 0"
  >
    <UCollapsible
      class="flex w-full flex-col gap-2"
      :ui="{ content: 'flex flex-wrap gap-2 overflow-visible' }"
    >
      <UButton
        leading-icon="uil:arrow-right"
        class="cursor-pointer"
        variant="solid"
        color="primary"
      >
        {{ getToolWorkflows(props.tool).length }} workflows available. Click to
        view.
      </UButton>

      <template #content>
        <UCard
          v-for="workflow in getToolWorkflows(props.tool)"
          :key="workflow.name"
          variant="subtle"
          :ui="{ body: 'p-2 sm:p-4' }"
        >
          <div class="flex flex-col justify-between gap-1">
            <NuxtLink
              target="_blank"
              :to="getLinkURL(workflow?.link)"
              class="hover:text-secondary text-md gap-1 font-semibold sm:text-lg"
            >
              <UTooltip :delay-duration="0" text="View Workflow">
                <span>
                  <Icon name="uil:sitemap" />

                  {{ workflow.name }}

                  <Icon name="uil:external-link-alt" />
                </span>
              </UTooltip>
            </NuxtLink>

            <div class="flex flex-wrap items-center gap-2">
              <UTooltip :delay-duration="250" text="Workflow Version">
                <UBadge icon="uil:box" color="neutral" variant="subtle">
                  {{ workflow?.latest_version }}
                </UBadge>
              </UTooltip>

              <UTooltip :delay-duration="250" text="Created on">
                <UBadge icon="uil:calendar-alt" variant="subtle">
                  {{ workflow.create_time || "N/A" }}
                </UBadge>
              </UTooltip>
            </div>
          </div>
        </UCard>
      </template>
    </UCollapsible>
  </InfoCard>
</template>
