<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import EwaPageSpinner from '@/components/ui/EwaPageSpinner.vue'
import EwaToastStack from '@/components/ui/EwaToastStack.vue'
import { useNavigationLoadingStore } from '@/stores/navigationLoadingStore'

const layouts: Record<string, any> = { DefaultLayout }
const route = useRoute()
const layout = computed(
  () => layouts[route.meta.layout as string] ?? DefaultLayout,
)

const navLoading = useNavigationLoadingStore()
const { active: navRouteLoading } = storeToRefs(navLoading)
</script>

<template>
  <component :is="layout">
    <router-view v-slot="{ Component, route: r }" :key="route.fullPath">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="r.fullPath" />
      </transition>
    </router-view>
  </component>

  <Teleport to="body">
    <EwaPageSpinner
      v-if="navRouteLoading"
      variant="overlay"
      size="lg"
      label="Loading page. Please wait."
      message="Gathering the view"
    />
  </Teleport>

  <EwaToastStack />
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
