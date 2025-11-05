<script setup lang="ts">
interface Props {
  tool: Tool;
}

const props = defineProps<Props>();

const isModalOpen = ref(false);

function toggleToolSourceModal() {
  isModalOpen.value = !isModalOpen.value;
}
</script>

<template>
  <div>
    <UModal
      v-model="isModalOpen"
      :title="`View Source for ${props.tool.tool_name}`"
      :ui="{
        body: 'p-0 sm:p-0',
        content: 'max-w-(--ui-container) h-(--ui-container)',
        footer: 'justify-end',
      }"
    >
      <UTooltip :delay-duration="0" text="View Tool Source">
        <UButton
          variant="outline"
          color="primary"
          icon="uil:code"
          @click="toggleToolSourceModal"
        />
      </UTooltip>

      <template v-slot:body>
        <ToolSourceContent :tool="props.tool" />
      </template>
    </UModal>
  </div>
</template>
