<script setup lang="ts">
import AppNavBar from '@/components/layout/AppNavBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="site-wrapper">
    <AppNavBar />
    <main class="site-main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.site-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--ivory);
}

.site-main {
  flex: 1;
  background-image: url('/default-homepage-snapshots/ewa-default-homepage.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}
</style>
