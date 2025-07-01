<script setup lang="ts">
const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set(_isDark) {
    colorMode.preference = _isDark ? "dark" : "light";
  },
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
            <img
              class="h-5 w-auto md:h-8"
              alt="RSE Logo"
              src="/img/logo-rsec.svg"
            />

            <span>RSEc Atlas</span>
          </NuxtLink>

          <div class="flex items-center justify-end gap-1">
            <ClientOnly v-if="!colorMode?.forced" class="cursor-pointer">
              <UButton
                :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
                color="neutral"
                variant="ghost"
                @click="isDark = !isDark"
              />

              <template #fallback>
                <div class="size-8" />
              </template>
            </ClientOnly>

            <UButton
              target="_blank"
              icon="i-lucide-github"
              to="https://github.com/research-software-ecosystem/content"
              color="neutral"
              variant="subtle"
              class="cursor-pointer"
            >
              <span class="hidden md:inline-block"> View on Github </span>
            </UButton>
          </div>
        </div>
      </nav>
    </header>

    <main
      class="overflow-y-auto bg-gray-50 px-5 pt-5 pb-20 md:px-10 dark:bg-gray-900"
    >
      <NuxtPage />
    </main>

    <footer
      class="fixed bottom-0 w-full bg-gray-100 p-3 shadow-amber-50 dark:bg-gray-800"
    >
      <div>
        <p
          class="text-center text-xs text-gray-500 md:text-sm dark:text-gray-400"
        >
          A webapp to browse through all the bio tools and containers in the
          <NuxtLink
            target="_blank"
            class="font-bold transition-all hover:text-gray-700 dark:hover:text-gray-300"
            to="https://github.com/research-software-ecosystem/research-software-ecosystem.github.io?tab=readme-ov-file"
          >
            Research Software Ecosystem
          </NuxtLink>
          repository.
        </p>
      </div>
    </footer>
  </UApp>
</template>
