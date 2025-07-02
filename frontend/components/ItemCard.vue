<script setup lang="ts">
interface Props {
  tool: Tool;
}

const props = defineProps<Props>();

const { isFavoriteTool, toggleFavoriteTool } = useToolsStore();

const toolName = computed(() => {
  return getToolName(props.tool);
});
const version = computed(() => {
  return getToolVersion(props.tool);
});
const description = computed(() => {
  return getToolDescription(props.tool);
});
const license = computed(() => {
  return getToolLicense(props.tool);
});
const isFavorite = computed(() => {
  return isFavoriteTool(getToolName(props.tool));
});
const lastUpdate = computed(() => {
  return getToolLastUpdateDate(props.tool);
});

function toggleFavorite() {
  toggleFavoriteTool(getToolName(props.tool));
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
              class="cursor-pointer"
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
              class="cursor-default"
            >
              {{ license }}
            </UBadge>
          </UTooltip>

          <UTooltip :delay-duration="250" text="Last updated">
            <UBadge
              icon="uil:calendar-alt"
              variant="subtle"
              class="cursor-default"
            >
              {{ lastUpdate }}
            </UBadge>
          </UTooltip>
        </div>
      </div>

      <span>
        {{ description }}
      </span>
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
