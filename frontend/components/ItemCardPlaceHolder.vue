<script setup lang="ts">
const badges = ["w-12", "w-18", "w-28"].sort(() => Math.random() - 0.5);
const description = ["w-4/5", "w-3/12", "w-7/12"].sort(
  () => Math.random() - 0.5,
);
</script>

<template>
  <UCard class="h-64" :ui="{ body: 'flex h-full flex-col justify-between' }">
    <div>
      <div class="mb-4">
        <USkeleton class="h-4 w-48" />

        <div class="flex gap-2">
          <USkeleton v-for="i in badges" :key="i" class="mt-2 h-4" :class="i" />
        </div>
      </div>

      <USkeleton
        v-for="i in description"
        :key="i"
        class="mt-2 h-4"
        :class="i"
      />
    </div>

    <USkeleton class="flex h-8 w-1/5 self-end" />
  </UCard>
</template>
