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
  <link
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
    rel="stylesheet"
  />

  <UApp class="bg-chicago-50 flex h-dvh flex-col font-sans">
    <header
      class="sticky top-0 z-50 bg-white px-6 py-2 shadow-sm dark:bg-gray-900"
    >
      <nav>
        <div class="flex flex-col justify-between sm:flex-row">
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

            <NuxtLink
              target="_blank"
              role="button"
              to="https://github.com/research-software-ecosystem/research-software-ecosystem.github.io"
              class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 p-2 text-center text-sm font-medium transition-all hover:bg-black hover:text-white hover:shadow-lg focus:ring-4 focus:ring-[#24292F]/50 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-500"
            >
              <Icon name="uil-github" class="h-4 w-4" />

              <span class="hidden md:inline-block"> View on Github </span>
            </NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <main class="overflow-y-auto px-5 pt-5 pb-20 md:px-10">
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
