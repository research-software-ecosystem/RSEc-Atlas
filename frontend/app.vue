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
    <header class="px-6 py-2">
      <nav>
        <div class="flex justify-between">
          <NuxtLink to="/" class="flex items-center gap-2 text-2xl font-bold">
            <img
              class="h-10 w-auto"
              alt="RSE Logo"
              src="./public/logo-rsec.svg"
            />

            <span>RSE Metadata Explorer</span>
          </NuxtLink>

          <div class="flex items-center gap-2">
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
              class="inline-flex cursor-pointer items-center rounded-lg bg-[#24292F] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#24292F]/90 focus:ring-4 focus:ring-[#24292F]/50 focus:outline-none dark:hover:bg-[#050708]/30 dark:focus:ring-gray-500"
            >
              <Icon name="uil-github" class="me-2 h-4 w-4" />

              View on Github
            </NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <main class="overflow-y-auto px-10 pt-5 pb-20">
      <NuxtPage />
    </main>

    <footer
      class="fixed bottom-0 w-full bg-gray-100 p-3 shadow-amber-50 dark:bg-gray-800"
    >
      <div>
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          A webapp to browse through all the bio tools and containers in the
          <b>Research Software Ecosystem</b> repository.
        </p>
      </div>
    </footer>
  </UApp>
</template>
