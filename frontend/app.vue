<script setup lang="ts">
const colorMode = useColorMode();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

useHead({
  titleTemplate: (titleChunk) => {
    const appTitle = runtimeConfig.public.appTitle;
    return titleChunk && titleChunk !== appTitle ? `${appTitle} | ${titleChunk}` : appTitle;
  }
});

const contentRepoBase =
  "https://github.com/research-software-ecosystem/content/tree/master/data";
const sourceRepoBase =
  "https://github.com/research-software-ecosystem/RSEc-Atlas";

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set(_isDark) {
    colorMode.preference = _isDark ? "dark" : "light";
  },
});

const logoSrc = computed(() => {
  return isDark.value
    ? "https://raw.githubusercontent.com/research-software-ecosystem/graphics/refs/heads/main/RSEc_Logo_FULL_mono.png"
    : "https://raw.githubusercontent.com/research-software-ecosystem/graphics/refs/heads/main/RSEc_Logo_FULL_RGB.png";
});

const toolId = computed(() => {
  const idParam = route.params.id;
  if (Array.isArray(idParam)) return idParam[0] || "";
  return typeof idParam === "string" ? idParam : "";
});

const githubLink = computed(() => {
  if (toolId.value) {
    return `${contentRepoBase}/${encodeURIComponent(toolId.value)}`;
  }

  return sourceRepoBase;
});
</script>

<template>
  <UApp class="flex flex-col font-sans">
    <header
      class="sticky top-0 z-50 bg-gray-50 px-6 py-2 shadow-md dark:bg-gray-900"
    >
      <nav>
        <div class="flex justify-between">
          <NuxtLink
            to="/"
            class="text-md flex items-center gap-2 font-bold md:text-2xl"
          >
            <img class="h-8 w-auto" alt="RSEc Logo" :src="logoSrc" />

            <span>RSEc Atlas</span>
          </NuxtLink>

          <div class="flex items-center justify-end gap-1">
            <ClientOnly v-if="!colorMode?.forced">
              <UButton
                :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
                color="neutral"
                variant="ghost"
                @click="isDark = !isDark"
              />

              <template v-slot:fallback>
                <div class="size-8" />
              </template>
            </ClientOnly>

            <UButton
              target="_blank"
              icon="i-lucide-github"
              :to="githubLink"
              color="neutral"
              variant="subtle"
            >
              <span class="hidden md:inline-block"> View on Github </span>
            </UButton>
          </div>
        </div>
      </nav>
    </header>

    <main
      class="overflow-y-auto bg-gray-50 px-2 pt-3 pb-20 lg:px-5 lg:pt-5 dark:bg-gray-900"
    >
      <NuxtPage />
    </main>

    <footer
      class="fixed bottom-0 w-full bg-gray-100 p-2 shadow-amber-50 md:p-2 dark:bg-gray-800"
    >
      <div>
        <p
          class="text-center text-xs text-gray-500 md:text-sm dark:text-gray-400"
        >
          A webapp to browse through all the entries in the
          <NuxtLink
            target="_blank"
            class="font-bold transition-all hover:text-gray-700 dark:hover:text-gray-300"
            to="https://research-software-ecosystem.github.io"
          >
            Research Software Ecosystem
          </NuxtLink>
          repository.
        </p>
      </div>
    </footer>
  </UApp>
</template>
