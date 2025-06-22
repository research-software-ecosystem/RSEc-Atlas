<script setup lang="ts">
interface Props {
  title?: string;
  titleIcon?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <UCard class="mb-3">
    <h3 class="mb-2 flex flex-wrap items-center text-lg font-semibold">
      <Icon
        v-if="props.titleIcon"
        :name="props.titleIcon"
        class="mr-2 text-lg"
      />

      <slot name="title">
        {{ props.title }}
      </slot>
    </h3>

    <slot name="content">
      <div class="flex flex-wrap gap-2">
        <slot />
      </div>
    </slot>
  </UCard>
</template>
