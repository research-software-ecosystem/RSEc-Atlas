<script setup lang="ts">
useSeoMeta({
  title: "Explore - Research Software Ecosystem",
  description: "Explore research software communities and collections",
});

// Placeholder data for communities and collections
const communities = ref([
  {
    name: "Bioinformatics",
    description: "Tools and software for biological data analysis",
    toolCount: 1234,
    icon: "i-lucide-dna",
    color: "green",
  },
  {
    name: "Astronomy",
    description: "Software for astronomical research and observation",
    toolCount: 567,
    icon: "i-lucide-telescope",
    color: "purple",
  },
  {
    name: "Geosciences",
    description: "Tools for earth and environmental sciences",
    toolCount: 890,
    icon: "i-lucide-globe",
    color: "blue",
  },
  {
    name: "Chemistry",
    description: "Computational chemistry and molecular modeling",
    toolCount: 456,
    icon: "i-lucide-flask-conical",
    color: "yellow",
  },
]);

const collections = ref([
  {
    name: "Galaxy Workflows",
    description: "Curated collection of Galaxy workflow tools",
    toolCount: 234,
    icon: "i-lucide-workflow",
  },
  {
    name: "Machine Learning",
    description: "AI and ML tools for research",
    toolCount: 345,
    icon: "i-lucide-brain",
  },
  {
    name: "Data Visualization",
    description: "Tools for scientific data visualization",
    toolCount: 123,
    icon: "i-lucide-bar-chart",
  },
]);
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="mb-12 text-center">
        <h1
          class="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white"
        >
          Explore Communities & Collections
        </h1>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Discover curated groups of research software organized by domain and
          purpose
        </p>
      </div>

      <section class="mb-16">
        <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Research Communities
        </h2>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <UCard
            v-for="community in communities"
            :key="community.name"
            class="cursor-pointer transition-shadow hover:shadow-lg"
          >
            <div class="text-center">
              <div
                class="bg-primary-100 dark:bg-primary-900/30 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              >
                <UIcon
                  :name="community.icon"
                  class="text-primary-600 dark:text-primary-400 h-8 w-8"
                />
              </div>
              <h3
                class="mb-2 text-lg font-semibold text-gray-900 dark:text-white"
              >
                {{ community.name }}
              </h3>
              <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {{ community.description }}
              </p>
              <p
                class="text-primary-600 dark:text-primary-400 text-xs font-medium"
              >
                {{ community.toolCount.toLocaleString() }} tools
              </p>
            </div>
          </UCard>
        </div>
      </section>

      <section>
        <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Featured Collections
        </h2>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="collection in collections"
            :key="collection.name"
            class="cursor-pointer transition-shadow hover:shadow-lg"
          >
            <div class="flex items-start gap-4">
              <div
                class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <UIcon
                  :name="collection.icon"
                  class="h-6 w-6 text-gray-600 dark:text-gray-400"
                />
              </div>
              <div class="flex-1">
                <h3
                  class="mb-1 text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {{ collection.name }}
                </h3>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  {{ collection.description }}
                </p>
                <p
                  class="text-primary-600 dark:text-primary-400 text-xs font-medium"
                >
                  {{ collection.toolCount }} tools
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <div class="mt-16">
        <UCard
          class="from-primary-50 dark:from-primary-900/20 bg-gradient-to-r to-purple-50 dark:to-purple-900/20"
        >
          <div class="py-8 text-center">
            <UIcon
              name="i-lucide-sparkles"
              class="text-primary-600 dark:text-primary-400 mx-auto mb-4 h-12 w-12"
            />
            <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              More Coming Soon!
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              We're continuously adding new communities and collections. Check
              back regularly for updates.
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
