<script setup lang="ts">
interface Props {
  tool: ToolIndexEntry;
  // The descriptions load after the index.
  descriptionLoading?: boolean;
}

const props = defineProps<Props>();

const { isFavoriteTool, toggleFavoriteTool } = useToolsStore();

const toolName = computed(() => props.tool.name);
const version = computed(() => props.tool.version);
const description = computed(() => props.tool.description);
const license = computed(() => props.tool.license);
const isFavorite = computed(() => {
  return isFavoriteTool(props.tool);
});
const lastUpdate = computed(() => {
  const { updated } = props.tool;
  return formateDate(updated === undefined ? "" : updated * 1000);
});

function toggleFavorite() {
  toggleFavoriteTool(props.tool);
}
</script>

<template>
  <UCard :ui="{ body: 'flex h-full flex-col justify-between' }">
    <div>
      <div class="mb-2 break-words">
        <div class="mb-2 flex items-start justify-between gap-2">
          <UButton
            :to="`/tool/${props.tool.tool_name}`"
            variant="link"
            class="hover:text-secondary p-0 text-lg font-bold text-black md:text-xl lg:text-2xl dark:text-white"
          >
            {{ toolName }}
          </UButton>

          <UTooltip
            :delay-duration="0"
            :text="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
          >
            <UButton
              :variant="isFavorite ? 'solid' : 'outline'"
              :color="isFavorite ? 'warning' : 'secondary'"
              icon="uil:star"
              @click="toggleFavorite"
            />
          </UTooltip>
        </div>

        <div class="flex flex-wrap gap-2">
          <UTooltip :delay-duration="250" text="Current tool version">
            <UBadge
              icon="uil:box"
              color="neutral"
              variant="subtle"
              class="cursor-default"
            >
              {{ version }}
            </UBadge>
          </UTooltip>

          <UTooltip :delay-duration="250" text="License type">
            <UBadge
              icon="uil:balance-scale"
              color="secondary"
              variant="subtle"
              class="text-gray-600 dark:text-gray-300"
            >
              {{ license }}
            </UBadge>
          </UTooltip>

          <UTooltip :delay-duration="250" text="Last updated">
            <UBadge
              icon="uil:calendar-alt"
              variant="subtle"
              class="text-gray-600 dark:text-gray-300"
            >
              {{ lastUpdate }}
            </UBadge>
          </UTooltip>
        </div>
      </div>

      <span v-if="description !== undefined">
        {{ description }}
      </span>
      <div v-else-if="descriptionLoading" aria-hidden="true">
        <USkeleton class="mt-2 h-4 w-4/5" />
        <USkeleton class="mt-2 h-4 w-7/12" />
      </div>
    </div>

    <div class="flex justify-end">
      <UTooltip :delay-duration="0" text="View tool details">
        <UButton
          variant="outline"
          color="info"
          icon="uil:info-circle"
          class="mt-4"
          :to="`/tool/${props.tool.tool_name}`"
        >
          View Tool
        </UButton>
      </UTooltip>
    </div>
  </UCard>
</template>
