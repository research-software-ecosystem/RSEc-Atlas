<script setup lang="ts">
const emit = defineEmits<{
  search: [query: string];
}>();

const searchQuery = ref("");

const handleSearch = () => {
  emit("search", searchQuery.value);
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    handleSearch();
  }
};
</script>

<template>
  <div class="relative">
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <UInput
          v-model="searchQuery"
          size="xl"
          :ui="{ base: 'text-3xl py-4' }"
          placeholder="Search tools, topics, domains..."
          icon="i-lucide-search"
          class="w-full"
          @keypress="handleKeyPress"
        >
          <template v-slot:trailing>
            <UButton
              v-if="searchQuery"
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              size="xs"
              :padded="false"
              @click="searchQuery = ''"
            />
          </template>
        </UInput>
      </div>
      <UButton
        icon="i-lucide-search"
        size="xl"
        :ui="{ base: 'text-3xl py-4' }"
        label="Search"
        @click="handleSearch"
      />
    </div>
    <div class="mt-2 text-right">
      <NuxtLink
        to="/search"
        class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-xs font-semibold tracking-wide uppercase"
      >
        Advanced Search →
      </NuxtLink>
    </div>
  </div>
</template>
