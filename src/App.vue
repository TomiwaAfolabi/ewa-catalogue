<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const layouts: Record<string, any> = { DefaultLayout }
const route = useRoute()
const layout = computed(
  () => layouts[route.meta.layout as string] ?? DefaultLayout
)
</script>

<template>
  <component :is="layout">
    <router-view v-slot="{ Component, route: r }" :key="route.fullPath">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="r.fullPath" />
      </transition>
    </router-view>
  </component>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
