<script setup lang="ts">
function badges() {
  return ["w-12", "w-18", "w-28"].sort(() => Math.random() - 0.5);
}

function description() {
  return ["w-4/5", "w-3/12", "w-7/12"].sort(() => Math.random() - 0.5);
}
</script>

<template>
  <div class="flex w-full flex-col gap-4 lg:flex-row">
    <div class="w-full lg:w-1/3">
      <UCard
        v-for="i in [1, 2, 3]"
        class="mb-4 h-fit"
        :ui="{ body: 'flex flex-col gap-2 justify-between' }"
      >
        <div class="flex flex-col gap-2">
          <USkeleton class="h-4 w-48" />

          <div class="flex gap-2">
            <USkeleton v-for="i in badges()" :key="i" class="h-4" :class="i" />
          </div>
        </div>

        <div class="mt-2 flex flex-col gap-4">
          <USkeleton
            v-for="i in description()"
            :key="i"
            class="h-4"
            :class="i"
          />
        </div>
      </UCard>
    </div>

    <div class="w-full lg:w-2/3">
      <UCard
        v-for="i in [1, 2, 3, 4]"
        class="mb-4"
        :key="i"
        :ui="{ body: 'flex flex-col gap-2 justify-between' }"
      >
        <div class="flex flex-col gap-2">
          <USkeleton class="h-4 w-48" />

          <div class="flex gap-2">
            <USkeleton v-for="i in badges()" :key="i" class="h-4" :class="i" />
          </div>
        </div>

        <div class="mt-2 flex flex-col gap-4">
          <USkeleton
            v-for="i in description()"
            :key="i"
            class="h-4"
            :class="i"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>
