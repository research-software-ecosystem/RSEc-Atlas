<script setup lang="ts">
interface Props {
  label: string;
  description: string;
  icon?: string;
  to?: string;
  color?: string;
}

withDefaults(defineProps<Props>(), {
  icon: "i-lucide-box",
  to: "#",
  color: "primary",
});
</script>

<template>
  <NuxtLink
    :to="to"
    class="group relative flex min-h-[160px] flex-col items-center justify-center rounded-xl border-4 border-gray-800 bg-white p-6 text-center transition-all hover:scale-105 hover:shadow-xl dark:border-gray-300 dark:bg-gray-800"
  >
    <UIcon
      v-if="icon"
      :name="icon"
      class="mb-3 h-8 w-8 text-gray-700 dark:text-gray-300"
    />
    <h4
      class="text-lg font-bold tracking-wide text-gray-900 uppercase dark:text-white"
    >
      {{ label }}
    </h4>
    <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
      {{ description }}
    </p>
  </NuxtLink>
</template>
