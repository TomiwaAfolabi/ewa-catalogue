
<script setup lang="ts">
import { ref, computed } from 'vue'
  import { RouterLink, RouterView,useRoute } from 'vue-router'
  import DefaultLayout from './layouts/DefaultLayout.vue';
const route = useRoute()
const layouts:any  ={DefaultLayout};
const layout = computed(() => layouts[route.meta.layout as string] || DefaultLayout)
</script>

<template>
   <component :is="layout">
    <router-view/>
   </component>

</template>

<style scoped></style>
