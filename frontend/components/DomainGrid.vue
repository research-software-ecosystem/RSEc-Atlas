<script setup lang="ts">
interface DomainCategory {
  name: string;
  color: string;
  subcategories: string[];
}

interface Props {
  domains?: DomainCategory[];
}

withDefaults(defineProps<Props>(), {
  domains: () => [],
});

const emit = defineEmits<{
  categoryClick: [category: string];
}>();

const handleCategoryClick = (category: string) => {
  emit("categoryClick", category);
};

// Get color classes
const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; border: string; text: string }> =
    {
      blue: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        border: "border-blue-500 dark:border-blue-400",
        text: "text-blue-700 dark:text-blue-300",
      },
      green: {
        bg: "bg-green-100 dark:bg-green-900/30",
        border: "border-green-500 dark:border-green-400",
        text: "text-green-700 dark:text-green-300",
      },
      teal: {
        bg: "bg-teal-100 dark:bg-teal-900/30",
        border: "border-teal-500 dark:border-teal-400",
        text: "text-teal-700 dark:text-teal-300",
      },
      yellow: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        border: "border-yellow-500 dark:border-yellow-400",
        text: "text-yellow-700 dark:text-yellow-300",
      },
      purple: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        border: "border-purple-500 dark:border-purple-400",
        text: "text-purple-700 dark:text-purple-300",
      },
      pink: {
        bg: "bg-pink-100 dark:bg-pink-900/30",
        border: "border-pink-500 dark:border-pink-400",
        text: "text-pink-700 dark:text-pink-300",
      },
      gray: {
        bg: "bg-gray-100 dark:bg-gray-900/30",
        border: "border-gray-500 dark:border-gray-400",
        text: "text-gray-700 dark:text-gray-300",
      },
    };

  return colorMap[color] || colorMap.gray;
};
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
      <div
        v-for="(domain, index) in domains"
        :key="index"
        class="flex flex-col gap-2"
      >
        <!-- Domain Header -->
        <button
          type="button"
          :class="[
            'rounded-lg border-2 p-4 text-center font-bold tracking-wide uppercase transition-all hover:scale-105',
            getColorClasses(domain.color).border,
            getColorClasses(domain.color).bg,
            getColorClasses(domain.color).text,
          ]"
          @click="handleCategoryClick(domain.name)"
        >
          {{ domain.name }}
        </button>

        <!-- Subcategories -->
        <div class="flex flex-col gap-1.5">
          <button
            v-for="(subcategory, subIndex) in domain.subcategories"
            :key="subIndex"
            type="button"
            :class="[
              'rounded border px-2 py-1.5 text-xs font-medium transition-all hover:scale-105',
              getColorClasses(domain.color).border,
              getColorClasses(domain.color).bg,
              getColorClasses(domain.color).text,
            ]"
            @click="handleCategoryClick(subcategory)"
          >
            {{ subcategory }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
