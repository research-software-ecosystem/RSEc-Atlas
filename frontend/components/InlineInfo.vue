<script setup lang="ts">
interface Props {
  title: string;
  info?: string | number;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 text-sm">
    <span class="font-semibold"> {{ props.title }}: </span>

    <span class="text-gray-600 dark:text-gray-300">
      <slot>
        {{ props.info || "No information available." }}
      </slot>
    </span>
  </div>
</template>
