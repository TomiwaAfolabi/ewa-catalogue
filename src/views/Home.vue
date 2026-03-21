<script setup lang="ts">
import { onMounted,onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router =useRouter()
onMounted(()=>{
    const getUser =sessionStorage.getItem('reroute')
  if(getUser=='true') return
  router.push({name:'catalogue-home'}) 
  sessionStorage.setItem('reroute','true')
})
</script>

<template>
<div class="w-full h-screen flex justify-center items-center">
    <div class="w-full relative h-full flex justify-center items-center p-4">
     <div class=" w-full sm:w-96 rounded-lg border-2 homepageHeight  ">
    </div>
    <div class="absolute homepageText items-center">
    <div class="relative flex justify-center mb-4">
        <img src="/logo/EwaLogo.jpg" class="w-40 h-40 rounded-lg items-center"/>
    </div>
     <p  >Official Website Coming Soon...</p>
    </div>
    </div>
    
</div>

</template>

<style scoped>
.homepageHeight{
    height:50%;
   background-color: #5d6658;
    border-color: #ffffe3;
     opacity:55%;
     
      @media screen and (max-width: 667px)  { 
       height: 70%;
    }
}
.homepageText{
color: #C4D8E2;
}
</style>