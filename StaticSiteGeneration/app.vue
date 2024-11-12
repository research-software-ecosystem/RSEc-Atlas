<template>
  <v-app>
    <v-container fluid>
      <!-- Header -->
      <v-app-bar color="secondary" dark elevate-on-scroll>
        <v-app-bar-title>Metadata Explorer</v-app-bar-title>
      </v-app-bar>

      <!-- Page Content -->
      <v-main>
        <NuxtPage />
      </v-main>

      <!-- Footer -->
      <v-footer color="secondary" dark inset app>
        <v-row justify="center" align="center">
          <v-col cols="12" class="text-center">
            <span>A webapp to browse through all the bio tools and containers.</span>
          </v-col>
        </v-row>
      </v-footer>
    </v-container>
  </v-app>
</template>

<script setup>
// No additional script needed as Vuetify handles layout with its components.
</script>

<style scoped>
.v-app-bar-title {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
