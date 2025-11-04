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
        content: 'max-w-(--ui-container) h-(--ui-container)',
        footer: 'justify-end',
      }"
    >
      <UTooltip :delay-duration="0" text="View Tool Source">
        <UButton
          variant="outline"
          color="primary"
          class="cursor-pointer"
          icon="uil:code"
          @click="toggleToolSourceModal"
        />
      </UTooltip>

      <template v-slot:body>
        <ToolSourceContent :tool="props.tool" />
      </template>

      <template v-slot:footer>
        <UButton variant="outline" @click="toggleToolSourceModal">
          Close
        </UButton>
      </template>
    </UModal>
  </div>
</template>
