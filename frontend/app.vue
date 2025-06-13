<template>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" rel="stylesheet">

  <head>
    <title>RSE Metadata Explorer</title>
    <link rel="icon" href="./public/logo-rsec.svg" />
  </head>
  <v-app>
    <v-container fluid>
      <!-- Header -->
      <v-app-bar color="secondary" elevate-on-scroll flat>
        <!-- Logo -->
        <NuxtLink to="/" class="header-logo">
          <img src="./public/logo-rsec.svg" alt="RSE Logo" class="logo-image" />
        </NuxtLink>

        <!-- Title -->
        <NuxtLink to="/" class="header-title">
          RSE Metadata Explorer
        </NuxtLink>

        <!-- GitHub Link -->
        <div class="github-link" @click="goToGitHub">
          <i class="fab fa-github"></i>
          <span>GitHub</span>
        </div>
      </v-app-bar>

      <!-- Page Content -->
      <v-main class="main-content">
        <NuxtPage />
      </v-main>

      <!-- Footer -->
      <v-footer color="secondary" inset app>
        <v-row justify="center" align="center">
          <v-col cols="12" class="text-center">
            <span>A webapp to browse through all the bio tools and containers in the <b>Research Software Ecosystem</b>
              repository.</span>
          </v-col>
        </v-row>
      </v-footer>
    </v-container>
  </v-app>
</template>

<script setup>
const goToGitHub = () => {
  window.open(
    'https://github.com/research-software-ecosystem/research-software-ecosystem.github.io',
    '_blank'
  );
};
</script>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
}

.v-app-bar {
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
}

.v-footer {
  box-shadow: 2px -2px 6px rgba(0, 0, 0, 0.1);
}

.header-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-left: 10px;
  color: #333333;
  cursor: pointer;
  text-decoration: none;
}

.header-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20px;
}

.logo-image {
  height: 50px;
  width: auto;
}

.github-link {
  position: absolute;
  right: 20px;
  display: flex;
  align-items: center;
  color: #333333;
  font-size: 16px;
  font-weight: bold;
  gap: 5px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.github-link i {
  font-size: 18px;
  background-color: #333333;
  color: #f5f5f5;
  padding: 5px;
  border-radius: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.github-link:hover {
  color: #555555;
}

.github-link i:hover {
  background-color: #555555;
}

.main-content {
  margin: 80px 20px 60px 20px;
  padding: 18px;
  border-radius: 4px;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
  background: #f5f5f5;
}
</style>
