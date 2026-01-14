<script setup lang="ts">
interface Props {
  toolCount?: number;
  collectionCount?: number;
}

withDefaults(defineProps<Props>(), {
  toolCount: 0,
  collectionCount: 0,
});
</script>

<template>
  <div class="relative overflow-hidden">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <!-- Header Section -->
      <div class="text-center">
        <!-- Logo and Title -->
        <div class="mb-4 flex items-center justify-center gap-4">
          <div
            class="border-primary-500 dark:border-primary-400 flex h-16 w-16 items-center justify-center rounded-full border-4"
          >
            <span
              class="text-primary-600 dark:text-primary-400 text-3xl font-bold"
              >8</span
            >
          </div>
          <div class="text-left">
            <h1
              class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white"
            >
              Research Software
            </h1>
            <h2
              class="text-primary-600 dark:text-primary-400 text-3xl font-semibold sm:text-4xl"
            >
              Ecosystem
            </h2>
          </div>
        </div>

        <!-- Stats -->
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span class="font-semibold"
            >{{ toolCount.toLocaleString() }} TOOLS</span
          >
          <span class="mx-2">·</span>
          <span class="font-semibold">{{ collectionCount }} COLLECTIONS</span>
        </p>
      </div>

      <!-- Search Bar Section -->
      <div class="mx-auto mt-12 max-w-2xl">
        <slot name="search" />
      </div>

      <!-- Main Tagline -->
      <div class="mt-16 text-center">
        <h3
          class="text-3xl font-bold text-purple-700 sm:text-4xl dark:text-purple-400"
        >
          YOUR TOOLS MATTER
        </h3>
      </div>

      <!-- Action Buttons -->
      <div
        class="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3"
      >
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
