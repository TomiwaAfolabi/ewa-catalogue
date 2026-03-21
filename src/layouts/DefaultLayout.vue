<script setup lang="ts">
  import NavBar from '@/components/navbar/nav-bar.vue';
</script>

<template>
  <main class="h-screen bg-[url(/default-homepage-snapshots/ewa-default-homepage.jpg)] bg-center ">
    <NavBar/>
     <slot/>
  </main>
  <footer class="text-white footer h-20 flex justify-center items-center relative"><div class="absolute">© Ewa 2025</div></footer>
</template>
<style scoped>
.footer{
    background-color: #d5c58a;
    opacity: 80%;

 
}
</style>